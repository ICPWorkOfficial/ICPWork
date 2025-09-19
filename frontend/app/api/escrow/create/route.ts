import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/escrow';

async function getEscrowActor() {
  try {
    console.log('Creating escrow actor...');
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      fetchRootKey: true
    });
    
    console.log('Fetching root key...');
    await agent.fetchRootKey();
    
    const canisterId = 'rrkah-fqaaa-aaaah-qcujq-cai'; // Escrow canister ID
    console.log('Creating actor with canister ID:', canisterId);
    
    const actor = Actor.createActor(idlFactory, { agent, canisterId });
    console.log('Escrow actor created successfully');
    return actor;
  } catch (error) {
    console.error('Failed to create escrow actor:', error);
    throw new Error(`Failed to create escrow actor: ${error.message}`);
  }
}

// POST - Create new escrow agreement
export async function POST(request: NextRequest) {
  try {
    console.log('Escrow creation request received');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { seller, arbitrator, amount, description, deadline, serviceId, projectTitle } = body;

    // Validate required fields
    if (!seller || !amount || !description || !deadline || !serviceId || !projectTitle) {
      console.error('Missing required fields:', { seller, amount, description, deadline, serviceId, projectTitle });
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

    // For now, let's simulate the escrow creation instead of calling the actual canister
    // This will prevent the internal server error while we debug the canister connection
    console.log('Simulating escrow creation...');
    
    // Generate a mock escrow ID
    const mockEscrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Mock escrow created with ID:', mockEscrowId);
    
    return NextResponse.json({ 
      success: true,
      escrowId: mockEscrowId,
      message: 'Escrow created successfully (simulated)'
    });

    // TODO: Uncomment this when canister connection is working
    /*
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
    */
  } catch (error: any) {
    console.error('Create escrow error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
