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

// GET - Get user's escrows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my', 'arbitration', 'service'
    const serviceId = searchParams.get('serviceId');

    const actor = await getEscrowActor();
    let result;

    switch (type) {
      case 'my':
        result = await actor.getMyEscrows();
        break;
      case 'arbitration':
        result = await actor.getArbitrationEscrows();
        break;
      case 'service':
        if (!serviceId) {
          return NextResponse.json(
            { success: false, error: 'serviceId parameter is required for service type' },
            { status: 400 }
          );
        }
        result = await actor.getEscrowsByService(serviceId);
        break;
      default:
        result = await actor.getMyEscrows();
    }

    // Serialize the escrows data
    const serializedEscrows = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      escrows: serializedEscrows
    });
  } catch (error: any) {
    console.error('Get user escrows error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
