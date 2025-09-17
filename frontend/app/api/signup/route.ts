import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword, userType } = await request.json();

    // Validate required fields
    const errors: { [key: string]: string } = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else {
      // Validate password strength (matching frontend validation)
      const validation = validatePassword(password);
      if (!validation.isValid) {
        errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!userType || (userType !== 'freelancer' && userType !== 'client')) {
      errors.userType = 'Please select a valid user type';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please fix the errors below',
          errors 
        }, 
        { status: 400 }
      );
    }

    // Call the backend canister signup method
    console.log('Calling icpAgent.signup with:', { email, password: '***', userType });
    const result = await icpAgent.signup(email, password, userType);
    console.log('icpAgent.signup result:', result);

    if (result.success) {
      // Generate a simple session ID (in production, use proper session management)
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set session cookie
      const response = NextResponse.json({
        success: true,
        message: 'Account created successfully',
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
    // Handle signup errors from the canister
    console.error('Signup API error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    const errorMessage = error.message || 'Signup failed';
    const fieldErrors = getFieldErrors(errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        message: getErrorMessage(errorMessage),
        errors: fieldErrors
      }, 
      { status: 400 }
    );
  }
}

// Password validation function (matching frontend requirements)
function validatePassword(password: string): { isValid: boolean } {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: minLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar
  };
}

// Helper function to convert backend errors to user-friendly messages
function getErrorMessage(error: any): string {
  switch (error) {
    case 'UserAlreadyExists':
      return 'An account with this email already exists';
    case 'InvalidEmail':
      return 'Please enter a valid email address';
    case 'WeakPassword':
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    default:
      return 'Signup failed. Please try again.';
  }
}

// Helper function to map errors to specific form fields
function getFieldErrors(error: any): { [key: string]: string } {
  switch (error) {
    case 'UserAlreadyExists':
    case 'InvalidEmail':
      return { email: getErrorMessage(error) };
    case 'WeakPassword':
      return { password: getErrorMessage(error) };
    default:
      return {};
  }
}