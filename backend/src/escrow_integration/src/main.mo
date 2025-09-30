import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Debug "mo:base/Debug";

// Import the ICP Ledger actor
import ICPLedger "icp_ledger";

// Import the Escrow actor (assuming it exists)
import Escrow "escrow";

actor EscrowIntegration {
    
    // Types
    public type AccountId = Text;
    public type Amount = Nat;
    public type EscrowId = Text;
    public type TransactionId = Text;
    
    public type EscrowRequest = {
        escrowId: EscrowId;
        depositor: AccountId;
        beneficiary: AccountId;
        amount: Amount;
        description: ?Text;
        deadline: ?Int;
    };
    
    public type EscrowResponse = {
        escrowId: EscrowId;
        transactionId: TransactionId;
        status: Text;
        message: Text;
    };
    
    public type ReleaseRequest = {
        escrowId: EscrowId;
        amount: Amount;
        releaser: AccountId;
    };
    
    public type RefundRequest = {
        escrowId: EscrowId;
        reason: ?Text;
        refunder: AccountId;
    };
    
    // State
    private var ledgerActor: ?ICPLedger.ICPLedger = null;
    private var escrowActor: ?Escrow.Escrow = null;
    
    // Initialize actors
    public func initialize(ledgerCanisterId: Text, escrowCanisterId: Text): async Result.Result<(), Text> {
        try {
            let ledgerPrincipal = Principal.fromText(ledgerCanisterId);
            let escrowPrincipal = Principal.fromText(escrowCanisterId);
            
            ledgerActor := ?(actor(ledgerCanisterId): ICPLedger.ICPLedger);
            escrowActor := ?(actor(escrowCanisterId): Escrow.Escrow);
            
            Debug.print("Escrow Integration initialized with ledger and escrow canisters");
            #ok(())
        } catch (e) {
            #err("Failed to initialize actors: " # Error.message(e))
        }
    };
    
    // Create escrow with ledger integration
    public func createEscrow(request: EscrowRequest): async Result.Result<EscrowResponse, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                // First, create the escrow in the ledger
                let escrowDepositArgs: ICPLedger.EscrowDepositArgs = {
                    escrowId = request.escrowId;
                    beneficiary = request.beneficiary;
                    amount = request.amount;
                    memo = request.description;
                };
                
                switch (await ledger.escrowDeposit(escrowDepositArgs, request.depositor)) {
                    case (#ok(result)) {
                        // If ledger escrow creation is successful, create escrow in escrow canister
                        switch (escrowActor) {
                            case (?escrow) {
                                // Create escrow record in escrow canister
                                let escrowResult = await escrow.createEscrow({
                                    escrowId = request.escrowId;
                                    depositor = request.depositor;
                                    beneficiary = request.beneficiary;
                                    amount = request.amount;
                                    description = request.description;
                                    deadline = request.deadline;
                                });
                                
                                switch (escrowResult) {
                                    case (#ok(escrowRecord)) {
                                        #ok({
                                            escrowId = request.escrowId;
                                            transactionId = result.transaction.id;
                                            status = "created";
                                            message = "Escrow created successfully in both ledger and escrow canister";
                                        })
                                    };
                                    case (#err(msg)) {
                                        // If escrow canister creation fails, refund the ledger
                                        let refundArgs: ICPLedger.EscrowRefundArgs = {
                                            escrowId = request.escrowId;
                                            reason = ?("Escrow canister creation failed: " # msg);
                                        };
                                        
                                        switch (await ledger.escrowRefund(refundArgs, request.depositor)) {
                                            case (#ok(_)) {
                                                #err("Escrow canister creation failed, ledger refunded: " # msg)
                                            };
                                            case (#err(refundErr)) {
                                                #err("Escrow canister creation failed and refund failed: " # msg # " | Refund error: " # refundErr)
                                            };
                                        }
                                    };
                                }
                            };
                            case null {
                                #err("Escrow actor not initialized")
                            };
                        }
                    };
                    case (#err(msg)) {
                        #err("Ledger escrow creation failed: " # msg)
                    };
                }
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Release escrow with ledger integration
    public func releaseEscrow(request: ReleaseRequest): async Result.Result<EscrowResponse, Text> {
        switch (ledgerActor, escrowActor) {
            case (?ledger, ?escrow) {
                // First, check if escrow exists in escrow canister
                switch (await escrow.getEscrow(request.escrowId)) {
                    case (#ok(escrowRecord)) {
                        // Check if the releaser is authorized (beneficiary or depositor)
                        if (request.releaser != escrowRecord.beneficiary and request.releaser != escrowRecord.depositor) {
                            return #err("Unauthorized: Only beneficiary or depositor can release escrow");
                        };
                        
                        // Release from ledger
                        let releaseArgs: ICPLedger.EscrowReleaseArgs = {
                            escrowId = request.escrowId;
                            amount = request.amount;
                        };
                        
                        switch (await ledger.escrowRelease(releaseArgs, request.releaser)) {
                            case (#ok(transaction)) {
                                // Update escrow status in escrow canister
                                let updateResult = await escrow.updateEscrowStatus(request.escrowId, "released");
                                
                                switch (updateResult) {
                                    case (#ok(_)) {
                                        #ok({
                                            escrowId = request.escrowId;
                                            transactionId = transaction.id;
                                            status = "released";
                                            message = "Escrow released successfully";
                                        })
                                    };
                                    case (#err(msg)) {
                                        #err("Ledger release succeeded but escrow canister update failed: " # msg)
                                    };
                                }
                            };
                            case (#err(msg)) {
                                #err("Ledger release failed: " # msg)
                            };
                        }
                    };
                    case (#err(msg)) {
                        #err("Escrow not found in escrow canister: " # msg)
                    };
                }
            };
            case (null, _) {
                #err("Ledger actor not initialized")
            };
            case (_, null) {
                #err("Escrow actor not initialized")
            };
        }
    };
    
    // Refund escrow with ledger integration
    public func refundEscrow(request: RefundRequest): async Result.Result<EscrowResponse, Text> {
        switch (ledgerActor, escrowActor) {
            case (?ledger, ?escrow) {
                // First, check if escrow exists in escrow canister
                switch (await escrow.getEscrow(request.escrowId)) {
                    case (#ok(escrowRecord)) {
                        // Check if the refunder is authorized (depositor)
                        if (request.refunder != escrowRecord.depositor) {
                            return #err("Unauthorized: Only depositor can refund escrow");
                        };
                        
                        // Refund from ledger
                        let refundArgs: ICPLedger.EscrowRefundArgs = {
                            escrowId = request.escrowId;
                            reason = request.reason;
                        };
                        
                        switch (await ledger.escrowRefund(refundArgs, request.refunder)) {
                            case (#ok(transaction)) {
                                // Update escrow status in escrow canister
                                let updateResult = await escrow.updateEscrowStatus(request.escrowId, "refunded");
                                
                                switch (updateResult) {
                                    case (#ok(_)) {
                                        #ok({
                                            escrowId = request.escrowId;
                                            transactionId = transaction.id;
                                            status = "refunded";
                                            message = "Escrow refunded successfully";
                                        })
                                    };
                                    case (#err(msg)) {
                                        #err("Ledger refund succeeded but escrow canister update failed: " # msg)
                                    };
                                }
                            };
                            case (#err(msg)) {
                                #err("Ledger refund failed: " # msg)
                            };
                        }
                    };
                    case (#err(msg)) {
                        #err("Escrow not found in escrow canister: " # msg)
                    };
                }
            };
            case (null, _) {
                #err("Ledger actor not initialized")
            };
            case (_, null) {
                #err("Escrow actor not initialized")
            };
        }
    };
    
    // Get escrow status from both canisters
    public func getEscrowStatus(escrowId: EscrowId): async Result.Result<{
        ledgerStatus: Text;
        escrowStatus: Text;
        amount: Amount;
        depositor: AccountId;
        beneficiary: AccountId;
    }, Text> {
        switch (ledgerActor, escrowActor) {
            case (?ledger, ?escrow) {
                // Get status from both canisters
                let ledgerResult = await ledger.getEscrowAccount(escrowId);
                let escrowResult = await escrow.getEscrow(escrowId);
                
                switch (ledgerResult, escrowResult) {
                    case (#ok(ledgerEscrow), #ok(escrowRecord)) {
                        #ok({
                            ledgerStatus = switch (ledgerEscrow.status) {
                                case (#Active) "active";
                                case (#Released) "released";
                                case (#Refunded) "refunded";
                                case (#Cancelled) "cancelled";
                            };
                            escrowStatus = escrowRecord.status;
                            amount = ledgerEscrow.amount;
                            depositor = ledgerEscrow.depositor;
                            beneficiary = ledgerEscrow.beneficiary;
                        })
                    };
                    case (#err(msg), _) {
                        #err("Ledger error: " # msg)
                    };
                    case (_, #err(msg)) {
                        #err("Escrow canister error: " # msg)
                    };
                }
            };
            case (null, _) {
                #err("Ledger actor not initialized")
            };
            case (_, null) {
                #err("Escrow actor not initialized")
            };
        }
    };
    
    // Get account balance from ledger
    public func getAccountBalance(accountId: AccountId): async Result.Result<Amount, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                await ledger.getAccountBalance(accountId)
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Get account transactions from ledger
    public func getAccountTransactions(accountId: AccountId, limit: ?Nat): async Result.Result<[ICPLedger.Transaction], Text> {
        switch (ledgerActor) {
            case (?ledger) {
                await ledger.getAccountTransactions(accountId, limit)
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Create account in ledger
    public func createAccount(accountId: AccountId, principal: ?Principal): async Result.Result<ICPLedger.Account, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                await ledger.createAccount(accountId, principal)
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Transfer tokens between accounts
    public func transferTokens(from: AccountId, to: AccountId, amount: Amount, memo: ?Text): async Result.Result<ICPLedger.Transaction, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                let transferArgs: ICPLedger.TransferArgs = {
                    to = to;
                    amount = amount;
                    memo = memo;
                };
                await ledger.transfer(transferArgs, from)
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Get ledger statistics
    public func getLedgerStats(): async Result.Result<ICPLedger.LedgerStats, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                #ok(await ledger.getLedgerStats())
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Admin functions
    public func mintTokens(accountId: AccountId, amount: Amount): async Result.Result<ICPLedger.Transaction, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                await ledger.mintTokens(accountId, amount)
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    public func burnTokens(accountId: AccountId, amount: Amount): async Result.Result<ICPLedger.Transaction, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                await ledger.burnTokens(accountId, amount)
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
    
    // Get system information
    public func getSystemInfo(): async Result.Result<{
        ledgerVersion: Text;
        totalAccounts: Nat;
        totalTransactions: Nat;
        totalEscrows: Nat;
        feeAccountBalance: Amount;
    }, Text> {
        switch (ledgerActor) {
            case (?ledger) {
                #ok(await ledger.getSystemInfo())
            };
            case null {
                #err("Ledger actor not initialized")
            };
        }
    };
}


