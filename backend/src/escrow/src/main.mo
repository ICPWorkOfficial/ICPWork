import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";

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
        description: Text;
        status: EscrowStatus;
        createdAt: Timestamp;
        completedAt: ?Timestamp;
        buyerApproved: Bool;
        sellerApproved: Bool;
    };
    
    public type CreateEscrowArgs = {
        seller: Principal;
        arbitrator: ?Principal;
        amount: Balance;
        description: Text;
    };
    
    // State
    private var nextEscrowId: EscrowId = 1;
    private transient var escrows = Map.HashMap<EscrowId, EscrowAgreement>(10, func(a: EscrowId, b: EscrowId) : Bool { a == b }, func(id: EscrowId) : Nat32 { Nat32.fromNat(id) });
    private transient var balances = Map.HashMap<Principal, Balance>(10, Principal.equal, Principal.hash);
    
    // Helper function to get caller's balance
    private func getBalance(principal: Principal) : Balance {
        switch (balances.get(principal)) {
            case null 0;
            case (?balance) balance;
        };
    };
    
    // Helper function to update balance
    private func updateBalance(principal: Principal, newBalance: Balance) {
        balances.put(principal, newBalance);
    };
    
    // Deposit funds to user's account
    public shared(msg) func deposit(amount: Balance) : async Result.Result<Balance, Text> {
        let caller = msg.caller;
        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };
        
        let currentBalance = getBalance(caller);
        let newBalance = currentBalance + amount;
        updateBalance(caller, newBalance);
        
        #ok(newBalance)
    };
    
    // Withdraw funds from user's account
    public shared(msg) func withdraw(amount: Balance) : async Result.Result<Balance, Text> {
        let caller = msg.caller;
        let currentBalance = getBalance(caller);
        
        if (amount > currentBalance) {
            return #err("Insufficient balance");
        };
        
        // Safe subtraction since we've verified currentBalance >= amount
        let newBalance = currentBalance - amount;
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
        
        // Deduct amount from buyer's balance
        updateBalance(caller, currentBalance - args.amount);
        
        let escrowId = nextEscrowId;
        nextEscrowId += 1;
        
        let newEscrow: EscrowAgreement = {
            id = escrowId;
            buyer = caller;
            seller = args.seller;
            arbitrator = args.arbitrator;
            amount = args.amount;
            description = args.description;
            status = #Pending;
            createdAt = Time.now();
            completedAt = null;
            buyerApproved = false;
            sellerApproved = false;
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
                    
                    // Transfer funds to seller
                    let sellerBalance = getBalance(escrow.seller);
                    updateBalance(escrow.seller, sellerBalance + escrow.amount);
                    
                    #ok("Escrow completed successfully")
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
                    
                    // Transfer funds to seller
                    let sellerBalance = getBalance(escrow.seller);
                    updateBalance(escrow.seller, sellerBalance + escrow.amount);
                    
                    #ok("Escrow completed successfully")
                } else {
                    escrows.put(escrowId, updatedEscrow);
                    #ok("Seller approval recorded, waiting for buyer approval")
                }
            };
        };
    };
    
    // Cancel escrow (only buyer can cancel, refunds the amount)
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
                
                // Refund amount to buyer
                let buyerBalance = getBalance(escrow.buyer);
                updateBalance(escrow.buyer, buyerBalance + escrow.amount);
                
                let cancelledEscrow = {
                    escrow with
                    status = #Cancelled;
                    completedAt = ?Time.now();
                };
                
                escrows.put(escrowId, cancelledEscrow);
                #ok("Escrow cancelled and refunded")
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
                            // Refund to buyer
                            let buyerBalance = getBalance(escrow.buyer);
                            updateBalance(escrow.buyer, buyerBalance + escrow.amount);
                            
                            let resolvedEscrow = {
                                escrow with
                                status = #Refunded;
                                completedAt = ?Time.now();
                            };
                            escrows.put(escrowId, resolvedEscrow);
                            #ok("Dispute resolved in favor of buyer, funds refunded")
                        } else {
                            // Pay to seller
                            let sellerBalance = getBalance(escrow.seller);
                            updateBalance(escrow.seller, sellerBalance + escrow.amount);
                            
                            let resolvedEscrow = {
                                escrow with
                                status = #Completed;
                                completedAt = ?Time.now();
                            };
                            escrows.put(escrowId, resolvedEscrow);
                            #ok("Dispute resolved in favor of seller, funds transferred")
                        }
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
    
    // System upgrade functions
    system func preupgrade() {
        // State is already stable, no action needed
    };
    
    system func postupgrade() {
        // State is restored automatically, no action needed
    };
}