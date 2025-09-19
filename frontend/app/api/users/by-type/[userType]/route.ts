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
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // User management canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get users by type (client or freelancer)
export async function GET(request: Request, { params }: { params: Promise<{ userType: string }> }) {
  try {
    const { userType } = await params;
    
    // Validate userType parameter
    if (!userType) {
      return NextResponse.json(
        { error: 'userType parameter is required' },
        { status: 400 }
      );
    }
    
    if (userType !== 'client' && userType !== 'freelancer') {
      return NextResponse.json(
        { error: 'userType must be either "client" or "freelancer"' },
        { status: 400 }
      );
    }
    
    const actor = await getUserManagementActor();
    const users = await actor.getUsersByType(userType);
    
    // Convert BigInt values to strings for JSON serialization
    const serializedUsers = JSON.parse(JSON.stringify(users, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      users: serializedUsers,
      count: serializedUsers.length,
      message: `Retrieved ${serializedUsers.length} ${userType} users`
    });
  } catch (error) {
    console.error('Get users by type error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
