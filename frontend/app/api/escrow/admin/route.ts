import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get platform fee statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    const result = await actor.getPlatformFeeStats(sessionId);

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        stats: {
          totalFees: result.ok.totalFees.toString(),
          totalTransactions: result.ok.totalTransactions.toString(),
          collectedFees: result.ok.collectedFees.toString()
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to get platform fee stats' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get platform fee stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Check for overdue projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const actor = await getMainActor();
    const result = await actor.checkOverdueProjects(sessionId);

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        overdueEscrows: result.ok.map(id => id.toString()),
        message: `Found ${result.ok.length} overdue projects`
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to check overdue projects' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Check overdue projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
