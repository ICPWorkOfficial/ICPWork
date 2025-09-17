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

// GET - Get all users
export async function GET() {
  try {
    const actor = await getUserManagementActor();
    const users = await actor.getAllUsers();
    
    return NextResponse.json({ 
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Register new user
export async function POST(request: Request) {
  try {
    const { email, password, userType } = await request.json();
    
    // Validate required fields
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, userType' },
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
    const result = await actor.registerUser(email, password, userType);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Registration failed', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedUser = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully',
      user: serializedUser
    });
  } catch (error) {
    console.error('Register user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
