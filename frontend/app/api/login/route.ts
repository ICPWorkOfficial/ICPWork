import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

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

    // Call the backend canister login method
    const result = await icpAgent.login(email, password);

    if (result.success) {
      // The backend now returns a sessionId
      const sessionId = result.sessionId;
      
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
        maxAge: 24 * 60 * 60 // 24 hours
      });

      return response;
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
    case 'UserNotFound':
      return 'No account found with this email address';
    case 'InvalidCredentials':
      return 'Invalid email or password';
    case 'InvalidEmail':
      return 'Please enter a valid email address';
    default:
      return 'Login failed. Please try again.';
  }
}

// Helper function to map errors to specific form fields
function getFieldErrors(error: any): { email?: string; password?: string } {
  switch (error) {
    case 'UserNotFound':
    case 'InvalidEmail':
      return { email: getErrorMessage(error) };
    case 'InvalidCredentials':
      return { password: getErrorMessage(error) };
    default:
      return {};
  }
}