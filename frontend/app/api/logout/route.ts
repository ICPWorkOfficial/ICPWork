import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

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
        { status: 400 }
      );
    }

    // Call the backend canister logout method
    const result = await icpAgent.logout(sessionId);

    if (result.success) {
      // Clear session cookie
      const response = NextResponse.json({
        success: true,
        message: 'Logout successful'
      });

      // Remove the session cookie
      response.cookies.set('sessionId', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0 // Expire immediately
      });

      return response;
    }
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Even if logout fails on backend, clear the local session
    const response = NextResponse.json({
      success: true,
      message: 'Logout completed'
    });

    // Remove the session cookie
    response.cookies.set('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;
  }
}
