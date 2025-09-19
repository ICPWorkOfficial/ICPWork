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

// GET - Get applications for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 });
    }

    const actor = await getProjectStoreActor();
    const result = await actor.getProjectApplications(id);

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
    console.error('Get project applications error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Apply to project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      freelancerEmail, 
      proposal, 
      whyFit, 
      estimatedTime, 
      bidAmount 
    } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 });
    }

    if (!freelancerEmail || !proposal || !whyFit) {
      return NextResponse.json({
        success: false,
        error: 'Freelancer email, proposal, and why fit are required'
      }, { status: 400 });
    }

    const actor = await getProjectStoreActor();
    const result = await actor.applyToProject(
      id,
      freelancerEmail,
      proposal,
      whyFit,
      estimatedTime || '',
      bidAmount || ''
    );

    if (result.ok) {
      const application = result.ok;
      const serializedApplication = {
        id: application.id,
        projectId: application.projectId,
        freelancerEmail: application.freelancerEmail,
        proposal: application.proposal,
        whyFit: application.whyFit,
        estimatedTime: application.estimatedTime,
        bidAmount: application.bidAmount,
        createdAt: application.createdAt.toString(),
        status: getApplicationStatusString(application.status)
      };

      return NextResponse.json({
        success: true,
        application: serializedApplication,
        message: 'Application submitted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Apply to project error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
