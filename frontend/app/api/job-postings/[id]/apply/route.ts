import { NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';

// IDL Factory for Job Posting Canister
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    'incrementApplicationsCount': IDL.Func([IDL.Text], [IDL.Variant({ 'ok': IDL.Null, 'err': IDL.Variant({
      'NotFound': IDL.Null,
      'Unauthorized': IDL.Null,
      'InvalidData': IDL.Null,
      'InvalidEmail': IDL.Null,
      'JobPostingNotFound': IDL.Null,
      'InvalidCategory': IDL.Null,
      'InvalidSubCategory': IDL.Null,
      'InvalidWorkplaceType': IDL.Null,
      'InvalidBudgetType': IDL.Null,
      'InvalidApplicationType': IDL.Null,
    }) })], []),
  });
};

async function getJobPostingActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // Job posting canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// POST - Apply to job posting (increment applications count)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Job posting ID is required' },
        { status: 400 }
      );
    }

    // Validate application data
    if (!body.applicantEmail || !body.applicantName) {
      return NextResponse.json(
        { error: 'Missing required fields: applicantEmail, applicantName' },
        { status: 400 }
      );
    }

    const actor = await getJobPostingActor();
    const result = await actor.incrementApplicationsCount(id);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to apply to job posting', details: result.err },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Application submitted successfully',
      applicationData: {
        jobPostingId: id,
        applicantEmail: body.applicantEmail,
        applicantName: body.applicantName,
        appliedAt: new Date().toISOString(),
        coverLetter: body.coverLetter || '',
        resume: body.resume || '',
        portfolio: body.portfolio || '',
        expectedSalary: body.expectedSalary || '',
        availability: body.availability || '',
        additionalNotes: body.additionalNotes || ''
      }
    });
  } catch (error) {
    console.error('Apply to job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}