import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ICP Ledger Canister Integration API
// This API provides a REST interface to the ICP Ledger Canister

const LEDGER_CANISTER_ID = "vt46d-j7777-77774-qaagq-cai";

// Helper function to call the ledger canister using dfx
async function callLedgerCanister(method: string, args: any[] = []) {
  try {
    // Convert args to dfx format
    const argsString = args.map(arg => {
      if (arg === null || arg === undefined) {
        return 'null';
      }
      if (typeof arg === 'string') {
        return `"${arg}"`;
      }
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return arg.toString();
    }).join(' ');

    // Build the dfx command
    const command = `dfx canister call ${LEDGER_CANISTER_ID} ${method} ${argsString}`;
    
    console.log('Executing command:', command);
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: '/home/techno/Desktop/ICPWork/backend',
      timeout: 30000 // 30 second timeout
    });

    if (stderr) {
      console.error('DFX stderr:', stderr);
    }

    // Parse the output - dfx returns the result directly
    const result = stdout.trim();
    
    // Try to parse as JSON if it looks like JSON
    if (result.startsWith('(') && result.endsWith(')')) {
      // This is likely a Candid result, we'll return it as-is for now
      return result;
    }
    
    return result;
  } catch (error) {
    console.error('Ledger canister call error:', error);
    throw error;
  }
}

// GET - Get ledger information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await callLedgerCanister('getLedgerStats');
        return NextResponse.json({ success: true, data: stats, raw: true });

      case 'system-info':
        const systemInfo = await callLedgerCanister('getSystemInfo');
        return NextResponse.json({ success: true, data: systemInfo, raw: true });

      case 'balance':
        const accountId = searchParams.get('accountId');
        if (!accountId) {
          return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
        }
        const balance = await callLedgerCanister('getAccountBalance', [accountId]);
        return NextResponse.json({ success: true, data: balance, raw: true });

      case 'transactions':
        const accountIdForTx = searchParams.get('accountId');
        const limit = searchParams.get('limit');
        if (!accountIdForTx) {
          return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
        }
        const transactions = await callLedgerCanister('getAccountTransactions', [accountIdForTx, limit ? parseInt(limit) : null]);
        return NextResponse.json({ success: true, data: transactions, raw: true });

      case 'escrow':
        const escrowId = searchParams.get('escrowId');
        if (!escrowId) {
          return NextResponse.json({ success: false, error: 'Escrow ID is required' }, { status: 400 });
        }
        const escrow = await callLedgerCanister('getEscrowAccount', [escrowId]);
        return NextResponse.json({ success: true, data: escrow, raw: true });

      case 'all-escrows':
        const escrowLimit = searchParams.get('limit');
        const allEscrows = await callLedgerCanister('getAllEscrows', [escrowLimit ? parseInt(escrowLimit) : null]);
        return NextResponse.json({ success: true, data: allEscrows, raw: true });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Ledger API error:', error);
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
        const account = await callLedgerCanister('createAccount', [accountId, principal || null]);
        return NextResponse.json({ success: true, data: account, raw: true });

      case 'mint-tokens':
        const { accountId: mintAccountId, amount: mintAmount } = params;
        if (!mintAccountId || !mintAmount) {
          return NextResponse.json({ success: false, error: 'Account ID and amount are required' }, { status: 400 });
        }
        const mintResult = await callLedgerCanister('mintTokens', [mintAccountId, parseInt(mintAmount)]);
        return NextResponse.json({ success: true, data: mintResult, raw: true });

      case 'transfer':
        const { from, to, amount, memo } = params;
        if (!from || !to || !amount) {
          return NextResponse.json({ success: false, error: 'From, to, and amount are required' }, { status: 400 });
        }
        const transferArgs = { to, amount: parseInt(amount), memo: memo || null };
        const transferResult = await callLedgerCanister('transfer', [transferArgs, from]);
        return NextResponse.json({ success: true, data: transferResult, raw: true });

      case 'escrow-deposit':
        const { escrowId, depositor, beneficiary, amount: escrowAmount, memo: escrowMemo } = params;
        if (!escrowId || !depositor || !beneficiary || !escrowAmount) {
          return NextResponse.json({ success: false, error: 'Escrow ID, depositor, beneficiary, and amount are required' }, { status: 400 });
        }
        const escrowDepositArgs = {
          escrowId,
          beneficiary,
          amount: parseInt(escrowAmount),
          memo: escrowMemo || null
        };
        const escrowDepositResult = await callLedgerCanister('escrowDeposit', [escrowDepositArgs, depositor]);
        return NextResponse.json({ success: true, data: escrowDepositResult, raw: true });

      case 'escrow-release':
        const { escrowId: releaseEscrowId, releaser, amount: releaseAmount } = params;
        if (!releaseEscrowId || !releaser || !releaseAmount) {
          return NextResponse.json({ success: false, error: 'Escrow ID, releaser, and amount are required' }, { status: 400 });
        }
        const escrowReleaseArgs = {
          escrowId: releaseEscrowId,
          amount: parseInt(releaseAmount)
        };
        const escrowReleaseResult = await callLedgerCanister('escrowRelease', [escrowReleaseArgs, releaser]);
        return NextResponse.json({ success: true, data: escrowReleaseResult, raw: true });

      case 'escrow-refund':
        const { escrowId: refundEscrowId, refunder, reason } = params;
        if (!refundEscrowId || !refunder) {
          return NextResponse.json({ success: false, error: 'Escrow ID and refunder are required' }, { status: 400 });
        }
        const escrowRefundArgs = {
          escrowId: refundEscrowId,
          reason: reason || null
        };
        const escrowRefundResult = await callLedgerCanister('escrowRefund', [escrowRefundArgs, refunder]);
        return NextResponse.json({ success: true, data: escrowRefundResult, raw: true });

      case 'burn-tokens':
        const { accountId: burnAccountId, amount: burnAmount } = params;
        if (!burnAccountId || !burnAmount) {
          return NextResponse.json({ success: false, error: 'Account ID and amount are required' }, { status: 400 });
        }
        const burnResult = await callLedgerCanister('burnTokens', [burnAccountId, parseInt(burnAmount)]);
        return NextResponse.json({ success: true, data: burnResult, raw: true });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Ledger API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
