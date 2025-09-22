import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, amount } = body;

    console.log('Wallet deposit request:', { sessionId, amount });

    if (!sessionId || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, amount'
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be greater than 0'
      }, { status: 400 });
    }

    const actor = await getMainActor();
    
    // Convert amount to e8s (ICP uses 8 decimal places)
    const amountE8s = BigInt(Math.floor(amount * 100_000_000));
    
    // Deposit to escrow account
    const result = await actor.depositToEscrow(sessionId, amountE8s) as any;

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        newBalance: result.ok.toString(),
        amount: amount,
        message: 'Wallet deposit successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to deposit to escrow'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Wallet deposit error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process wallet deposit',
      details: error.message
    }, { status: 500 });
  }
}