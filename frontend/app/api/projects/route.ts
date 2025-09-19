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

function getStatusString(status: any): string {
  if (typeof status === 'object' && status !== null) {
    if (status.Open !== undefined) return 'Open';
    if (status.InProgress !== undefined) return 'InProgress';
    if (status.Completed !== undefined) return 'Completed';
    if (status.Cancelled !== undefined) return 'Cancelled';
  }
  return String(status);
}

// GET - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientEmail = searchParams.get('client');

    const actor = await getProjectStoreActor();
    let result;

    if (clientEmail) {
      // Get projects by client
      result = await actor.getProjectsByClient(clientEmail);
    } else if (status === 'open') {
      // Get only open projects
      result = await actor.getOpenProjects();
    } else {
      // Get all projects
      result = await actor.getAllProjects();
    }

    if (result.ok) {
      const projects = result.ok.map(([id, project]) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        budget: project.budget,
        timeline: project.timeline,
        category: project.category,
        skills: project.skills,
        clientEmail: project.clientEmail,
        status: getStatusString(project.status),
        createdAt: project.createdAt.toString(),
        updatedAt: project.updatedAt.toString(),
        applications: project.applications
      }));

      return NextResponse.json({
        success: true,
        projects: projects,
        count: projects.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      requirements, 
      budget, 
      timeline, 
      category, 
      skills, 
      clientEmail 
    } = body;

    // Validate required fields
    if (!title || !description || !clientEmail) {
      return NextResponse.json({
        success: false,
        error: 'Title, description, and client email are required'
      }, { status: 400 });
    }

    const actor = await getProjectStoreActor();
    const result = await actor.createProject(
      title,
      description,
      requirements || '',
      budget || '',
      timeline || '',
      category || '',
      skills || [],
      clientEmail
    );

    if (result.ok) {
      const project = result.ok;
      const serializedProject = {
        id: project.id,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        budget: project.budget,
        timeline: project.timeline,
        category: project.category,
        skills: project.skills,
        clientEmail: project.clientEmail,
        status: getStatusString(project.status),
        createdAt: project.createdAt.toString(),
        updatedAt: project.updatedAt.toString(),
        applications: project.applications
      };

      return NextResponse.json({
        success: true,
        project: serializedProject,
        message: 'Project created successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}