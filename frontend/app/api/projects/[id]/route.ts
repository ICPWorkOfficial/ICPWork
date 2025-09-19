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

// GET - Get project by ID
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
    const result = await actor.getProject(id);

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
        project: serializedProject
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err,
        message: 'Project not found'
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Update project status
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
        error: 'Project ID is required'
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required'
      }, { status: 400 });
    }

    const actor = await getProjectStoreActor();
    const result = await actor.updateProjectStatus(id, status);

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
        message: 'Project status updated successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(
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
    const result = await actor.deleteProject(id);

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
