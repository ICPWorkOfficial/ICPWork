import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

// POST - Update onboarding step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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

    // Extract onboarding data from request body
    const {
      profileMethod,
      personalInfo,
      skills,
      address,
      profile,
      final,
      companyData
    } = body;

    // Call the backend canister to update onboarding step
    const result = await icpAgent.updateOnboardingStep(
      sessionId,
      profileMethod,
      personalInfo,
      skills,
      address,
      profile,
      final,
      companyData
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Onboarding step updated successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Failed to update onboarding step'
        }, 
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update onboarding step error:', error);
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
