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

// GET - Get freelancer dashboard statistics
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    const result = await actor.getFreelancerDashboardStats(sessionId);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to get dashboard statistics', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedStats = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      stats: serializedStats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
