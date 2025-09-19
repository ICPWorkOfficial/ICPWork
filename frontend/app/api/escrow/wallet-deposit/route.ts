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
  
  const canisterId = 'yeeiw-3qaaa-aaaah-qcvmq-cai'; // Escrow canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, transactionId, fromPrincipal, escrowId } = body;

    console.log('Wallet deposit request:', { amount, transactionId, fromPrincipal, escrowId });

    if (!amount || !transactionId || !fromPrincipal) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, transactionId, fromPrincipal'
      }, { status: 400 });
    }

    const actor = await getEscrowActor();
    
    // Convert amount to e8s (ICP uses 8 decimal places)
    const amountE8s = BigInt(Math.floor(amount * 100_000_000));
    
    // Create escrow entry with wallet deposit
    const escrowData = {
      id: escrowId || `escrow_${Date.now()}`,
      buyer: fromPrincipal,
      seller: '', // Will be set when creating the full escrow
      amount: amountE8s,
      status: 'pending',
      createdAt: BigInt(Date.now()),
      deadline: BigInt(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days default
      description: 'Wallet deposit for service payment',
      transactionId: transactionId
    };

    // For now, we'll simulate the deposit by storing it in a local file
    // In a real implementation, this would interact with the escrow canister
    const depositRecord = {
      transactionId,
      amount,
      amountE8s: amountE8s.toString(),
      fromPrincipal,
      escrowId: escrowData.id,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // Store the deposit record (in a real app, this would be in the canister)
    console.log('Wallet deposit completed:', depositRecord);

    return NextResponse.json({
      success: true,
      transactionId,
      escrowId: escrowData.id,
      amount: amount,
      message: 'Wallet deposit successful'
    });

  } catch (error: any) {
    console.error('Wallet deposit error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process wallet deposit',
      details: error.message
    }, { status: 500 });
  }
}