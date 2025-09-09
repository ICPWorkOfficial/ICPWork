import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

persistent actor EscrowCanister {
    
    // Types
    public type EscrowId = Nat;
    public type ICP = Nat64; // ICP amount in e8s (smallest unit)
    
    public type EscrowStatus = {
        #Active;
        #Completed;
        #Cancelled;
        #Expired;
    };
    
    public type EscrowCondition = {
        #TimeDelay: Int; // Unix timestamp when funds can be released
        #ManualApproval: Principal; // Principal who can approve release
        #MultiSig: [Principal]; // Multiple principals required for approval
        #External: Text; // External condition identifier (for custom logic)
    };
    
    public type EscrowDetails = {
        id: EscrowId;
        depositor: Principal;
        beneficiary: Principal;
        amount: ICP;
        condition: EscrowCondition;
        status: EscrowStatus;
        created_at: Int;
        expires_at: ?Int;
        approvals: [Principal]; // For multi-sig conditions
    };
    
    public type CreateEscrowArgs = {
        beneficiary: Principal;
        amount: ICP;
        condition: EscrowCondition;
        expires_at: ?Int;
    };
    
    // State
    private var nextEscrowId: EscrowId = 0;
    private var escrowEntries: [(EscrowId, EscrowDetails)] = [];
    private transient var escrows = HashMap.fromIter<EscrowId, EscrowDetails>(
        escrowEntries.vals(), 
        10, 
        func(a: EscrowId, b: EscrowId): Bool { a == b }, 
        func(a: EscrowId): Nat32 { Int.hash(a) }
    );
    
    // Canister balance tracking
    private var totalHeld: ICP = 0;
    
    // Upgrade hooks
    system func preupgrade() {
        escrowEntries := Iter.toArray(escrows.entries());
    };
    
    system func postupgrade() {
        escrowEntries := [];
    };
    
    // Helper functions
    private func generateEscrowId(): EscrowId {
        let id = nextEscrowId;
        nextEscrowId += 1;
        id
    };
    
    private func getCurrentTime(): Int {
        Time.now()
    };
    
    // Public methods
    
    // Create a new escrow
    public shared(msg) func createEscrow(args: CreateEscrowArgs): async Result.Result<EscrowId, Text> {
        let caller = msg.caller;
        
        // Validate inputs
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot create escrows");
        };
        
        if (args.amount == 0) {
            return #err("Escrow amount must be greater than 0");
        };
        
        if (caller == args.beneficiary) {
            return #err("Depositor and beneficiary cannot be the same");
        };
        
        // Check expiration time if provided
        switch (args.expires_at) {
            case (?expiry) {
                if (expiry <= getCurrentTime()) {
                    return #err("Expiration time must be in the future");
                };
            };
            case null {};
        };
        
        // TODO: In a real implementation, you would need to:
        // 1. Implement ICP transfer from caller to this canister
        // 2. Verify the transfer was successful before creating the escrow
        // For now, we'll assume the transfer logic is handled elsewhere
        
        let escrowId = generateEscrowId();
        let escrow: EscrowDetails = {
            id = escrowId;
            depositor = caller;
            beneficiary = args.beneficiary;
            amount = args.amount;
            condition = args.condition;
            status = #Active;
            created_at = getCurrentTime();
            expires_at = args.expires_at;
            approvals = [];
        };
        
        escrows.put(escrowId, escrow);
        totalHeld += args.amount;
        
        #ok(escrowId)
    };
    
    // Get escrow details
    public query func getEscrow(escrowId: EscrowId): async ?EscrowDetails {
        escrows.get(escrowId)
    };
    
    // Get all escrows for a principal
    public query func getEscrowsForPrincipal(principal: Principal): async [EscrowDetails] {
        let result = Array.filter<EscrowDetails>(
            Iter.toArray(escrows.vals()),
            func(escrow: EscrowDetails): Bool {
                escrow.depositor == principal or escrow.beneficiary == principal
            }
        );
        result
    };
    
    // Approve escrow release (for manual approval or multi-sig)
    public shared(msg) func approveRelease(escrowId: EscrowId): async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.status != #Active) {
                    return #err("Escrow is not active");
                };
                
                // Check if escrow has expired
                switch (escrow.expires_at) {
                    case (?expiry) {
                        if (getCurrentTime() > expiry) {
                            // Update status to expired
                            let updatedEscrow = {
                                escrow with status = #Expired
                            };
                            escrows.put(escrowId, updatedEscrow);
                            return #err("Escrow has expired");
                        };
                    };
                    case null {};
                };
                
                switch (escrow.condition) {
                    case (#ManualApproval(approver)) {
                        if (caller != approver) {
                            return #err("Only the designated approver can approve this escrow");
                        };
                        // Proceed to release funds
                        return await releaseFunds(escrowId);
                    };
                    case (#MultiSig(approvers)) {
                        // Check if caller is an authorized approver
                        let isAuthorized = Array.find<Principal>(approvers, func(p) { p == caller });
                        switch (isAuthorized) {
                            case null { return #err("Caller is not authorized to approve this escrow") };
                            case (?_) {
                                // Add approval if not already present
                                let hasApproved = Array.find<Principal>(escrow.approvals, func(p) { p == caller });
                                switch (hasApproved) {
                                    case (?_) { return #err("Principal has already approved") };
                                    case null {
                                        let newApprovals = Array.append(escrow.approvals, [caller]);
                                        let updatedEscrow = {
                                            escrow with approvals = newApprovals
                                        };
                                        escrows.put(escrowId, updatedEscrow);
                                        
                                        // Check if we have enough approvals
                                        if (newApprovals.size() >= approvers.size()) {
                                            return await releaseFunds(escrowId);
                                        };
                                        
                                        #ok(())
                                    };
                                };
                            };
                        };
                    };
                    case (#TimeDelay(_)) { #err("Time-delayed escrows don't require manual approval") };
                    case (#External(_)) { #err("External condition escrows require custom approval logic") };
                };
            };
        };
    };
    
    // Release funds based on time delay
    public func releaseTimedEscrow(escrowId: EscrowId): async Result.Result<(), Text> {
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.status != #Active) {
                    return #err("Escrow is not active");
                };
                
                switch (escrow.condition) {
                    case (#TimeDelay(releaseTime)) {
                        if (getCurrentTime() >= releaseTime) {
                            return await releaseFunds(escrowId);
                        } else {
                            return #err("Release time has not been reached yet");
                        };
                    };
                    case (_) { #err("This escrow is not time-based") };
                };
            };
        };
    };
    
    // Cancel escrow (only depositor can cancel active escrows)
    public shared(msg) func cancelEscrow(escrowId: EscrowId): async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.depositor != caller) {
                    return #err("Only the depositor can cancel the escrow");
                };
                
                if (escrow.status != #Active) {
                    return #err("Escrow is not active");
                };
                
                // TODO: Implement ICP transfer back to depositor
                // For now, we'll just update the status
                
                let updatedEscrow = {
                    escrow with status = #Cancelled
                };
                escrows.put(escrowId, updatedEscrow);
                totalHeld -= escrow.amount;
                
                #ok(())
            };
        };
    };
    
    // Private function to release funds
    private func releaseFunds(escrowId: EscrowId): async Result.Result<(), Text> {
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                // TODO: Implement ICP transfer to beneficiary
                // This would involve calling the ICP ledger canister
                // For now, we'll simulate the transfer
                
                let updatedEscrow = {
                    escrow with status = #Completed
                };
                escrows.put(escrowId, updatedEscrow);
                totalHeld -= escrow.amount;
                
                #ok(())
            };
        };
    };
    
    // Query functions
    public query func getTotalHeld(): async ICP {
        totalHeld
    };
    
    public query func getActiveEscrows(): async [EscrowDetails] {
        Array.filter<EscrowDetails>(
            Iter.toArray(escrows.vals()),
            func(escrow: EscrowDetails): Bool {
                escrow.status == #Active
            }
        )
    };
    
    // Admin function to handle expired escrows
    public func cleanupExpiredEscrows(): async Nat {
        let currentTime = getCurrentTime();
        var cleanedUp = 0;
        
        for ((id, escrow) in escrows.entries()) {
            if (escrow.status == #Active) {
                switch (escrow.expires_at) {
                    case (?expiry) {
                        if (currentTime > expiry) {
                            let updatedEscrow = {
                                escrow with status = #Expired
                            };
                            escrows.put(id, updatedEscrow);
                            // TODO: Return funds to depositor
                            totalHeld -= escrow.amount;
                            cleanedUp += 1;
                        };
                    };
                    case null {};
                };
            };
        };
        
        cleanedUp
    };
}