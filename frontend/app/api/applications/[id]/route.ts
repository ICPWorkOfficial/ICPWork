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

// PUT - Update application status (accept/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Application ID is required'
      }, { status: 400 });
    }

    if (!status || (status !== 'Accepted' && status !== 'Rejected')) {
      return NextResponse.json({
        success: false,
        error: 'Status must be either "Accepted" or "Rejected"'
      }, { status: 400 });
    }

    const actor = await getProjectStoreActor();
    const statusVariant = status === 'Accepted' ? { Accepted: null } : { Rejected: null };
    const result = await actor.updateApplicationStatus(id, statusVariant);

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
        message: `Application ${status.toLowerCase()} successfully`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Update application status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
