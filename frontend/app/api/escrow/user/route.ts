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
  
  const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get user's escrows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const type = searchParams.get('type'); // 'my', 'arbitration', 'service'
    const serviceId = searchParams.get('serviceId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    let result;

    switch (type) {
      case 'my':
        result = await actor.getMyEscrows(sessionId);
        break;
      case 'arbitration':
        result = await actor.getArbitrationEscrows(sessionId);
        break;
      case 'service':
        if (!serviceId) {
          return NextResponse.json(
            { success: false, error: 'serviceId parameter is required for service type' },
            { status: 400 }
          );
        }
        result = await actor.getEscrowsByService(sessionId, serviceId);
        break;
      default:
        result = await actor.getMyEscrows(sessionId);
    }

    if ('ok' in result) {
      // Serialize the escrows data
      const serializedEscrows = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        escrows: serializedEscrows
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to get escrows' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get user escrows error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
