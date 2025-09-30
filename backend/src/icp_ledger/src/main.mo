import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

persistent actor ICPLedger {
    
    // Types
    public type AccountId = Text;
    public type Amount = Nat;
    public type Timestamp = Int;
    public type TransactionId = Text;
    public type EscrowId = Text;
    
    public type Transaction = {
        id: TransactionId;
        from: AccountId;
        to: AccountId;
        amount: Amount;
        timestamp: Timestamp;
        transactionType: TransactionType;
        escrowId: ?EscrowId;
        status: TransactionStatus;
        memo: ?Text;
    };
    
    public type TransactionType = {
        #Transfer;
        #EscrowDeposit;
        #EscrowRelease;
        #EscrowRefund;
        #Fee;
    };
    
    public type TransactionStatus = {
        #Pending;
        #Completed;
        #Failed;
        #Cancelled;
    };
    
    public type Account = {
        id: AccountId;
        balance: Amount;
        principal: ?Principal;
        createdAt: Timestamp;
        lastUpdated: Timestamp;
    };
    
    public type EscrowAccount = {
        id: EscrowId;
        amount: Amount;
        depositor: AccountId;
        beneficiary: AccountId;
        status: EscrowStatus;
        createdAt: Timestamp;
        releasedAt: ?Timestamp;
        memo: ?Text;
    };
    
    public type EscrowStatus = {
        #Active;
        #Released;
        #Refunded;
        #Cancelled;
    };
    
    public type LedgerStats = {
        totalAccounts: Nat;
        totalBalance: Amount;
        totalTransactions: Nat;
        totalEscrowAmount: Amount;
        activeEscrows: Nat;
    };
    
    public type TransferArgs = {
        to: AccountId;
        amount: Amount;
        memo: ?Text;
    };
    
    public type EscrowDepositArgs = {
        escrowId: EscrowId;
        beneficiary: AccountId;
        amount: Amount;
        memo: ?Text;
    };
    
    public type EscrowReleaseArgs = {
        escrowId: EscrowId;
        amount: Amount;
    };
    
    public type EscrowRefundArgs = {
        escrowId: EscrowId;
        reason: ?Text;
    };
    
    // State
    private stable var accountsEntries: [(AccountId, Account)] = [];
    private stable var transactionsEntries: [(TransactionId, Transaction)] = [];
    private stable var escrowAccountsEntries: [(EscrowId, EscrowAccount)] = [];
    private stable var accountTransactionsEntries: [(AccountId, [TransactionId])] = [];
    private stable var nextTransactionId: Nat = 1;
    
    private transient var accounts = HashMap.HashMap<AccountId, Account>(0, Text.equal, Text.hash);
    private transient var transactions = HashMap.HashMap<TransactionId, Transaction>(0, Text.equal, Text.hash);
    private transient var escrowAccounts = HashMap.HashMap<EscrowId, EscrowAccount>(0, Text.equal, Text.hash);
    private transient var accountTransactions = HashMap.HashMap<AccountId, [TransactionId]>(0, Text.equal, Text.hash);
    
    // Constants
    private transient let FEE_ACCOUNT = "fee_account";
    private transient let ESCROW_FEE_PERCENTAGE = 1; // 1% fee for escrow operations
    private transient let MIN_TRANSFER_AMOUNT = 1000; // Minimum transfer amount in e8s
    
    // System functions for persistence
    system func preupgrade() {
        accountsEntries := Iter.toArray(accounts.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
        escrowAccountsEntries := Iter.toArray(escrowAccounts.entries());
        accountTransactionsEntries := Iter.toArray(accountTransactions.entries());
    };
    
    system func postupgrade() {
        accounts := HashMap.fromIter<AccountId, Account>(accountsEntries.vals(), accountsEntries.size(), Text.equal, Text.hash);
        transactions := HashMap.fromIter<TransactionId, Transaction>(transactionsEntries.vals(), transactionsEntries.size(), Text.equal, Text.hash);
        escrowAccounts := HashMap.fromIter<EscrowId, EscrowAccount>(escrowAccountsEntries.vals(), escrowAccountsEntries.size(), Text.equal, Text.hash);
        accountTransactions := HashMap.fromIter<AccountId, [TransactionId]>(accountTransactionsEntries.vals(), accountTransactionsEntries.size(), Text.equal, Text.hash);
        
        // Initialize fee account if it doesn't exist
        if (accounts.get(FEE_ACCOUNT) == null) {
            let now = Time.now();
            accounts.put(FEE_ACCOUNT, {
                id = FEE_ACCOUNT;
                balance = 0;
                principal = null;
                createdAt = now;
                lastUpdated = now;
            });
            Debug.print("ICP Ledger initialized with fee account");
        };
    };
    
    // Account Management
    public func createAccount(accountId: AccountId, principal: ?Principal): async Result.Result<Account, Text> {
        if (accounts.get(accountId) != null) {
            return #err("Account already exists");
        };
        
        let now = Time.now();
        let account: Account = {
            id = accountId;
            balance = 0;
            principal = principal;
            createdAt = now;
            lastUpdated = now;
        };
        
        accounts.put(accountId, account);
        accountTransactions.put(accountId, []);
        
        Debug.print("Created account: " # accountId);
        #ok(account)
    };
    
    public func getAccount(accountId: AccountId): async Result.Result<Account, Text> {
        switch (accounts.get(accountId)) {
            case (?account) #ok(account);
            case null #err("Account not found");
        }
    };
    
    public func getAccountBalance(accountId: AccountId): async Result.Result<Amount, Text> {
        switch (accounts.get(accountId)) {
            case (?account) #ok(account.balance);
            case null #err("Account not found");
        }
    };
    
    // Transaction Management
    private func generateTransactionId(): TransactionId {
        let id = "tx_" # Nat.toText(nextTransactionId) # "_" # Nat.toText(Int.abs(Time.now()));
        nextTransactionId += 1;
        id
    };
    
    private func createTransaction(
        from: AccountId,
        to: AccountId,
        amount: Amount,
        transactionType: TransactionType,
        escrowId: ?EscrowId,
        memo: ?Text
    ): Transaction {
        {
            id = generateTransactionId();
            from = from;
            to = to;
            amount = amount;
            timestamp = Time.now();
            transactionType = transactionType;
            escrowId = escrowId;
            status = #Pending;
            memo = memo;
        }
    };
    
    private func recordTransaction(transaction: Transaction): () {
        transactions.put(transaction.id, transaction);
        
        // Add to account transaction lists
        switch (accountTransactions.get(transaction.from)) {
            case (?txList) {
                let newList = Array.append(txList, [transaction.id]);
                accountTransactions.put(transaction.from, newList);
            };
            case null {
                accountTransactions.put(transaction.from, [transaction.id]);
            };
        };
        
        switch (accountTransactions.get(transaction.to)) {
            case (?txList) {
                let newList = Array.append(txList, [transaction.id]);
                accountTransactions.put(transaction.to, newList);
            };
            case null {
                accountTransactions.put(transaction.to, [transaction.id]);
            };
        };
    };
    
    private func updateAccountBalance(accountId: AccountId, newBalance: Amount): () {
        switch (accounts.get(accountId)) {
            case (?account) {
                let updatedAccount = {
                    id = account.id;
                    balance = newBalance;
                    principal = account.principal;
                    createdAt = account.createdAt;
                    lastUpdated = Time.now();
                };
                accounts.put(accountId, updatedAccount);
            };
            case null {};
        };
    };
    
    // Transfer Functions
    public func transfer(args: TransferArgs, from: AccountId): async Result.Result<Transaction, Text> {
        if (args.amount < MIN_TRANSFER_AMOUNT) {
            return #err("Amount below minimum transfer limit");
        };
        
        // Check if sender account exists and has sufficient balance
        switch (accounts.get(from)) {
            case (?senderAccount) {
                if (senderAccount.balance < args.amount) {
                    return #err("Insufficient balance");
                };
                
                // Check if recipient account exists, create if not
                switch (accounts.get(args.to)) {
                    case (?recipientAccount) {
                        // Both accounts exist, proceed with transfer
                        let transaction = createTransaction(from, args.to, args.amount, #Transfer, null, args.memo);
                        
                        // Update balances
                        updateAccountBalance(from, senderAccount.balance - args.amount);
                        updateAccountBalance(args.to, recipientAccount.balance + args.amount);
                        
                        // Record transaction
                        let completedTransaction = {
                            id = transaction.id;
                            from = transaction.from;
                            to = transaction.to;
                            amount = transaction.amount;
                            timestamp = transaction.timestamp;
                            transactionType = transaction.transactionType;
                            escrowId = transaction.escrowId;
                            status = #Completed;
                            memo = transaction.memo;
                        };
                        
                        recordTransaction(completedTransaction);
                        
                        Debug.print("Transfer completed: " # transaction.id);
                        #ok(completedTransaction)
                    };
                    case null {
                        // Create recipient account
                        let now = Time.now();
                        let recipientAccount: Account = {
                            id = args.to;
                            balance = args.amount;
                            principal = null;
                            createdAt = now;
                            lastUpdated = now;
                        };
                        accounts.put(args.to, recipientAccount);
                        accountTransactions.put(args.to, []);
                        
                        // Update sender balance
                        updateAccountBalance(from, senderAccount.balance - args.amount);
                        
                        // Record transaction
                        let transaction = createTransaction(from, args.to, args.amount, #Transfer, null, args.memo);
                        let completedTransaction = {
                            id = transaction.id;
                            from = transaction.from;
                            to = transaction.to;
                            amount = transaction.amount;
                            timestamp = transaction.timestamp;
                            transactionType = transaction.transactionType;
                            escrowId = transaction.escrowId;
                            status = #Completed;
                            memo = transaction.memo;
                        };
                        
                        recordTransaction(completedTransaction);
                        
                        Debug.print("Transfer completed with new account: " # transaction.id);
                        #ok(completedTransaction)
                    };
                };
            };
            case null {
                #err("Sender account not found")
            };
        }
    };
    
    // Escrow Functions
    public func escrowDeposit(args: EscrowDepositArgs, depositor: AccountId): async Result.Result<{transaction: Transaction; escrowAccount: EscrowAccount}, Text> {
        if (args.amount < MIN_TRANSFER_AMOUNT) {
            return #err("Amount below minimum escrow limit");
        };
        
        // Check if escrow already exists
        if (escrowAccounts.get(args.escrowId) != null) {
            return #err("Escrow ID already exists");
        };
        
        // Check if depositor account exists and has sufficient balance
        switch (accounts.get(depositor)) {
            case (?depositorAccount) {
                if (depositorAccount.balance < args.amount) {
                    return #err("Insufficient balance for escrow deposit");
                };
                
                // Calculate escrow fee
                let feeAmount = (args.amount * ESCROW_FEE_PERCENTAGE) / 100;
                let netAmount = args.amount - feeAmount;
                
                // Create escrow account
                let now = Time.now();
                let escrowAccount: EscrowAccount = {
                    id = args.escrowId;
                    amount = netAmount;
                    depositor = depositor;
                    beneficiary = args.beneficiary;
                    status = #Active;
                    createdAt = now;
                    releasedAt = null;
                    memo = args.memo;
                };
                
                // Create transaction for escrow deposit
                let transaction = createTransaction(depositor, args.escrowId, args.amount, #EscrowDeposit, ?args.escrowId, args.memo);
                
                // Update balances
                updateAccountBalance(depositor, depositorAccount.balance - args.amount);
                updateAccountBalance(FEE_ACCOUNT, 
                    switch (accounts.get(FEE_ACCOUNT)) {
                        case (?feeAccount) feeAccount.balance + feeAmount;
                        case null feeAmount;
                    }
                );
                
                // Record transaction and escrow
                let completedTransaction = {
                    id = transaction.id;
                    from = transaction.from;
                    to = transaction.to;
                    amount = transaction.amount;
                    timestamp = transaction.timestamp;
                    transactionType = transaction.transactionType;
                    escrowId = transaction.escrowId;
                    status = #Completed;
                    memo = transaction.memo;
                };
                
                recordTransaction(completedTransaction);
                escrowAccounts.put(args.escrowId, escrowAccount);
                
                Debug.print("Escrow deposit completed: " # args.escrowId);
                #ok({transaction = completedTransaction; escrowAccount = escrowAccount})
            };
            case null {
                #err("Depositor account not found")
            };
        }
    };
    
    public func escrowRelease(args: EscrowReleaseArgs, releaser: AccountId): async Result.Result<Transaction, Text> {
        switch (escrowAccounts.get(args.escrowId)) {
            case (?escrowAccount) {
                if (escrowAccount.status != #Active) {
                    return #err("Escrow is not active");
                };
                
                if (args.amount > escrowAccount.amount) {
                    return #err("Release amount exceeds escrow balance");
                };
                
                // Check if beneficiary account exists, create if not
                switch (accounts.get(escrowAccount.beneficiary)) {
                    case (?beneficiaryAccount) {
                        // Update beneficiary balance
                        updateAccountBalance(escrowAccount.beneficiary, beneficiaryAccount.balance + args.amount);
                    };
                    case null {
                        // Create beneficiary account
                        let now = Time.now();
                        let beneficiaryAccount: Account = {
                            id = escrowAccount.beneficiary;
                            balance = args.amount;
                            principal = null;
                            createdAt = now;
                            lastUpdated = now;
                        };
                        accounts.put(escrowAccount.beneficiary, beneficiaryAccount);
                        accountTransactions.put(escrowAccount.beneficiary, []);
                    };
                };
                
                // Update escrow account
                let remainingAmount = escrowAccount.amount - args.amount;
                let updatedEscrowAccount = if (remainingAmount == 0) {
                    {
                        id = escrowAccount.id;
                        amount = remainingAmount;
                        depositor = escrowAccount.depositor;
                        beneficiary = escrowAccount.beneficiary;
                        status = #Released;
                        createdAt = escrowAccount.createdAt;
                        releasedAt = ?Time.now();
                        memo = escrowAccount.memo;
                    }
                } else {
                    {
                        id = escrowAccount.id;
                        amount = remainingAmount;
                        depositor = escrowAccount.depositor;
                        beneficiary = escrowAccount.beneficiary;
                        status = #Active;
                        createdAt = escrowAccount.createdAt;
                        releasedAt = null;
                        memo = escrowAccount.memo;
                    }
                };
                
                escrowAccounts.put(args.escrowId, updatedEscrowAccount);
                
                // Create release transaction
                let transaction = createTransaction(args.escrowId, escrowAccount.beneficiary, args.amount, #EscrowRelease, ?args.escrowId, null);
                let completedTransaction = {
                    id = transaction.id;
                    from = transaction.from;
                    to = transaction.to;
                    amount = transaction.amount;
                    timestamp = transaction.timestamp;
                    transactionType = transaction.transactionType;
                    escrowId = transaction.escrowId;
                    status = #Completed;
                    memo = transaction.memo;
                };
                
                recordTransaction(completedTransaction);
                
                Debug.print("Escrow release completed: " # args.escrowId);
                #ok(completedTransaction)
            };
            case null {
                #err("Escrow not found")
            };
        }
    };
    
    public func escrowRefund(args: EscrowRefundArgs, refunder: AccountId): async Result.Result<Transaction, Text> {
        switch (escrowAccounts.get(args.escrowId)) {
            case (?escrowAccount) {
                if (escrowAccount.status != #Active) {
                    return #err("Escrow is not active");
                };
                
                // Check if depositor account exists
                switch (accounts.get(escrowAccount.depositor)) {
                    case (?depositorAccount) {
                        // Refund the full escrow amount to depositor
                        updateAccountBalance(escrowAccount.depositor, depositorAccount.balance + escrowAccount.amount);
                        
                        // Update escrow status
                        let updatedEscrowAccount = {
                            id = escrowAccount.id;
                            amount = 0;
                            depositor = escrowAccount.depositor;
                            beneficiary = escrowAccount.beneficiary;
                            status = #Refunded;
                            createdAt = escrowAccount.createdAt;
                            releasedAt = ?Time.now();
                            memo = escrowAccount.memo;
                        };
                        
                        escrowAccounts.put(args.escrowId, updatedEscrowAccount);
                        
                        // Create refund transaction
                        let transaction = createTransaction(args.escrowId, escrowAccount.depositor, escrowAccount.amount, #EscrowRefund, ?args.escrowId, args.reason);
                        let completedTransaction = {
                            id = transaction.id;
                            from = transaction.from;
                            to = transaction.to;
                            amount = transaction.amount;
                            timestamp = transaction.timestamp;
                            transactionType = transaction.transactionType;
                            escrowId = transaction.escrowId;
                            status = #Completed;
                            memo = transaction.memo;
                        };
                        
                        recordTransaction(completedTransaction);
                        
                        Debug.print("Escrow refund completed: " # args.escrowId);
                        #ok(completedTransaction)
                    };
                    case null {
                        #err("Depositor account not found")
                    };
                };
            };
            case null {
                #err("Escrow not found")
            };
        }
    };
    
    // Query Functions
    public func getTransaction(transactionId: TransactionId): async Result.Result<Transaction, Text> {
        switch (transactions.get(transactionId)) {
            case (?transaction) #ok(transaction);
            case null #err("Transaction not found");
        }
    };
    
    public func getAccountTransactions(accountId: AccountId, limit: ?Nat): async Result.Result<[Transaction], Text> {
        switch (accountTransactions.get(accountId)) {
            case (?txIds) {
                let txList = Array.map<TransactionId, Transaction>(txIds, func(id) {
                    switch (transactions.get(id)) {
                        case (?tx) tx;
                        case null {
                            // This shouldn't happen, but handle gracefully
                            {
                                id = id;
                                from = "";
                                to = "";
                                amount = 0;
                                timestamp = 0;
                                transactionType = #Transfer;
                                escrowId = null;
                                status = #Failed;
                                memo = null;
                            }
                        };
                    }
                });
                
                // Sort by timestamp (newest first)
                let sortedTxs = Array.sort(txList, func(a: Transaction, b: Transaction): {#less; #equal; #greater} {
                    if (a.timestamp > b.timestamp) #less
                    else if (a.timestamp < b.timestamp) #greater
                    else #equal
                });
                
                // Apply limit if specified
                switch (limit) {
                    case (?l) {
                        if (l < Array.size(sortedTxs)) {
                            let limited = Array.tabulate<Transaction>(l, func(i) = sortedTxs[i]);
                            #ok(limited)
                        } else {
                            #ok(sortedTxs)
                        }
                    };
                    case null #ok(sortedTxs);
                }
            };
            case null #err("Account not found");
        }
    };
    
    public func getEscrowAccount(escrowId: EscrowId): async Result.Result<EscrowAccount, Text> {
        switch (escrowAccounts.get(escrowId)) {
            case (?escrowAccount) #ok(escrowAccount);
            case null #err("Escrow not found");
        }
    };
    
    public func getAllEscrows(limit: ?Nat): async [EscrowAccount] {
        let escrowList = Iter.toArray<EscrowAccount>(escrowAccounts.vals());
        
        // Sort by creation time (newest first)
        let sortedEscrows = Array.sort(escrowList, func(a: EscrowAccount, b: EscrowAccount): {#less; #equal; #greater} {
            if (a.createdAt > b.createdAt) #less
            else if (a.createdAt < b.createdAt) #greater
            else #equal
        });
        
        // Apply limit if specified
        switch (limit) {
            case (?l) {
                if (l < Array.size(sortedEscrows)) {
                    Array.tabulate<EscrowAccount>(l, func(i) = sortedEscrows[i])
                } else {
                    sortedEscrows
                }
            };
            case null sortedEscrows;
        }
    };
    
    public func getLedgerStats(): async LedgerStats {
        let totalBalance = Array.foldLeft<Account, Amount>(
            Iter.toArray(accounts.vals()),
            0,
            func(acc, account) = acc + account.balance
        );
        
        let totalEscrowAmount = Array.foldLeft<EscrowAccount, Amount>(
            Iter.toArray(escrowAccounts.vals()),
            0,
            func(acc, escrow) = if (escrow.status == #Active) acc + escrow.amount else acc
        );
        
        let activeEscrows = Array.size(
            Array.filter<EscrowAccount>(
                Iter.toArray(escrowAccounts.vals()),
                func(escrow) = escrow.status == #Active
            )
        );
        
        {
            totalAccounts = accounts.size();
            totalBalance = totalBalance;
            totalTransactions = transactions.size();
            totalEscrowAmount = totalEscrowAmount;
            activeEscrows = activeEscrows;
        }
    };
    
    // Admin Functions
    public func mintTokens(accountId: AccountId, amount: Amount): async Result.Result<Transaction, Text> {
        switch (accounts.get(accountId)) {
            case (?account) {
                let transaction = createTransaction("system", accountId, amount, #Transfer, null, ?"Token mint");
                
                updateAccountBalance(accountId, account.balance + amount);
                
                let completedTransaction = {
                    id = transaction.id;
                    from = transaction.from;
                    to = transaction.to;
                    amount = transaction.amount;
                    timestamp = transaction.timestamp;
                    transactionType = transaction.transactionType;
                    escrowId = transaction.escrowId;
                    status = #Completed;
                    memo = transaction.memo;
                };
                
                recordTransaction(completedTransaction);
                
                Debug.print("Tokens minted: " # transaction.id);
                #ok(completedTransaction)
            };
            case null {
                #err("Account not found")
            };
        }
    };
    
    public func burnTokens(accountId: AccountId, amount: Amount): async Result.Result<Transaction, Text> {
        switch (accounts.get(accountId)) {
            case (?account) {
                if (account.balance < amount) {
                    return #err("Insufficient balance to burn");
                };
                
                let transaction = createTransaction(accountId, "system", amount, #Transfer, null, ?"Token burn");
                
                updateAccountBalance(accountId, account.balance - amount);
                
                let completedTransaction = {
                    id = transaction.id;
                    from = transaction.from;
                    to = transaction.to;
                    amount = transaction.amount;
                    timestamp = transaction.timestamp;
                    transactionType = transaction.transactionType;
                    escrowId = transaction.escrowId;
                    status = #Completed;
                    memo = transaction.memo;
                };
                
                recordTransaction(completedTransaction);
                
                Debug.print("Tokens burned: " # transaction.id);
                #ok(completedTransaction)
            };
            case null {
                #err("Account not found")
            };
        }
    };
    
    // System Functions
    public func getSystemInfo(): async {
        ledgerVersion: Text;
        totalAccounts: Nat;
        totalTransactions: Nat;
        totalEscrows: Nat;
        feeAccountBalance: Amount;
    } {
        let feeBalance = switch (accounts.get(FEE_ACCOUNT)) {
            case (?feeAccount) feeAccount.balance;
            case null 0;
        };
        
        {
            ledgerVersion = "1.0.0";
            totalAccounts = accounts.size();
            totalTransactions = transactions.size();
            totalEscrows = escrowAccounts.size();
            feeAccountBalance = feeBalance;
        }
    };
}
