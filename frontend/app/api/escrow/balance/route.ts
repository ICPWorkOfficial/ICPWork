import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get user's balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    const result = await actor.getEscrowBalance(sessionId);

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        balance: result.ok.toString()
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to get balance' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Deposit or withdraw funds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, amount } = body;

    if (!sessionId || !action || !amount) {
      return NextResponse.json(
        { success: false, error: 'Session ID, action and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    let result;

    switch (action) {
      case 'deposit':
        result = await actor.depositToEscrow(sessionId, BigInt(amount));
        break;
      case 'withdraw':
        result = await actor.withdrawFromEscrow(sessionId, BigInt(amount));
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use "deposit" or "withdraw"' },
          { status: 400 }
        );
    }

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        newBalance: result.ok.toString(),
        message: `${action} successful`
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to process balance operation' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Balance operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
