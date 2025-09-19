import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/escrow';

async function getEscrowActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'rrkah-fqaaa-aaaah-qcujq-cai'; // Escrow canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get user's balance
export async function GET(request: NextRequest) {
  try {
    const actor = await getEscrowActor();
    const balance = await actor.getMyBalance();

    return NextResponse.json({ 
      success: true,
      balance: balance.toString()
    });
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
    const { action, amount } = body;

    if (!action || !amount) {
      return NextResponse.json(
        { success: false, error: 'Action and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const actor = await getEscrowActor();
    let result;

    switch (action) {
      case 'deposit':
        result = await actor.deposit(BigInt(amount));
        break;
      case 'withdraw':
        result = await actor.withdraw(BigInt(amount));
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
        { success: false, error: result.err },
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
