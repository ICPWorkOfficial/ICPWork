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

// POST - Create freelancer profile
export async function POST(request: Request) {
  try {
    const { sessionId, profile } = await request.json();
    
    // Validate required fields
    if (!sessionId || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, profile' },
        { status: 400 }
      );
    }

    // Validate profile structure
    if (!profile.serviceTitle || !profile.mainCategory || !profile.subCategory || !profile.description) {
      return NextResponse.json(
        { error: 'Missing required profile fields: serviceTitle, mainCategory, subCategory, description' },
        { status: 400 }
      );
    }

    // Validate requirement plans
    if (!profile.requirementPlans || !profile.requirementPlans.basic || !profile.requirementPlans.advanced || !profile.requirementPlans.premium) {
      return NextResponse.json(
        { error: 'Missing required requirement plans: basic, advanced, premium' },
        { status: 400 }
      );
    }

    // Validate portfolio images (max 5)
    if (profile.portfolioImages && profile.portfolioImages.length > 5) {
      return NextResponse.json(
        { error: 'Too many portfolio images (maximum 5 allowed)' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    const result = await actor.createFreelancerDashboardProfile(sessionId, profile);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to create freelancer profile', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      message: 'Freelancer profile created successfully',
      profile: serializedProfile
    });
  } catch (error) {
    console.error('Create freelancer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get freelancer profile
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const email = url.searchParams.get('email');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    let result;
    
    if (email) {
      // Get profile by email (for clients to view)
      result = await actor.getFreelancerProfileByEmail(sessionId, email);
    } else {
      // Get own profile
      result = await actor.getFreelancerDashboardProfile(sessionId);
    }
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to get freelancer profile', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      profile: serializedProfile
    });
  } catch (error) {
    console.error('Get freelancer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update freelancer profile
export async function PUT(request: Request) {
  try {
    const { sessionId, profile } = await request.json();
    
    // Validate required fields
    if (!sessionId || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, profile' },
        { status: 400 }
      );
    }

    // Validate profile structure
    if (!profile.serviceTitle || !profile.mainCategory || !profile.subCategory || !profile.description) {
      return NextResponse.json(
        { error: 'Missing required profile fields: serviceTitle, mainCategory, subCategory, description' },
        { status: 400 }
      );
    }

    // Validate requirement plans
    if (!profile.requirementPlans || !profile.requirementPlans.basic || !profile.requirementPlans.advanced || !profile.requirementPlans.premium) {
      return NextResponse.json(
        { error: 'Missing required requirement plans: basic, advanced, premium' },
        { status: 400 }
      );
    }

    // Validate portfolio images (max 5)
    if (profile.portfolioImages && profile.portfolioImages.length > 5) {
      return NextResponse.json(
        { error: 'Too many portfolio images (maximum 5 allowed)' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    const result = await actor.updateFreelancerDashboardProfile(sessionId, profile);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to update freelancer profile', details: result.err },
        { status: 400 }
      );
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      message: 'Freelancer profile updated successfully',
      profile: serializedProfile
    });
  } catch (error) {
    console.error('Update freelancer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete freelancer profile
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }
    
    const actor = await getMainActor();
    const result = await actor.deleteFreelancerDashboardProfile(sessionId);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to delete freelancer profile', details: result.err },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Freelancer profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete freelancer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
