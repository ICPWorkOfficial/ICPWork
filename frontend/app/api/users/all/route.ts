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

// GET - Get all user data
export async function GET() {
  try {
    const actor = await getUserManagementActor();
    const users = await actor.getAllUsers();
    
    // Convert BigInt values to strings for JSON serialization
    const serializedUsers = JSON.parse(JSON.stringify(users, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      users: serializedUsers,
      count: serializedUsers.length,
      message: `Retrieved ${serializedUsers.length} users`
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
