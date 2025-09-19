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

// GET - Get freelancer dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const actor = await getFreelancerDashboardActor();
    
    // Get total profiles count
    const totalResult = await actor.getTotalProfiles();
    const activeResult = await actor.getActiveProfilesCount();
    
    if (totalResult.ok && activeResult.ok) {
      const totalProfiles = Number(totalResult.ok);
      const activeProfiles = Number(activeResult.ok);
      const inactiveProfiles = totalProfiles - activeProfiles;
      
      return NextResponse.json({ 
        success: true,
        stats: {
          totalProfiles,
          activeProfiles,
          inactiveProfiles,
          activationRate: totalProfiles > 0 ? (activeProfiles / totalProfiles * 100).toFixed(1) : 0
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch statistics' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get freelancer dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}