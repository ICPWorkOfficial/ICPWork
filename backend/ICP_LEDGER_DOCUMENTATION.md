# ICP Ledger Canister Documentation

## Overview

The ICP Ledger Canister is a comprehensive token management system designed for the Internet Computer Protocol (ICP) ecosystem. It provides secure token storage, transfer capabilities, and integrated escrow functionality for decentralized applications.

## Features

### 🔐 **Account Management**
- Create and manage user accounts
- Associate accounts with ICP principals
- Track account balances and metadata
- Persistent account storage

### 💰 **Token Operations**
- Mint tokens to accounts
- Burn tokens from accounts
- Transfer tokens between accounts
- Real-time balance tracking

### 🔒 **Escrow System**
- Create escrow accounts for secure transactions
- Automatic fee deduction (1% for escrow operations)
- Partial and full escrow releases
- Escrow refunds with reason tracking
- Multi-party escrow management

### 📊 **Transaction Tracking**
- Complete transaction history
- Transaction status tracking (Pending, Completed, Failed, Cancelled)
- Transaction types (Transfer, EscrowDeposit, EscrowRelease, EscrowRefund, Fee)
- Memo support for transaction context

### 📈 **Analytics & Statistics**
- Real-time ledger statistics
- Account and transaction counts
- Escrow analytics
- Fee collection tracking

## API Reference

### Account Management

#### `createAccount(accountId: Text, principal: ?Principal)`
Creates a new account in the ledger.

**Parameters:**
- `accountId`: Unique identifier for the account
- `principal`: Optional ICP principal to associate with the account

**Returns:** `Result<Account, Text>`

#### `getAccount(accountId: Text)`
Retrieves account information.

**Returns:** `Result<Account, Text>`

#### `getAccountBalance(accountId: Text)`
Gets the current balance of an account.

**Returns:** `Result<Nat, Text>`

### Token Operations

#### `transfer(args: TransferArgs, from: Text)`
Transfers tokens between accounts.

**Parameters:**
- `args.to`: Recipient account ID
- `args.amount`: Amount to transfer
- `args.memo`: Optional transaction memo
- `from`: Sender account ID

**Returns:** `Result<Transaction, Text>`

#### `mintTokens(accountId: Text, amount: Nat)`
Mints new tokens to an account.

**Returns:** `Result<Transaction, Text>`

#### `burnTokens(accountId: Text, amount: Nat)`
Burns tokens from an account.

**Returns:** `Result<Transaction, Text>`

### Escrow Operations

#### `escrowDeposit(args: EscrowDepositArgs, depositor: Text)`
Creates an escrow account and deposits tokens.

**Parameters:**
- `args.escrowId`: Unique escrow identifier
- `args.beneficiary`: Account that will receive released tokens
- `args.amount`: Amount to escrow
- `args.memo`: Optional escrow description
- `depositor`: Account making the deposit

**Returns:** `Result<{transaction: Transaction; escrowAccount: EscrowAccount}, Text>`

#### `escrowRelease(args: EscrowReleaseArgs, releaser: Text)`
Releases tokens from an escrow account.

**Parameters:**
- `args.escrowId`: Escrow account identifier
- `args.amount`: Amount to release
- `releaser`: Account authorizing the release

**Returns:** `Result<Transaction, Text>`

#### `escrowRefund(args: EscrowRefundArgs, refunder: Text)`
Refunds all tokens from an escrow account to the depositor.

**Parameters:**
- `args.escrowId`: Escrow account identifier
- `args.reason`: Optional refund reason
- `refunder`: Account authorizing the refund

**Returns:** `Result<Transaction, Text>`

### Query Operations

#### `getTransaction(transactionId: Text)`
Retrieves transaction details by ID.

**Returns:** `Result<Transaction, Text>`

#### `getAccountTransactions(accountId: Text, limit: ?Nat)`
Gets transaction history for an account.

**Returns:** `Result<[Transaction], Text>`

#### `getEscrowAccount(escrowId: Text)`
Retrieves escrow account information.

**Returns:** `Result<EscrowAccount, Text>`

#### `getAllEscrows(limit: ?Nat)`
Lists all escrow accounts.

**Returns:** `[EscrowAccount]`

#### `getLedgerStats()`
Gets comprehensive ledger statistics.

**Returns:** `LedgerStats`

#### `getSystemInfo()`
Gets system information and version details.

**Returns:** `SystemInfo`

## Data Types

### Account
```motoko
type Account = {
    id: Text;
    balance: Nat;
    principal: ?Principal;
    createdAt: Int;
    lastUpdated: Int;
};
```

### Transaction
```motoko
type Transaction = {
    id: Text;
    from: Text;
    to: Text;
    amount: Nat;
    timestamp: Int;
    transactionType: TransactionType;
    escrowId: ?Text;
    status: TransactionStatus;
    memo: ?Text;
};
```

### EscrowAccount
```motoko
type EscrowAccount = {
    id: Text;
    amount: Nat;
    depositor: Text;
    beneficiary: Text;
    status: EscrowStatus;
    createdAt: Int;
    releasedAt: ?Int;
    memo: ?Text;
};
```

