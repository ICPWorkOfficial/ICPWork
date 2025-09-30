import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';
import { sessionStore } from '@/lib/session-store';

// POST - Handle login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required',
          errors: {
            email: !email ? 'Email is required' : undefined,
            password: !password ? 'Password is required' : undefined
          }
        }, 
        { status: 400 }
      );
    }

    // Call the user_management canister directly (same approach as signup)
    const { HttpAgent, Actor } = await import('@dfinity/agent');
    const { idlFactory } = await import('@/declarations/user_management');
    
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false
    });
    
    await agent.fetchRootKey();
    
    const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // User management canister ID
    const userManagementActor = Actor.createActor(idlFactory, { agent, canisterId });
    
    // Login user in user_management canister
    const loginResult = await userManagementActor.loginUser(email, password) as any;
    console.log('User login result:', loginResult);
    
    if ('err' in loginResult) {
      const errorType = Object.keys(loginResult.err)[0];
      throw new Error(errorType);
    }
    
    // Generate a simple session ID since we're not using the main canister
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = {
      success: true,
      sessionId: sessionId,
      user: {
        email: loginResult.ok.email,
        userType: loginResult.ok.userType
      }
    };

    if (result.success) {
      // The backend now returns a sessionId
      let sessionId = result.sessionId;
      
      // Parse the sessionId if it's an escaped string
      if (typeof sessionId === 'string' && sessionId.startsWith('"') && sessionId.endsWith('"')) {
        try {
          sessionId = JSON.parse(sessionId);
        } catch (e) {
          // If parsing fails, use the original value
          console.warn('Failed to parse sessionId:', sessionId);
        }
      }
      
      // Store session data in our session store
      sessionStore.createSession(sessionId, result.user.email, result.user.userType);
      
      // Set session cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          email: result.user.email,
          userType: result.user.userType
        },
        sessionId
      });

      // Set httpOnly cookie for session management
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days to match localStorage persistence
      });

      return response;
    } else {
      // This should not happen as icpAgent throws errors on failure
      return NextResponse.json(
        {
          success: false,
          message: 'Login failed',
          errors: {}
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    // Handle authentication errors from the canister
    const errorMessage = error.message || 'Login failed';
    const fieldErrors = getFieldErrors(errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(errorMessage),
        errors: fieldErrors
      },
      { status: 401 }
    );
  }
}

// Helper function to convert backend errors to user-friendly messages
function getErrorMessage(error: any): string {
  switch (error) {
    case 'NotFound':
      return 'No account found with this email address';
    case 'Unauthorized':
      return 'Invalid email or password';
    case 'InvalidEmail':
      return 'Please enter a valid email address';
    case 'InvalidPassword':
      return 'Invalid password';
    case 'InvalidUserType':
      return 'Invalid user type';
    case 'InvalidData':
      return 'Invalid data provided';
    default:
      return 'Login failed. Please try again.';
  }
}

// Helper function to map errors to specific form fields
function getFieldErrors(error: any): { email?: string; password?: string } {
  switch (error) {
    case 'NotFound':
    case 'InvalidEmail':
      return { email: getErrorMessage(error) };
    case 'Unauthorized':
    case 'InvalidPassword':
      return { password: getErrorMessage(error) };
    default:
      return {};
  }
}