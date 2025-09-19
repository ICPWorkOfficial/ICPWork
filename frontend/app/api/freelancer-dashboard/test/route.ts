import { NextRequest, NextResponse } from 'next/server';

// GET - Test route to verify API integration
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true,
      message: 'Freelancer Dashboard API is working!',
      timestamp: new Date().toISOString(),
      canisterId: 'umunu-kh777-77774-qaaca-cai',
      note: 'This is a test route. The actual canister calls require the main canister to be deployed.'
    });
  } catch (error: any) {
    console.error('Test route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
