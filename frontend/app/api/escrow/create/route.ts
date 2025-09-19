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

// POST - Create new escrow agreement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seller, arbitrator, amount, description, deadline, serviceId, projectTitle } = body;

    // Validate required fields
    if (!seller || !amount || !description || !deadline || !serviceId || !projectTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Convert deadline to nanoseconds (assuming it's provided in milliseconds)
    const deadlineInNanoseconds = BigInt(deadline) * BigInt(1000000);

    const actor = await getEscrowActor();
    const result = await actor.createEscrow({
      seller: seller,
      arbitrator: arbitrator || null,
      amount: BigInt(amount),
      description: description,
      deadline: deadlineInNanoseconds,
      serviceId: serviceId,
      projectTitle: projectTitle
    });

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        escrowId: result.ok,
        message: 'Escrow created successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Create escrow error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
