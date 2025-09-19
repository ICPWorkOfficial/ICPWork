import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/freelancer_dashboard';

async function getFreelancerDashboardActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'umunu-kh777-77774-qaaca-cai'; // Freelancer dashboard canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get freelancer profile by createdAt timestamp
export async function GET(
  request: NextRequest,
  { params }: { params: { createdAt: string } }
) {
  try {
    const { createdAt } = params;

    if (!createdAt) {
      return NextResponse.json(
        { success: false, error: 'createdAt parameter is required' },
        { status: 400 }
      );
    }

    const actor = await getFreelancerDashboardActor();
    
    // Get all profiles and find the one with matching createdAt
    const result = await actor.getAllProfiles();

    if (result.ok) {
      const profiles = result.ok;
      
      // Find profile with matching createdAt
      const foundProfile = profiles.find(([email, profile]: [string, any]) => 
        profile.createdAt === createdAt
      );
      
      if (foundProfile) {
        const [email, profile] = foundProfile;
        
        // Serialize the profile data
        const serializedProfile = JSON.parse(JSON.stringify(profile, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ));
        
        return NextResponse.json({ 
          success: true,
          profile: serializedProfile,
          email: email,
          createdAt: createdAt
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Profile not found with the given createdAt' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get profile by createdAt error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
