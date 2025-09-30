import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainActor() {
  try {
    console.log('Creating main actor...');
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      fetchRootKey: true
    });
    
    console.log('Fetching root key...');
    await agent.fetchRootKey();
    
    const canisterId = 'uzt4z-lp777-77774-qaabq-cai'; // Escrow canister ID
    console.log('Creating actor with canister ID:', canisterId);
    
    const actor = Actor.createActor(idlFactory, { agent, canisterId });
    console.log('Main actor created successfully');
    return actor;
  } catch (error) {
    console.error('Failed to create main actor:', error);
    throw new Error(`Failed to create main actor: ${error.message}`);
  }
}

// POST - Create new escrow agreement
export async function POST(request: NextRequest) {
  try {
    console.log('Escrow creation request received');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { sessionId, seller, arbitrator, amount, description, deadline, serviceId, projectTitle } = body;

    // Validate required fields
    if (!sessionId || !seller || !amount || !description || !deadline || !serviceId || !projectTitle) {
      console.error('Missing required fields:', { sessionId, seller, amount, description, deadline, serviceId, projectTitle });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    console.log('All validation passed, creating escrow...');

    // Convert deadline to nanoseconds (assuming it's provided in milliseconds)
    const deadlineInNanoseconds = BigInt(deadline) * BigInt(1000000);
    console.log('Converted deadline:', deadlineInNanoseconds.toString());

    const actor = await getMainActor();
    const result = await actor.createEscrow(sessionId, {
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
        escrowId: result.ok.toString(),
        message: 'Escrow created successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create escrow' },
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
