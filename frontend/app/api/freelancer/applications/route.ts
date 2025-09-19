import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/project_store';

async function getProjectStoreActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vu5yx-eh777-77774-qaaga-cai'; // Project store canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

function getApplicationStatusString(status: any): string {
  if (typeof status === 'object' && status !== null) {
    if (status.Pending !== undefined) return 'Pending';
    if (status.Accepted !== undefined) return 'Accepted';
    if (status.Rejected !== undefined) return 'Rejected';
  }
  return String(status);
}

// GET - Get applications by freelancer email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerEmail = searchParams.get('email');
    
    if (!freelancerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Freelancer email is required'
      }, { status: 400 });
    }

    const actor = await getProjectStoreActor();
    const result = await actor.getFreelancerApplications(freelancerEmail);

    if (result.ok) {
      const applications = result.ok.map(application => ({
        id: application.id,
        projectId: application.projectId,
        freelancerEmail: application.freelancerEmail,
        proposal: application.proposal,
        whyFit: application.whyFit,
        estimatedTime: application.estimatedTime,
        bidAmount: application.bidAmount,
        createdAt: application.createdAt.toString(),
        status: getApplicationStatusString(application.status)
      }));

      return NextResponse.json({
        success: true,
        applications: applications,
        count: applications.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Get freelancer applications error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
