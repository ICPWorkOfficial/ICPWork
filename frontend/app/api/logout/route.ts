import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';
import { sessionStore } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  try {
    // Get sessionId from cookies
    let sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No active session found'
        }, 
        { status: 400 }
      );
    }

    // Parse the sessionId if it's an escaped string
    if (typeof sessionId === 'string') {
      // Handle escaped string format
      if (sessionId.startsWith('"') && sessionId.endsWith('"')) {
        try {
          sessionId = JSON.parse(sessionId);
        } catch (e) {
          console.warn('Failed to parse sessionId from cookie:', sessionId);
        }
      }
      // Handle URL-encoded format
      else if (sessionId.includes('%')) {
        try {
          sessionId = decodeURIComponent(sessionId);
          // If it's still escaped, try parsing again
          if (sessionId.startsWith('"') && sessionId.endsWith('"')) {
            sessionId = JSON.parse(sessionId);
          }
        } catch (e) {
          console.warn('Failed to decode sessionId:', sessionId);
        }
      }
    }

    // Clear session from our session store
    sessionStore.deleteSession(sessionId);

    // Call the backend canister logout method (optional, since we're using simple sessions)
    try {
      await icpAgent.logout(sessionId);
    } catch (error) {
      console.warn('Backend logout failed, but continuing with local logout:', error);
    }

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
