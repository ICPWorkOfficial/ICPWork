import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

// GET - Get onboarding record
export async function GET(request: NextRequest) {
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

    // Call the backend canister to get onboarding record
    const result = await icpAgent.getOnboardingRecord(sessionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        onboardingRecord: result.record
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Failed to get onboarding record'
        }, 
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Get onboarding record error:', error);
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

// POST - Create onboarding record
export async function POST(request: NextRequest) {
  try {
    const { userType } = await request.json();
    
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

    // Validate required fields
    if (!userType || (userType !== 'freelancer' && userType !== 'client')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Valid userType (freelancer or client) is required'
        }, 
        { status: 400 }
      );
    }

    // Call the backend canister to create onboarding record
    const result = await icpAgent.createOnboardingRecord(sessionId, userType);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Onboarding record created successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Failed to create onboarding record'
        }, 
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Create onboarding record error:', error);
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
