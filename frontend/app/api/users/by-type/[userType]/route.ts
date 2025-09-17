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
  
  const canisterId = 'ufxgi-4p777-77774-qaadq-cai'; // User management canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get users by type (client or freelancer)
export async function GET(request: Request, { params }: { params: Promise<{ userType: string }> }) {
  try {
    const { userType } = await params;
    
    if (userType !== 'client' && userType !== 'freelancer') {
      return NextResponse.json(
        { error: 'userType must be either "client" or "freelancer"' },
        { status: 400 }
      );
    }
    
    const actor = await getUserManagementActor();
    const users = await actor.getUsersByType(userType);
    
    return NextResponse.json({ 
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get users by type error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
