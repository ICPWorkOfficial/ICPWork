import { NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vizcg-th777-77774-qaaea-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// POST - Activate freelancer profile
export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    const result = await actor.activateFreelancerProfile(sessionId);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to activate freelancer profile', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      message: 'Freelancer profile activated successfully',
      profile: serializedProfile
    });
  } catch (error) {
    console.error('Activate freelancer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
