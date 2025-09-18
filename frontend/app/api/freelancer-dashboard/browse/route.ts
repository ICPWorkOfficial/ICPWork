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

// GET - Browse freelancer profiles
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const mainCategory = url.searchParams.get('mainCategory');
    const subCategory = url.searchParams.get('subCategory');
    const searchTerm = url.searchParams.get('search');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    let result;
    
    if (searchTerm) {
      // Search profiles by title
      result = await actor.searchFreelancerProfiles(sessionId, searchTerm);
    } else if (mainCategory && subCategory) {
      // Get profiles by subcategory
      result = await actor.getFreelancerProfilesBySubCategory(sessionId, mainCategory, subCategory);
    } else if (mainCategory) {
      // Get profiles by category
      result = await actor.getFreelancerProfilesByCategory(sessionId, mainCategory);
    } else {
      // Get all active profiles
      result = await actor.getAllActiveFreelancerProfiles(sessionId);
    }
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to get freelancer profiles', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedProfiles = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      profiles: serializedProfiles
    });
  } catch (error) {
    console.error('Browse freelancer profiles error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
