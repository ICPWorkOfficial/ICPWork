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

// GET - Browse freelancer profiles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const actor = await getFreelancerDashboardActor();
    
    let result;
    if (search) {
      result = await actor.searchProfilesByTitle(search);
    } else if (category && subCategory) {
      result = await actor.getProfilesBySubCategory(category, subCategory);
    } else if (category) {
      result = await actor.getProfilesByCategory(category);
    } else {
      result = await actor.getActiveProfiles();
    }

    if (result.ok) {
      let profiles = result.ok;
      
      // Sort profiles
      profiles = profiles.sort((a, b) => {
        const aValue = a[1][sortBy as keyof typeof a[1]];
        const bValue = b[1][sortBy as keyof typeof b[1]];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProfiles = profiles.slice(startIndex, endIndex);
      
      const serializedProfiles = JSON.parse(JSON.stringify(paginatedProfiles, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        profiles: serializedProfiles,
        pagination: {
          page,
          limit,
          total: profiles.length,
          totalPages: Math.ceil(profiles.length / limit),
          hasNext: endIndex < profiles.length,
          hasPrev: page > 1
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Browse freelancer profiles error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}