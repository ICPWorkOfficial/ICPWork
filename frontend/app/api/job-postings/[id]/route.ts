import { NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';

// IDL Factory for Job Posting Canister
const idlFactory = ({ IDL }: any) => {
  const JobCategory = IDL.Variant({
    'Technology': IDL.Null,
    'Marketing': IDL.Null,
    'Design': IDL.Null,
    'Sales': IDL.Null,
    'Finance': IDL.Null,
    'HumanResources': IDL.Null,
    'Operations': IDL.Null,
    'CustomerService': IDL.Null,
    'Other': IDL.Text,
  });

  const SubCategory = IDL.Variant({
    'Frontend': IDL.Null,
    'Backend': IDL.Null,
    'FullStack': IDL.Null,
    'Mobile': IDL.Null,
    'DevOps': IDL.Null,
    'DataScience': IDL.Null,
    'MachineLearning': IDL.Null,
    'UIUX': IDL.Null,
    'GraphicDesign': IDL.Null,
    'DigitalMarketing': IDL.Null,
    'ContentMarketing': IDL.Null,
    'SEO': IDL.Null,
    'SocialMedia': IDL.Null,
    'SalesDevelopment': IDL.Null,
    'AccountManagement': IDL.Null,
    'FinancialAnalysis': IDL.Null,
    'Accounting': IDL.Null,
    'Recruitment': IDL.Null,
    'Training': IDL.Null,
    'ProjectManagement': IDL.Null,
    'QualityAssurance': IDL.Null,
    'CustomerSupport': IDL.Null,
    'TechnicalSupport': IDL.Null,
    'Other': IDL.Text,
  });

  const WorkplaceType = IDL.Variant({
    'Onsite': IDL.Null,
    'Remote': IDL.Null,
    'Hybrid': IDL.Null,
  });

  const BudgetType = IDL.Variant({
    'PerHour': IDL.Null,
    'Fixed': IDL.Null,
    'Negotiable': IDL.Null,
  });

  const ApplicationType = IDL.Variant({
    'Paid': IDL.Null,
    'Unpaid': IDL.Null,
  });

  const JobPosting = IDL.Record({
    'id': IDL.Text,
    'clientEmail': IDL.Text,
    'category': JobCategory,
    'subCategory': SubCategory,
    'jobTitle': IDL.Text,
    'rolesAndResponsibilities': IDL.Vec(IDL.Text),
    'skillsRequired': IDL.Vec(IDL.Text),
    'benefits': IDL.Vec(IDL.Text),
    'jobRoles': IDL.Vec(IDL.Text),
    'duration': IDL.Text,
    'isContractToHire': IDL.Bool,
    'workplaceType': WorkplaceType,
    'location': IDL.Text,
    'budget': IDL.Text,
    'budgetType': BudgetType,
    'applicationType': ApplicationType,
    'applicationDetails': IDL.Text,
    'isActive': IDL.Bool,
    'createdAt': IDL.Int,
    'updatedAt': IDL.Int,
    'applicationsCount': IDL.Nat,
  });

  const JobPostingUpdate = IDL.Record({
    'category': IDL.Opt(JobCategory),
    'subCategory': IDL.Opt(SubCategory),
    'jobTitle': IDL.Opt(IDL.Text),
    'rolesAndResponsibilities': IDL.Opt(IDL.Vec(IDL.Text)),
    'skillsRequired': IDL.Opt(IDL.Vec(IDL.Text)),
    'benefits': IDL.Opt(IDL.Vec(IDL.Text)),
    'jobRoles': IDL.Opt(IDL.Vec(IDL.Text)),
    'duration': IDL.Opt(IDL.Text),
    'isContractToHire': IDL.Opt(IDL.Bool),
    'workplaceType': IDL.Opt(WorkplaceType),
    'location': IDL.Opt(IDL.Text),
    'budget': IDL.Opt(IDL.Text),
    'budgetType': IDL.Opt(BudgetType),
    'applicationType': IDL.Opt(ApplicationType),
    'applicationDetails': IDL.Opt(IDL.Text),
    'isActive': IDL.Opt(IDL.Bool),
  });

  const Error = IDL.Variant({
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
  });

  return IDL.Service({
    'getJobPosting': IDL.Func([IDL.Text], [IDL.Variant({ 'ok': JobPosting, 'err': Error })], ['query']),
    'updateJobPosting': IDL.Func([IDL.Text, JobPostingUpdate], [IDL.Variant({ 'ok': JobPosting, 'err': Error })], []),
    'deleteJobPosting': IDL.Func([IDL.Text], [IDL.Variant({ 'ok': IDL.Null, 'err': Error })], []),
    'incrementApplicationsCount': IDL.Func([IDL.Text], [IDL.Variant({ 'ok': IDL.Null, 'err': Error })], []),
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

// Helper function to convert frontend update data to canister format
function convertUpdateToCanisterFormat(data: any) {
  const update: any = {};
  
  // Only include fields that are actually being updated
  if (data.category !== undefined) update.category = [{ [data.category]: null }];
  if (data.subCategory !== undefined) update.subCategory = [{ [data.subCategory]: null }];
  if (data.jobTitle !== undefined) update.jobTitle = [data.jobTitle];
  if (data.rolesAndResponsibilities !== undefined) update.rolesAndResponsibilities = [data.rolesAndResponsibilities];
  if (data.skillsRequired !== undefined) update.skillsRequired = [data.skillsRequired];
  if (data.benefits !== undefined) update.benefits = [data.benefits];
  if (data.jobRoles !== undefined) update.jobRoles = [data.jobRoles];
  if (data.duration !== undefined) update.duration = [data.duration];
  if (data.isContractToHire !== undefined) update.isContractToHire = [data.isContractToHire];
  if (data.workplaceType !== undefined) update.workplaceType = [{ [data.workplaceType]: null }];
  if (data.location !== undefined) update.location = [data.location];
  if (data.budget !== undefined) update.budget = [data.budget];
  if (data.budgetType !== undefined) update.budgetType = [{ [data.budgetType]: null }];
  if (data.applicationType !== undefined) update.applicationType = [{ [data.applicationType]: null }];
  if (data.applicationDetails !== undefined) update.applicationDetails = [data.applicationDetails];
  if (data.isActive !== undefined) update.isActive = [data.isActive];
  
  return update;
}

// GET - Get job posting by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Job posting ID is required' },
        { status: 400 }
      );
    }

    const actor = await getJobPostingActor();
    const result = await actor.getJobPosting(id);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Job posting not found', details: result.err },
        { status: 404 }
      );
    }
    
    // Extract the job posting from the result.ok structure
    const jobPosting = result && typeof result === 'object' && 'ok' in result ? result.ok : result;
    
    // Convert BigInt values to strings for JSON serialization
    const serializedJob = JSON.parse(JSON.stringify(jobPosting, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      jobPosting: serializedJob
    });
  } catch (error) {
    console.error('Get job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update job posting
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Job posting ID is required' },
        { status: 400 }
      );
    }

    const actor = await getJobPostingActor();
    const updateData = convertUpdateToCanisterFormat(body);
    const result = await actor.updateJobPosting(id, updateData);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to update job posting', details: result.err },
        { status: 400 }
      );
    }
    
    // Extract the job posting from the result.ok structure
    const jobPosting = result && typeof result === 'object' && 'ok' in result ? result.ok : result;
    
    // Convert BigInt values to strings for JSON serialization
    const serializedJob = JSON.parse(JSON.stringify(jobPosting, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({ 
      success: true,
      message: 'Job posting updated successfully',
      jobPosting: serializedJob
    });
  } catch (error) {
    console.error('Update job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete job posting
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Job posting ID is required' },
        { status: 400 }
      );
    }

    const actor = await getJobPostingActor();
    const result = await actor.deleteJobPosting(id);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to delete job posting', details: result.err },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Delete job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}