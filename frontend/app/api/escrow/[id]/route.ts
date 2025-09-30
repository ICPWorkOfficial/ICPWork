import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get escrow details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const escrowId = parseInt(id);

    if (isNaN(escrowId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid escrow ID' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    const result = await actor.getEscrow(sessionId, escrowId) as any;

    if ('ok' in result && result.ok) {
      // Serialize the escrow data
      const serializedEscrow = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        escrow: serializedEscrow
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Escrow not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Get escrow error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Update escrow (approve, cancel, dispute, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const escrowId = parseInt(id);
    const body = await request.json();
    const { sessionId, action, reason, favorBuyer } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (isNaN(escrowId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid escrow ID' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    let result: any;

    switch (action) {
      case 'buyerApprove':
        result = await actor.buyerApproveEscrow(sessionId, escrowId);
        break;
      case 'sellerApprove':
        result = await actor.sellerApproveEscrow(sessionId, escrowId);
        break;
      case 'cancel':
        result = await actor.cancelEscrow(sessionId, escrowId);
        break;
      case 'raiseDispute':
        result = await actor.raiseEscrowDispute(sessionId, escrowId);
        break;
      case 'raiseClientDispute':
        result = await actor.raiseClientDispute(sessionId, escrowId, reason || '');
        break;
      case 'raiseFreelancerDispute':
        result = await actor.raiseFreelancerDispute(sessionId, escrowId, reason || '');
        break;
      case 'resolveDispute':
        if (typeof favorBuyer !== 'boolean') {
          return NextResponse.json(
            { success: false, error: 'favorBuyer parameter is required for resolveDispute' },
            { status: 400 }
          );
        }
        result = await actor.resolveEscrowDispute(sessionId, escrowId, favorBuyer);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        message: result.ok
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update escrow' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update escrow error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
