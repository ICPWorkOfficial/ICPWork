import { NextRequest, NextResponse } from 'next/server';

// Mock ICP Ledger API for testing purposes
// This simulates the ledger responses without requiring dfx access

// Mock data
const mockStats = {
  totalAccounts: 3,
  totalBalance: 10000000,
  totalTransactions: 5,
  totalEscrowAmount: 985000,
  activeEscrows: 2
};

const mockSystemInfo = {
  ledgerVersion: "1.0.0",
  totalAccounts: 3,
  totalTransactions: 5,
  totalEscrows: 2,
  feeAccountBalance: 10000
};

const mockAccounts = new Map([
  ['test_account', { id: 'test_account', balance: 1000000, principal: null, createdAt: Date.now(), lastUpdated: Date.now() }],
  ['depositor@example.com', { id: 'depositor@example.com', balance: 9000000, principal: null, createdAt: Date.now(), lastUpdated: Date.now() }],
  ['beneficiary@example.com', { id: 'beneficiary@example.com', balance: 500000, principal: null, createdAt: Date.now(), lastUpdated: Date.now() }]
]);

const mockEscrows = new Map([
  ['project_001', { id: 'project_001', amount: 490000, depositor: 'depositor@example.com', beneficiary: 'beneficiary@example.com', status: 'Active', createdAt: Date.now(), releasedAt: null, memo: 'Web development project escrow' }],
  ['escrow_001', { id: 'escrow_001', amount: 495000, depositor: 'test_account', beneficiary: 'beneficiary@example.com', status: 'Active', createdAt: Date.now(), releasedAt: null, memo: 'Test escrow deposit' }]
]);

const mockTransactions = [
  { id: 'tx_1', from: 'system', to: 'test_account', amount: 1000000, timestamp: Date.now(), transactionType: 'Transfer', escrowId: null, status: 'Completed', memo: 'Token mint' },
  { id: 'tx_2', from: 'test_account', to: 'escrow_001', amount: 500000, timestamp: Date.now(), transactionType: 'EscrowDeposit', escrowId: 'escrow_001', status: 'Completed', memo: 'Test escrow deposit' },
  { id: 'tx_3', from: 'system', to: 'depositor@example.com', amount: 10000000, timestamp: Date.now(), transactionType: 'Transfer', escrowId: null, status: 'Completed', memo: 'Token mint' },
  { id: 'tx_4', from: 'depositor@example.com', to: 'project_001', amount: 1000000, timestamp: Date.now(), transactionType: 'EscrowDeposit', escrowId: 'project_001', status: 'Completed', memo: 'Web development project escrow' },
  { id: 'tx_5', from: 'project_001', to: 'beneficiary@example.com', amount: 500000, timestamp: Date.now(), transactionType: 'EscrowRelease', escrowId: 'project_001', status: 'Completed', memo: null }
];

