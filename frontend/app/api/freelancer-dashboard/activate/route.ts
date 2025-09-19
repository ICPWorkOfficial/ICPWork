import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/freelancer_dashboard';

async function getFreelancerDashboardActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'umunu-kh777-77774-qaaca-cai'; // Freelancer dashboard canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// POST - Activate freelancer profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const actor = await getFreelancerDashboardActor();
    const result = await actor.activateProfile(email);

    if (result.ok) {
      const serializedProfile = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        profile: serializedProfile,
        message: 'Profile activated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Activate freelancer profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}