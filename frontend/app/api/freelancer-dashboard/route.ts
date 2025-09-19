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

// GET - Get all freelancer profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const actor = await getFreelancerDashboardActor();
    
    let result;
    if (search) {
      result = await actor.searchProfilesByTitle(search);
    } else if (category && subCategory) {
      result = await actor.getProfilesBySubCategory(category, subCategory);
    } else if (category) {
      result = await actor.getProfilesByCategory(category);
    } else if (activeOnly) {
      result = await actor.getActiveProfiles();
    } else {
      result = await actor.getAllProfiles();
    }

    if (result.ok) {
      const profiles = result.ok;
      const serializedProfiles = JSON.parse(JSON.stringify(profiles, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        profiles: serializedProfiles,
        count: serializedProfiles.length
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get freelancer profiles error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create freelancer profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profile } = body;

    if (!email || !profile) {
      return NextResponse.json(
        { success: false, error: 'Email and profile data are required' },
        { status: 400 }
      );
    }

    const actor = await getFreelancerDashboardActor();
    const result = await actor.createProfile(email, profile);

    if (result.ok) {
      const serializedProfile = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        profile: serializedProfile,
        message: 'Profile created successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Create freelancer profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}