import { NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/user_management';

async function getUserManagementActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // User management canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get user data by specific email
export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    
    const actor = await getUserManagementActor();
    const result = await actor.getUser(email);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'User not found', details: result.err },
        { status: 404 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedUser = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      user: serializedUser
    });
  } catch (error) {
    console.error('Get user by email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