// GET - Get ledger information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return NextResponse.json({ success: true, data: mockStats });

      case 'system-info':
        return NextResponse.json({ success: true, data: mockSystemInfo });

      case 'balance':
        const accountId = searchParams.get('accountId');
        if (!accountId) {
          return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
        }
        const account = mockAccounts.get(accountId);
        if (!account) {
          return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { ok: account.balance } });

      case 'transactions':
        const accountIdForTx = searchParams.get('accountId');
        const limit = searchParams.get('limit');
        if (!accountIdForTx) {
          return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
        }
        const accountTransactions = mockTransactions.filter(tx => 
          tx.from === accountIdForTx || tx.to === accountIdForTx
        );
        const limitedTransactions = limit ? accountTransactions.slice(0, parseInt(limit)) : accountTransactions;
        return NextResponse.json({ success: true, data: { ok: limitedTransactions } });

      case 'escrow':
        const escrowId = searchParams.get('escrowId');
        if (!escrowId) {
          return NextResponse.json({ success: false, error: 'Escrow ID is required' }, { status: 400 });
        }
        const escrow = mockEscrows.get(escrowId);
        if (!escrow) {
          return NextResponse.json({ success: false, error: 'Escrow not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { ok: escrow } });

      case 'all-escrows':
        const escrowLimit = searchParams.get('limit');
        const allEscrows = Array.from(mockEscrows.values());
        const limitedEscrows = escrowLimit ? allEscrows.slice(0, parseInt(escrowLimit)) : allEscrows;
        return NextResponse.json({ success: true, data: limitedEscrows });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Mock Ledger API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Perform ledger operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create-account':
        const { accountId, principal } = params;
        if (!accountId) {
          return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
        }
        if (mockAccounts.has(accountId)) {
          return NextResponse.json({ success: false, error: 'Account already exists' }, { status: 400 });
        }
        const newAccount = { id: accountId, balance: 0, principal, createdAt: Date.now(), lastUpdated: Date.now() };
        mockAccounts.set(accountId, newAccount);
        return NextResponse.json({ success: true, data: { ok: newAccount } });

      case 'mint-tokens':
        const { accountId: mintAccountId, amount: mintAmount } = params;
        if (!mintAccountId || !mintAmount) {
          return NextResponse.json({ success: false, error: 'Account ID and amount are required' }, { status: 400 });
        }
        const mintAccount = mockAccounts.get(mintAccountId);
        if (!mintAccount) {
          return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
        }
        mintAccount.balance += parseInt(mintAmount);
        mintAccount.lastUpdated = Date.now();
        const mintTransaction = { id: `tx_${Date.now()}`, from: 'system', to: mintAccountId, amount: parseInt(mintAmount), timestamp: Date.now(), transactionType: 'Transfer', escrowId: null, status: 'Completed', memo: 'Token mint' };
        mockTransactions.push(mintTransaction);
        return NextResponse.json({ success: true, data: { ok: mintTransaction } });

      case 'transfer':
        const { from, to, amount, memo } = params;
        if (!from || !to || !amount) {
          return NextResponse.json({ success: false, error: 'From, to, and amount are required' }, { status: 400 });
        }
        const fromAccount = mockAccounts.get(from);
        const toAccount = mockAccounts.get(to);
        if (!fromAccount) {
          return NextResponse.json({ success: false, error: 'Sender account not found' }, { status: 404 });
        }
        if (fromAccount.balance < parseInt(amount)) {
          return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }
        fromAccount.balance -= parseInt(amount);
        fromAccount.lastUpdated = Date.now();
        if (toAccount) {
          toAccount.balance += parseInt(amount);
          toAccount.lastUpdated = Date.now();
        } else {
          mockAccounts.set(to, { id: to, balance: parseInt(amount), principal: null, createdAt: Date.now(), lastUpdated: Date.now() });
        }
        const transferTransaction = { id: `tx_${Date.now()}`, from, to, amount: parseInt(amount), timestamp: Date.now(), transactionType: 'Transfer', escrowId: null, status: 'Completed', memo };
        mockTransactions.push(transferTransaction);
        return NextResponse.json({ success: true, data: { ok: transferTransaction } });

      case 'escrow-deposit':
        const { escrowId: depositEscrowId, depositor, beneficiary, amount: escrowAmount, memo: escrowMemo } = params;
        if (!depositEscrowId || !depositor || !beneficiary || !escrowAmount) {
          return NextResponse.json({ success: false, error: 'Escrow ID, depositor, beneficiary, and amount are required' }, { status: 400 });
        }
        const depositorAccount = mockAccounts.get(depositor);
        if (!depositorAccount) {
          return NextResponse.json({ success: false, error: 'Depositor account not found' }, { status: 404 });
        }
        if (depositorAccount.balance < parseInt(escrowAmount)) {
          return NextResponse.json({ success: false, error: 'Insufficient balance for escrow deposit' }, { status: 400 });
        }
        const feeAmount = Math.floor(parseInt(escrowAmount) * 0.01); // 1% fee
        const netAmount = parseInt(escrowAmount) - feeAmount;
        depositorAccount.balance -= parseInt(escrowAmount);
        depositorAccount.lastUpdated = Date.now();
        const newEscrow = { id: depositEscrowId, amount: netAmount, depositor, beneficiary, status: 'Active', createdAt: Date.now(), releasedAt: null, memo: escrowMemo };
        mockEscrows.set(depositEscrowId, newEscrow);
        const escrowTransaction = { id: `tx_${Date.now()}`, from: depositor, to: depositEscrowId, amount: parseInt(escrowAmount), timestamp: Date.now(), transactionType: 'EscrowDeposit', escrowId: depositEscrowId, status: 'Completed', memo: escrowMemo };
        mockTransactions.push(escrowTransaction);
        return NextResponse.json({ success: true, data: { ok: { transaction: escrowTransaction, escrowAccount: newEscrow } } });

      case 'escrow-release':
        const { escrowId: releaseEscrowId, releaser, amount: releaseAmount } = params;
        if (!releaseEscrowId || !releaser || !releaseAmount) {
          return NextResponse.json({ success: false, error: 'Escrow ID, releaser, and amount are required' }, { status: 400 });
        }
        const releaseEscrow = mockEscrows.get(releaseEscrowId);
        if (!releaseEscrow) {
          return NextResponse.json({ success: false, error: 'Escrow not found' }, { status: 404 });
        }
        if (releaseEscrow.status !== 'Active') {
          return NextResponse.json({ success: false, error: 'Escrow is not active' }, { status: 400 });
        }
        if (parseInt(releaseAmount) > releaseEscrow.amount) {
          return NextResponse.json({ success: false, error: 'Release amount exceeds escrow balance' }, { status: 400 });
        }
        const beneficiaryAccount = mockAccounts.get(releaseEscrow.beneficiary);
        if (beneficiaryAccount) {
          beneficiaryAccount.balance += parseInt(releaseAmount);
          beneficiaryAccount.lastUpdated = Date.now();
        } else {
          mockAccounts.set(releaseEscrow.beneficiary, { id: releaseEscrow.beneficiary, balance: parseInt(releaseAmount), principal: null, createdAt: Date.now(), lastUpdated: Date.now() });
        }
        releaseEscrow.amount -= parseInt(releaseAmount);
        if (releaseEscrow.amount === 0) {
          releaseEscrow.status = 'Released';
          releaseEscrow.releasedAt = Date.now();
        }
        const releaseTransaction = { id: `tx_${Date.now()}`, from: releaseEscrowId, to: releaseEscrow.beneficiary, amount: parseInt(releaseAmount), timestamp: Date.now(), transactionType: 'EscrowRelease', escrowId: releaseEscrowId, status: 'Completed', memo: null };
        mockTransactions.push(releaseTransaction);
        return NextResponse.json({ success: true, data: { ok: releaseTransaction } });

      case 'escrow-refund':
        const { escrowId: refundEscrowId, refunder, reason } = params;
        if (!refundEscrowId || !refunder) {
          return NextResponse.json({ success: false, error: 'Escrow ID and refunder are required' }, { status: 400 });
        }
        const refundEscrow = mockEscrows.get(refundEscrowId);
        if (!refundEscrow) {
          return NextResponse.json({ success: false, error: 'Escrow not found' }, { status: 404 });
        }
        if (refundEscrow.status !== 'Active') {
          return NextResponse.json({ success: false, error: 'Escrow is not active' }, { status: 400 });
        }
        const refundDepositorAccount = mockAccounts.get(refundEscrow.depositor);
        if (refundDepositorAccount) {
          refundDepositorAccount.balance += refundEscrow.amount;
          refundDepositorAccount.lastUpdated = Date.now();
        }
        refundEscrow.status = 'Refunded';
        refundEscrow.releasedAt = Date.now();
        const refundTransaction = { id: `tx_${Date.now()}`, from: refundEscrowId, to: refundEscrow.depositor, amount: refundEscrow.amount, timestamp: Date.now(), transactionType: 'EscrowRefund', escrowId: refundEscrowId, status: 'Completed', memo: reason };
        mockTransactions.push(refundTransaction);
        return NextResponse.json({ success: true, data: { ok: refundTransaction } });

      case 'burn-tokens':
        const { accountId: burnAccountId, amount: burnAmount } = params;
        if (!burnAccountId || !burnAmount) {
          return NextResponse.json({ success: false, error: 'Account ID and amount are required' }, { status: 400 });
        }
        const burnAccount = mockAccounts.get(burnAccountId);
        if (!burnAccount) {
          return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
        }
        if (burnAccount.balance < parseInt(burnAmount)) {
          return NextResponse.json({ success: false, error: 'Insufficient balance to burn' }, { status: 400 });
        }
        burnAccount.balance -= parseInt(burnAmount);
        burnAccount.lastUpdated = Date.now();
        const burnTransaction = { id: `tx_${Date.now()}`, from: burnAccountId, to: 'system', amount: parseInt(burnAmount), timestamp: Date.now(), transactionType: 'Transfer', escrowId: null, status: 'Completed', memo: 'Token burn' };
        mockTransactions.push(burnTransaction);
        return NextResponse.json({ success: true, data: { ok: burnTransaction } });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Mock Ledger API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}


