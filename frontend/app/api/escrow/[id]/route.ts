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

// GET - Get escrow details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const escrowId = parseInt(id);

    if (isNaN(escrowId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid escrow ID' },
        { status: 400 }
      );
    }

    const actor = await getEscrowActor();
    const result = await actor.getEscrow(escrowId);

    if (result) {
      // Serialize the escrow data
      const serializedEscrow = JSON.parse(JSON.stringify(result, (key, value) =>
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
    const { action, reason, favorBuyer } = body;

    if (isNaN(escrowId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid escrow ID' },
        { status: 400 }
      );
    }

    const actor = await getEscrowActor();
    let result;

    switch (action) {
      case 'buyerApprove':
        result = await actor.buyerApprove(escrowId);
        break;
      case 'sellerApprove':
        result = await actor.sellerApprove(escrowId);
        break;
      case 'cancel':
        result = await actor.cancelEscrow(escrowId);
        break;
      case 'raiseDispute':
        result = await actor.raiseDispute(escrowId);
        break;
      case 'raiseClientDispute':
        result = await actor.raiseClientDispute(escrowId, reason || '');
        break;
      case 'raiseFreelancerDispute':
        result = await actor.raiseFreelancerDispute(escrowId, reason || '');
        break;
      case 'resolveDispute':
        if (typeof favorBuyer !== 'boolean') {
          return NextResponse.json(
            { success: false, error: 'favorBuyer parameter is required for resolveDispute' },
            { status: 400 }
          );
        }
        result = await actor.resolveDispute(escrowId, favorBuyer);
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
        { success: false, error: result.err },
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
