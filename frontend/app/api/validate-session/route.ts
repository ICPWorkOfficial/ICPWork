import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

export async function GET(request: NextRequest) {
  try {
    // Get sessionId from cookies
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No session found',
          valid: false
        }, 
        { status: 401 }
      );
    }

    // Validate session with backend
    const isValid = await icpAgent.isSessionValid(sessionId);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid session',
          valid: false
        }, 
        { status: 401 }
      );
    }

    // Get user info from session
    const userInfo = await icpAgent.getUserInfo(sessionId);
    
    if (userInfo.success) {
      return NextResponse.json({
        success: true,
        message: 'Session is valid',
        valid: true,
        user: {
          email: userInfo.userInfo.email,
          userType: userInfo.userInfo.userType,
          expiresAt: userInfo.userInfo.expiresAt
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get user info',
          valid: false
        }, 
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Session validation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Session validation failed',
        valid: false
      }, 
      { status: 500 }
    );
  }
}
