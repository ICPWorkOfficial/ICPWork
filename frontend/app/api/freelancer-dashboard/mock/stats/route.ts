import { NextRequest, NextResponse } from 'next/server';

// GET - Mock freelancer dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Mock statistics
    const stats = {
      totalProfiles: 2,
      activeProfiles: 2,
      inactiveProfiles: 0,
      activationRate: '100.0'
    };

    return NextResponse.json({ 
      success: true,
      stats: stats,
      note: 'This is mock data for testing. The actual canister integration will work once the main canister is deployed.'
    });
  } catch (error: any) {
    console.error('Mock stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
