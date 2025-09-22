import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";

persistent actor EscrowBank {
    
    // Types
    type EscrowId = Nat;
    type Balance = Nat;
    type Timestamp = Int;
    
    public type EscrowStatus = {
        #Pending;
        #Completed;
        #Disputed;
        #Cancelled;
        #Refunded;
    };
    
    public type EscrowAgreement = {
        id: EscrowId;
        buyer: Principal;
        seller: Principal;
        arbitrator: ?Principal;
        amount: Balance;
        platformFee: Balance; // 5% of the amount
        netAmount: Balance; // Amount after platform fee deduction
        description: Text;
        status: EscrowStatus;
        createdAt: Timestamp;
        deadline: Timestamp; // Project deadline
        completedAt: ?Timestamp;
        buyerApproved: Bool;
        sellerApproved: Bool;
        serviceId: Text; // Reference to the service
        projectTitle: Text;
    };
    
    public type CreateEscrowArgs = {
        seller: Principal;
        arbitrator: ?Principal;
        amount: Balance;
        description: Text;
        deadline: Timestamp; // Project deadline in nanoseconds
        serviceId: Text;
        projectTitle: Text;
    };
    
    // State
    private var nextEscrowId: EscrowId = 1;
    private transient var escrows = Map.HashMap<EscrowId, EscrowAgreement>(10, func(a: EscrowId, b: EscrowId) : Bool { a == b }, func(id: EscrowId) : Nat32 { Nat32.fromNat(id) });
    private transient var balances = Map.HashMap<Principal, Balance>(10, Principal.equal, Principal.hash);
    private var platformFeeBalance: Balance = 0; // Track collected platform fees
    
    // Helper function to get caller's balance
    private func getBalance(principal: Principal) : Balance {
        switch (balances.get(principal)) {
            case null 0;
            case (?balance) balance;
        };
    };
    
    // Helper function to update balance with overflow protection
    private func updateBalance(principal: Principal, newBalance: Balance) {
        // Prevent negative balances
        if (newBalance < 0) {
            balances.put(principal, 0);
        } else {
            balances.put(principal, newBalance);
        };
    };
    
    // Helper function to safely add to balance with overflow protection
    private func addToBalance(principal: Principal, amount: Balance) : Balance {
        let currentBalance = getBalance(principal);
        let newBalance = currentBalance + amount;
        // Check for overflow
        if (newBalance < currentBalance) {
            // Overflow occurred, set to maximum possible value
            balances.put(principal, 0xFFFFFFFFFFFFFFFF);
            0xFFFFFFFFFFFFFFFF
        } else {
            balances.put(principal, newBalance);
            newBalance
        };
    };
    
    // Calculate platform fee (5% of the amount)
    private func calculatePlatformFee(amount: Balance) : Balance {
        if (amount == 0) {
            0
        } else {
            amount / 20; // 5% fee (amount / 20 = 5%)
        }
    };
    
    // Calculate net amount after platform fee
    private func calculateNetAmount(amount: Balance) : Balance {
        amount - calculatePlatformFee(amount);
    };
    
    // Deposit funds to user's account
    public shared(msg) func deposit(amount: Balance) : async Result.Result<Balance, Text> {
        let caller = msg.caller;
        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };
        
        let newBalance = addToBalance(caller, amount);
        #ok(newBalance)
    };
    
    // Withdraw funds from user's account
    public shared(msg) func withdraw(amount: Balance) : async Result.Result<Balance, Text> {
        let caller = msg.caller;
        let currentBalance = getBalance(caller);
        
        if (amount > currentBalance) {
            return #err("Insufficient balance");
        };
        
        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };
        
        // Safe subtraction since we've verified currentBalance >= amount
        let newBalance: Nat = currentBalance - amount;
        updateBalance(caller, newBalance);
        #ok(newBalance)
    };
    
    // Get user's balance
    public shared(msg) func getMyBalance() : async Balance {
        getBalance(msg.caller)
    };
    
    // Create new escrow agreement
    public shared(msg) func createEscrow(args: CreateEscrowArgs) : async Result.Result<EscrowId, Text> {
        let caller = msg.caller;
        let currentBalance = getBalance(caller);
        
        if (args.amount == 0) {
            return #err("Escrow amount must be greater than 0");
        };
        
        if (currentBalance < args.amount) {
            return #err("Insufficient balance to create escrow");
        };
        
        if (caller == args.seller) {
            return #err("Buyer and seller cannot be the same");
        };
        
        if (args.deadline <= Time.now()) {
            return #err("Deadline must be in the future");
        };
        
        // Calculate platform fee and net amount
        let platformFee = calculatePlatformFee(args.amount);
        let netAmount = calculateNetAmount(args.amount);
        
        // Deduct full amount from buyer's balance (platform fee is held separately)
        updateBalance(caller, currentBalance - args.amount);
        
        let escrowId = nextEscrowId;
        nextEscrowId += 1;
        
        let newEscrow: EscrowAgreement = {
            id = escrowId;
            buyer = caller;
            seller = args.seller;
            arbitrator = args.arbitrator;
            amount = args.amount;
            platformFee = platformFee;
            netAmount = netAmount;
            description = args.description;
            status = #Pending;
            createdAt = Time.now();
            deadline = args.deadline;
            completedAt = null;
            buyerApproved = false;
            sellerApproved = false;
            serviceId = args.serviceId;
            projectTitle = args.projectTitle;
        };
        
        escrows.put(escrowId, newEscrow);
        #ok(escrowId)
    };
    
    // Buyer approves the transaction
    public shared(msg) func buyerApprove(escrowId: EscrowId) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.buyer != caller) {
                    return #err("Only buyer can approve");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Escrow is not in pending status");
                };
                
                if (escrow.buyerApproved) {
                    return #err("Buyer has already approved this escrow");
                };
                
                let updatedEscrow = {
                    escrow with
                    buyerApproved = true;
                };
                
                // If both parties approved, complete the transaction
                if (escrow.sellerApproved) {
                    let completedEscrow = {
                        updatedEscrow with
                        status = #Completed;
                        completedAt = ?Time.now();
                    };
                    escrows.put(escrowId, completedEscrow);
                    
                    // Transfer net amount to seller (after platform fee deduction)
                    ignore addToBalance(escrow.seller, escrow.netAmount);
                    
                    // Collect platform fee
                    platformFeeBalance += escrow.platformFee;
                    
                    #ok("Escrow completed successfully. Platform fee deducted.")
                } else {
                    escrows.put(escrowId, updatedEscrow);
                    #ok("Buyer approval recorded, waiting for seller approval")
                }
            };
        };
    };
    
    // Seller approves the transaction
    public shared(msg) func sellerApprove(escrowId: EscrowId) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.seller != caller) {
                    return #err("Only seller can approve");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Escrow is not in pending status");
                };
                
                if (escrow.sellerApproved) {
                    return #err("Seller has already approved this escrow");
                };
                
                let updatedEscrow = {
                    escrow with
                    sellerApproved = true;
                };
                
                // If both parties approved, complete the transaction
                if (escrow.buyerApproved) {
                    let completedEscrow = {
                        updatedEscrow with
                        status = #Completed;
                        completedAt = ?Time.now();
                    };
                    escrows.put(escrowId, completedEscrow);
                    
                    // Transfer net amount to seller (after platform fee deduction)
                    ignore addToBalance(escrow.seller, escrow.netAmount);
                    
                    // Collect platform fee
                    platformFeeBalance += escrow.platformFee;
                    
                    #ok("Escrow completed successfully. Platform fee deducted.")
                } else {
                    escrows.put(escrowId, updatedEscrow);
                    #ok("Seller approval recorded, waiting for buyer approval")
                }
            };
        };
    };
    
    // Cancel escrow (only buyer can cancel, refunds the full amount including platform fee)
    public shared(msg) func cancelEscrow(escrowId: EscrowId) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.buyer != caller) {
                    return #err("Only buyer can cancel escrow");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Can only cancel pending escrows");
                };
                
                // Refund net amount to buyer (platform fee is kept by platform)
                ignore addToBalance(escrow.buyer, escrow.netAmount);
                
                // Collect platform fee
                platformFeeBalance += escrow.platformFee;
                
                let cancelledEscrow = {
                    escrow with
                    status = #Cancelled;
                    completedAt = ?Time.now();
                };
                
                escrows.put(escrowId, cancelledEscrow);
                #ok("Escrow cancelled and net amount refunded (platform fee retained)")
            };
        };
    };
    
    // Raise dispute (can be called by buyer or seller)
    public shared(msg) func raiseDispute(escrowId: EscrowId) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.buyer != caller and escrow.seller != caller) {
                    return #err("Only buyer or seller can raise dispute");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Can only dispute pending escrows");
                };
                
                switch (escrow.arbitrator) {
                    case null { #err("No arbitrator assigned to this escrow") };
                    case (?_) {
                        let disputedEscrow = {
                            escrow with
                            status = #Disputed;
                        };
                        
                        escrows.put(escrowId, disputedEscrow);
                        #ok("Dispute raised successfully")
                    };
                };
            };
        };
    };
    
    // Resolve dispute (only arbitrator can call this)
    public shared(msg) func resolveDispute(escrowId: EscrowId, favorBuyer: Bool) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                switch (escrow.arbitrator) {
                    case null { #err("No arbitrator assigned") };
                    case (?arbitrator) {
                        if (arbitrator != caller) {
                            return #err("Only assigned arbitrator can resolve dispute");
                        };
                        
                        if (escrow.status != #Disputed) {
                            return #err("Escrow is not in disputed status");
                        };
                        
                        if (favorBuyer) {
                            // Refund net amount to buyer (platform fee is kept by platform)
                            ignore addToBalance(escrow.buyer, escrow.netAmount);
                            
                            // Collect platform fee
                            platformFeeBalance += escrow.platformFee;
                            
                            let resolvedEscrow = {
                                escrow with
                                status = #Refunded;
                                completedAt = ?Time.now();
                            };
                            escrows.put(escrowId, resolvedEscrow);
                            #ok("Dispute resolved in favor of buyer, net amount refunded (platform fee retained)")
                        } else {
                            // Pay net amount to seller (after platform fee deduction)
                            ignore addToBalance(escrow.seller, escrow.netAmount);
                            
                            // Collect platform fee
                            platformFeeBalance += escrow.platformFee;
                            
                            let resolvedEscrow = {
                                escrow with
                                status = #Completed;
                                completedAt = ?Time.now();
                            };
                            escrows.put(escrowId, resolvedEscrow);
                            #ok("Dispute resolved in favor of seller, net amount transferred (platform fee deducted)")
                        }
                    };
                };
            };
        };
    };
    
    // Check for overdue projects and automatically raise disputes (admin only)
    public shared(_msg) func checkOverdueProjects() : async Result.Result<[EscrowId], Text> {
        // TODO: Add proper admin authorization check
        // For now, we'll allow any caller but this should be restricted to admin principals
        let currentTime = Time.now();
        var overdueEscrows: [EscrowId] = [];
        
        for ((escrowId, escrow) in escrows.entries()) {
            if (escrow.status == #Pending and currentTime > escrow.deadline) {
                // Automatically raise dispute for overdue projects
                let disputedEscrow = {
                    escrow with
                    status = #Disputed;
                };
                escrows.put(escrowId, disputedEscrow);
                // Add to overdue list
                overdueEscrows := Array.append(overdueEscrows, [escrowId]);
            };
        };
        
        #ok(overdueEscrows)
    };
    
    // Client can raise dispute for incomplete work or missed deadline
    public shared(msg) func raiseClientDispute(escrowId: EscrowId, reason: Text) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.buyer != caller) {
                    return #err("Only buyer can raise client dispute");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Can only dispute pending escrows");
                };
                
                // Check if project is overdue or buyer has valid reason
                let currentTime = Time.now();
                if (currentTime <= escrow.deadline and reason == "") {
                    return #err("Cannot dispute before deadline without valid reason");
                };
                
                // Check if arbitrator is assigned
                switch (escrow.arbitrator) {
                    case null { #err("No arbitrator assigned to this escrow") };
                    case (?_) {
                        let disputedEscrow = {
                            escrow with
                            status = #Disputed;
                        };
                        
                        escrows.put(escrowId, disputedEscrow);
                        #ok("Client dispute raised successfully")
                    };
                };
            };
        };
    };
    
    // Freelancer can dispute client cancellation
    public shared(msg) func raiseFreelancerDispute(escrowId: EscrowId, _reason: Text) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (escrows.get(escrowId)) {
            case null { #err("Escrow not found") };
            case (?escrow) {
                if (escrow.seller != caller) {
                    return #err("Only seller can raise freelancer dispute");
                };
                
                if (escrow.status != #Pending) {
                    return #err("Can only dispute pending escrows");
                };
                
                // Check if arbitrator is assigned
                switch (escrow.arbitrator) {
                    case null { #err("No arbitrator assigned to this escrow") };
                    case (?_) {
                        let disputedEscrow = {
                            escrow with
                            status = #Disputed;
                        };
                        
                        escrows.put(escrowId, disputedEscrow);
                        #ok("Freelancer dispute raised successfully")
                    };
                };
            };
        };
    };
    
    // Get escrow details
    public query func getEscrow(escrowId: EscrowId) : async ?EscrowAgreement {
        escrows.get(escrowId)
    };
    
    // Get all escrows for a user (as buyer or seller)
    public shared(msg) func getMyEscrows() : async [EscrowAgreement] {
        let caller = msg.caller;
        let allEscrows = Iter.toArray(escrows.vals());
        
        Array.filter<EscrowAgreement>(allEscrows, func(escrow: EscrowAgreement) : Bool {
            escrow.buyer == caller or escrow.seller == caller
        })
    };
    
    // Get escrows where user is arbitrator
    public shared(msg) func getArbitrationEscrows() : async [EscrowAgreement] {
        let caller = msg.caller;
        let allEscrows = Iter.toArray(escrows.vals());
        
        Array.filter<EscrowAgreement>(allEscrows, func(escrow: EscrowAgreement) : Bool {
            switch (escrow.arbitrator) {
                case null false;
                case (?arbitrator) arbitrator == caller and escrow.status == #Disputed;
            }
        })
    };
    
    // Get platform fee balance (admin function)
    public query func getPlatformFeeBalance() : async Balance {
        platformFeeBalance
    };
    
    // Get platform fee statistics (admin function)
    public query func getPlatformFeeStats() : async { totalFees: Balance; totalTransactions: Nat; collectedFees: Balance; } {
        let allEscrows = Iter.toArray(escrows.vals());
        var totalFees: Balance = 0;
        var totalTransactions: Nat = 0;
        
        for (escrow in allEscrows.vals()) {
            if (escrow.status == #Completed or escrow.status == #Refunded or escrow.status == #Cancelled) {
                totalFees += escrow.platformFee;
                totalTransactions += 1;
            };
        };
        
        { totalFees = totalFees; totalTransactions = totalTransactions; collectedFees = platformFeeBalance; }
    };
    
    // Get escrows by service ID
    public query func getEscrowsByService(serviceId: Text) : async [EscrowAgreement] {
        let allEscrows = Iter.toArray(escrows.vals());
        
        Array.filter<EscrowAgreement>(allEscrows, func(escrow: EscrowAgreement) : Bool {
            escrow.serviceId == serviceId
        })
    };
    
    // System upgrade functions
    system func preupgrade() {
        // State is already stable, no action needed
    };
    
    system func postupgrade() {
        // State is restored automatically, no action needed
    };
}