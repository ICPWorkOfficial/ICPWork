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

// POST - Deposit funds from wallet to escrow account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, transactionId, principal } = body;

    // Validate required fields
    if (!amount || !transactionId || !principal) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, transactionId, principal' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify the transaction ID with the ICP network
    // 2. Confirm the transfer was successful
    // 3. Update the escrow balance
    
    // For now, we'll simulate the deposit
    const actor = await getEscrowActor();
    
    // Simulate depositing funds to the user's escrow balance
    const result = await actor.deposit(BigInt(amount));

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        newBalance: result.ok.toString(),
        transactionId: transactionId,
        message: 'Funds deposited successfully from wallet'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Wallet deposit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
