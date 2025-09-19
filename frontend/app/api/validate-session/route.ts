import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  try {
    // Get sessionId from cookies
    let sessionId = request.cookies.get('sessionId')?.value;
    
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

    // Validate session using our session store
    const sessionData = sessionStore.getSession(sessionId);
    
    if (!sessionData) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Session not found or expired',
          valid: false
        }, 
        { status: 401 }
      );
    }
    
    // Session is valid, return user info
    return NextResponse.json({
      success: true,
      message: 'Session is valid',
      valid: true,
      user: {
        email: sessionData.email,
        userType: sessionData.userType,
        expiresAt: sessionData.expiresAt
      }
    });
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
