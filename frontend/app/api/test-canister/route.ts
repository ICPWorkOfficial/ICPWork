import { NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/user_management';

export async function GET() {
  try {
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      verifyUpdateSignatures: false,
      fetchRootKey: true
    });
    
    await agent.fetchRootKey();
    
    const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // User management canister ID
    const actor = Actor.createActor(idlFactory, { agent, canisterId });
    
    // Try to call a simple method
    const result = await actor.getAllUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Canister connection successful!',
      result: result,
      canisterId: canisterId
    });
  } catch (error: any) {
    console.error('Canister test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
