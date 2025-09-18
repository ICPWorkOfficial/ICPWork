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

  const JobPostingInput = IDL.Record({
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
    'createJobPosting': IDL.Func([JobPostingInput], [IDL.Variant({ 'ok': JobPosting, 'err': Error })], []),
    'getAllJobPostings': IDL.Func([], [IDL.Vec(JobPosting)], ['query']),
    'getActiveJobPostings': IDL.Func([], [IDL.Vec(JobPosting)], ['query']),
    'getJobPostingsByClient': IDL.Func([IDL.Text], [IDL.Vec(JobPosting)], ['query']),
    'getJobPostingsByCategory': IDL.Func([JobCategory], [IDL.Vec(JobPosting)], ['query']),
    'getJobPostingsBySubCategory': IDL.Func([SubCategory], [IDL.Vec(JobPosting)], ['query']),
    'getJobPostingsByWorkplaceType': IDL.Func([WorkplaceType], [IDL.Vec(JobPosting)], ['query']),
    'searchJobPostingsByTitle': IDL.Func([IDL.Text], [IDL.Vec(JobPosting)], ['query']),
    'getJobPostingStats': IDL.Func([], [IDL.Record({
      'totalJobs': IDL.Nat,
      'activeJobs': IDL.Nat,
      'inactiveJobs': IDL.Nat,
      'totalApplications': IDL.Nat,
    })], ['query']),
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
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // Job posting canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// Helper function to convert frontend data to canister format
function convertToCanisterFormat(data: any) {
  return {
    clientEmail: data.clientEmail,
    category: { [data.category]: null },
    subCategory: { [data.subCategory]: null },
    jobTitle: data.jobTitle,
    rolesAndResponsibilities: data.rolesAndResponsibilities || [],
    skillsRequired: data.skillsRequired || [],
    benefits: data.benefits || [],
    jobRoles: data.jobRoles || [],
    duration: data.duration,
    isContractToHire: data.isContractToHire || false,
    workplaceType: { [data.workplaceType]: null },
    location: data.location,
    budget: data.budget,
    budgetType: { [data.budgetType]: null },
    applicationType: { [data.applicationType]: null },
    applicationDetails: data.applicationDetails,
  };
}

// GET - Get all job postings
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const active = url.searchParams.get('active');
    const clientEmail = url.searchParams.get('clientEmail');
    const category = url.searchParams.get('category');
    const subCategory = url.searchParams.get('subCategory');
    const workplaceType = url.searchParams.get('workplaceType');
    const search = url.searchParams.get('search');
    const stats = url.searchParams.get('stats');

    const actor = await getJobPostingActor();
    let result;

    if (stats === 'true') {
      result = await actor.getJobPostingStats();
      // Convert BigInt values to strings for JSON serialization
      const serializedStats = JSON.parse(JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      return NextResponse.json({ 
        success: true,
        stats: serializedStats
      });
    } else if (active === 'true') {
      result = await actor.getActiveJobPostings();
    } else if (clientEmail) {
      result = await actor.getJobPostingsByClient(clientEmail);
    } else if (category) {
      result = await actor.getJobPostingsByCategory({ [category]: null });
    } else if (subCategory) {
      result = await actor.getJobPostingsBySubCategory({ [subCategory]: null });
    } else if (workplaceType) {
      result = await actor.getJobPostingsByWorkplaceType({ [workplaceType]: null });
    } else if (search) {
      result = await actor.searchJobPostingsByTitle(search);
    } else {
      result = await actor.getAllJobPostings();
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({ 
      success: true,
      jobPostings: serializedResult,
      count: serializedResult.length
    });
  } catch (error) {
    console.error('Get job postings error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new job posting
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.clientEmail || !body.jobTitle || !body.category || !body.subCategory) {
      return NextResponse.json(
        { error: 'Missing required fields: clientEmail, jobTitle, category, subCategory' },
        { status: 400 }
      );
    }

    const actor = await getJobPostingActor();
    const jobInput = convertToCanisterFormat(body);
    const result = await actor.createJobPosting(jobInput);
    
    if (result && typeof result === 'object' && 'err' in result) {
      return NextResponse.json(
        { error: 'Failed to create job posting', details: result.err },
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
      message: 'Job posting created successfully',
      jobPosting: serializedJob
    });
  } catch (error) {
    console.error('Create job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}