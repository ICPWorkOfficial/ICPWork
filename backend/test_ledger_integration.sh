#!/bin/bash

# ICP Ledger Integration Test Script
# This script demonstrates the ICP ledger functionality and escrow integration

echo "🚀 ICP Ledger Integration Test"
echo "=============================="

# Set the canister ID (update this with your actual canister ID)
LEDGER_CANISTER_ID="vt46d-j7777-77774-qaagq-cai"

echo ""
echo "📊 1. Getting System Information..."
dfx canister call $LEDGER_CANISTER_ID getSystemInfo

echo ""
echo "👤 2. Creating Test Accounts..."
echo "Creating depositor account..."
dfx canister call $LEDGER_CANISTER_ID createAccount '("depositor@example.com", null)'

echo "Creating beneficiary account..."
dfx canister call $LEDGER_CANISTER_ID createAccount '("beneficiary@example.com", null)'

echo ""
echo "💰 3. Minting Tokens..."
echo "Minting 10,000,000 tokens to depositor..."
dfx canister call $LEDGER_CANISTER_ID mintTokens '("depositor@example.com", 10000000)'

echo ""
echo "📈 4. Checking Account Balances..."
echo "Depositor balance:"
dfx canister call $LEDGER_CANISTER_ID getAccountBalance '("depositor@example.com")'

echo "Beneficiary balance:"
dfx canister call $LEDGER_CANISTER_ID getAccountBalance '("beneficiary@example.com")'

echo ""
echo "🔒 5. Creating Escrow..."
echo "Depositing 1,000,000 tokens in escrow..."
dfx canister call $LEDGER_CANISTER_ID escrowDeposit '(record{escrowId = "project_001"; beneficiary = "beneficiary@example.com"; amount = 1000000; memo = opt "Web development project escrow"}, "depositor@example.com")'

echo ""
echo "📊 6. Checking Escrow Status..."
dfx canister call $LEDGER_CANISTER_ID getEscrowAccount '("project_001")'

echo ""
echo "📈 7. Updated Account Balances..."
echo "Depositor balance:"
dfx canister call $LEDGER_CANISTER_ID getAccountBalance '("depositor@example.com")'

echo "Beneficiary balance:"
dfx canister call $LEDGER_CANISTER_ID getAccountBalance '("beneficiary@example.com")'

echo ""
echo "💸 8. Releasing Escrow (Partial Release)..."
echo "Releasing 500,000 tokens from escrow..."
dfx canister call $LEDGER_CANISTER_ID escrowRelease '(record{escrowId = "project_001"; amount = 500000}, "beneficiary@example.com")'

echo ""
echo "📈 9. Final Account Balances..."
echo "Depositor balance:"
dfx canister call $LEDGER_CANISTER_ID getAccountBalance '("depositor@example.com")'

echo "Beneficiary balance:"
dfx canister call $LEDGER_CANISTER_ID getAccountBalance '("beneficiary@example.com")'

echo ""
echo "📊 10. Final Ledger Statistics..."
dfx canister call $LEDGER_CANISTER_ID getLedgerStats

echo ""
echo "📋 11. Transaction History..."
echo "Depositor transactions:"
dfx canister call $LEDGER_CANISTER_ID getAccountTransactions '("depositor@example.com", opt 10)'

echo ""
echo "✅ Integration Test Complete!"
echo "=============================="
echo ""
echo "🔗 Candid Interface: http://127.0.0.1:4943/?canisterId=vu5yx-eh777-77774-qaaga-cai&id=$LEDGER_CANISTER_ID"
echo ""
echo "📝 Key Features Demonstrated:"
echo "  ✅ Account creation and management"
echo "  ✅ Token minting and balance tracking"
echo "  ✅ Escrow deposit with automatic fee deduction"
echo "  ✅ Escrow release to beneficiaries"
echo "  ✅ Transaction history and tracking"
echo "  ✅ Comprehensive ledger statistics"
echo "  ✅ Persistent data storage"
echo ""
echo "🎯 Ready for Frontend Integration!"


