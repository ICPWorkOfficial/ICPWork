import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/escrow';

async function getEscrowActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'rrkah-fqaaa-aaaah-qcujq-cai'; // Escrow canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get platform fee statistics
export async function GET(request: NextRequest) {
  try {
    const actor = await getEscrowActor();
    const stats = await actor.getPlatformFeeStats();

    return NextResponse.json({ 
      success: true,
      stats: {
        totalFees: stats.totalFees.toString(),
        totalTransactions: stats.totalTransactions.toString()
      }
    });
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
    const actor = await getEscrowActor();
    const result = await actor.checkOverdueProjects();

    if ('ok' in result) {
      return NextResponse.json({ 
        success: true,
        overdueEscrows: result.ok.map(id => id.toString()),
        message: `Found ${result.ok.size()} overdue projects`
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
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