### LedgerStats
```motoko
type LedgerStats = {
    totalAccounts: Nat;
    totalBalance: Nat;
    totalTransactions: Nat;
    totalEscrowAmount: Nat;
    activeEscrows: Nat;
};
```

## Configuration

### Constants
- **ESCROW_FEE_PERCENTAGE**: 1% (configurable)
- **MIN_TRANSFER_AMOUNT**: 1000 e8s (minimum transfer amount)
- **FEE_ACCOUNT**: "fee_account" (system fee collection account)

### Persistence
The ledger uses persistent storage with automatic data migration:
- Stable variables for data persistence
- Automatic preupgrade/postupgrade handling
- Data integrity during canister upgrades

## Integration with Existing Escrow Canister

The ICP Ledger is designed to work seamlessly with the existing escrow canister:

1. **Dual Storage**: Both canisters maintain escrow records
2. **Synchronized Operations**: Changes are reflected in both systems
3. **Fallback Support**: If one canister fails, the other maintains data integrity
4. **Transaction Consistency**: All operations are atomic and consistent

## Usage Examples

### Basic Account Operations
```bash
# Create account
dfx canister call icp_ledger createAccount '("user@example.com", null)'

# Mint tokens
dfx canister call icp_ledger mintTokens '("user@example.com", 1000000)'

# Check balance
dfx canister call icp_ledger getAccountBalance '("user@example.com")'
```

### Escrow Operations
```bash
# Create escrow
dfx canister call icp_ledger escrowDeposit '(record{escrowId = "project_001"; beneficiary = "freelancer@example.com"; amount = 500000; memo = opt "Web development project"}, "client@example.com")'

# Release escrow
dfx canister call icp_ledger escrowRelease '(record{escrowId = "project_001"; amount = 250000}, "freelancer@example.com")'

# Refund escrow
dfx canister call icp_ledger escrowRefund '(record{escrowId = "project_001"; reason = opt "Project cancelled"}, "client@example.com")'
```

### Query Operations
```bash
# Get ledger statistics
dfx canister call icp_ledger getLedgerStats

# Get transaction history
dfx canister call icp_ledger getAccountTransactions '("user@example.com", opt 10)'

# Get escrow details
dfx canister call icp_ledger getEscrowAccount '("project_001")'
```

## Security Features

### Access Control
- Account-based permissions
- Escrow authorization (depositor/beneficiary only)
- System-level operations restricted

### Data Integrity
- Atomic transactions
- Consistent state management
- Automatic rollback on failures

### Fee Management
- Automatic fee collection
- Transparent fee structure
- Fee account tracking

## Performance Considerations

### Scalability
- Efficient HashMap storage
- Optimized query operations
- Minimal memory footprint

### Transaction Throughput
- Fast transaction processing
- Minimal computation overhead
- Efficient state updates

## Deployment

### Prerequisites
- DFX development environment
- Internet Computer replica running
- Sufficient cycles for deployment

### Deployment Steps
```bash
# Create canister
dfx canister create icp_ledger

# Build and deploy
dfx build icp_ledger
dfx deploy icp_ledger

# Test deployment
dfx canister call icp_ledger getSystemInfo
```

### Candid Interface
Access the Candid interface at:
```
http://127.0.0.1:4943/?canisterId=<CANDID_CANISTER_ID>&id=<LEDGER_CANISTER_ID>
```

## Testing

### Integration Test Script
Run the comprehensive test script:
```bash
./test_ledger_integration.sh
```

### Manual Testing
1. Create test accounts
2. Mint tokens
3. Test transfers
4. Create escrows
5. Test releases and refunds
6. Verify transaction history

## Error Handling

### Common Error Types
- **Account not found**: Invalid account ID
- **Insufficient balance**: Not enough tokens for operation
- **Escrow not found**: Invalid escrow ID
- **Unauthorized**: Invalid permissions for operation
- **Invalid amount**: Amount below minimum threshold

### Error Recovery
- Automatic rollback on failures
- Detailed error messages
- Transaction status tracking

## Future Enhancements

### Planned Features
- Multi-signature escrow support
- Time-locked escrows
- Escrow dispute resolution
- Advanced analytics dashboard
- API rate limiting
- Batch operations

### Integration Opportunities
- Frontend wallet integration
- Mobile app support
- Third-party service integration
- Cross-chain compatibility

## Support

### Documentation
- This comprehensive guide
- Inline code comments
- Candid interface documentation

### Testing
- Integration test suite
- Manual testing procedures
- Performance benchmarks

### Maintenance
- Regular security audits
- Performance monitoring
- Data backup procedures

---

## Quick Start

1. **Deploy the canister** using the deployment steps above
2. **Create test accounts** using the account management APIs
3. **Mint initial tokens** for testing
4. **Test escrow operations** with the provided examples
5. **Integrate with your frontend** using the Candid interface

The ICP Ledger is now ready for production use with your escrow system! 🚀


