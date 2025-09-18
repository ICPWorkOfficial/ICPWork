import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

// POST - Complete onboarding
export async function POST(request: NextRequest) {
  try {
    // Get sessionId from cookies
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No active session found'
        }, 
        { status: 401 }
      );
    }

    // Call the backend canister to complete onboarding
    const result = await icpAgent.completeOnboarding(sessionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Onboarding completed successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Failed to complete onboarding'
        }, 
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message
      }, 
      { status: 500 }
    );
  }
}
