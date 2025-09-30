import { NextRequest, NextResponse } from 'next/server';
import { icpAgent } from '@/lib/icpagent';
import { sessionStore } from '@/lib/session-store';

// POST - Handle both login and signup based on request body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, userType } = body;

    // Determine if this is a signup request (has confirmPassword and userType)
    const isSignup = confirmPassword && userType;

    if (isSignup) {
      // Handle signup
      return await handleSignup(request, { email, password, confirmPassword, userType });
    } else {
      // Handle login
      return await handleLogin(request, { email, password });
    }
  } catch (error: any) {
    console.error('Users API error:', error);
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

// Handle signup functionality
async function handleSignup(request: NextRequest, { email, password, confirmPassword, userType }: any) {
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

  // Register user in the user_management canister
  try {
    const { HttpAgent, Actor } = await import('@dfinity/agent');
    const { idlFactory } = await import('@/declarations/user_management');
    
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      verifyUpdateSignatures: false,
      fetchRootKey: true
    });
    
    await agent.fetchRootKey();
    
    const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // User management canister ID
    const userManagementActor = Actor.createActor(idlFactory, { agent, canisterId });
    
    // Register user in user_management canister
    const registerResult = await userManagementActor.registerUser(email, password, userType);
    console.log('User registration result:', registerResult);
    
    if ('err' in registerResult) {
      const errorType = Object.keys(registerResult.err)[0];
      throw new Error(errorType);
    }
    
    // Generate a simple session ID since we're not using the main canister
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session data in our session store
    sessionStore.createSession(sessionId, registerResult.ok.email, registerResult.ok.userType);
    
    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email: registerResult.ok.email,
        userType: registerResult.ok.userType
      },
      sessionId: sessionId
    });

    // Set httpOnly cookie for session management
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days to match localStorage persistence
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Signup failed',
        errors: {}
      }, 
      { status: 400 }
    );
  }
}

// Handle login functionality
async function handleLogin(request: NextRequest, { email, password }: any) {
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

  // Login user in the user_management canister
  try {
    const { HttpAgent, Actor } = await import('@dfinity/agent');
    const { idlFactory } = await import('@/declarations/user_management');
    
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      verifyUpdateSignatures: false,
      fetchRootKey: true
    });
    
    await agent.fetchRootKey();
    
    const canisterId = 'vt46d-j7777-77774-qaagq-cai'; // User management canister ID
    const userManagementActor = Actor.createActor(idlFactory, { agent, canisterId });
    
    // Login user in user_management canister
    const loginResult = await userManagementActor.loginUser(email, password);
    console.log('User login result:', loginResult);
    
    if ('err' in loginResult) {
      const errorType = Object.keys(loginResult.err)[0];
      throw new Error(errorType);
    }
    
    // Generate a simple session ID since we're not using the main canister
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session data in our session store
    sessionStore.createSession(sessionId, loginResult.ok.email, loginResult.ok.userType);
    
    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: loginResult.ok.email,
        userType: loginResult.ok.userType
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
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Login failed',
        error: error.message || 'Internal server error'
      },
      { status: 401 }
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

// Helper functions for signup error messages
function getSignupErrorMessage(error: any): string {
  switch (error) {
    case 'AlreadyExists':
      return 'An account with this email already exists';
    case 'InvalidEmail':
      return 'Please enter a valid email address';
    case 'InvalidPassword':
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    case 'InvalidUserType':
      return 'Invalid user type';
    case 'InvalidData':
      return 'Invalid data provided';
    default:
      return 'Signup failed. Please try again.';
  }
}

function getSignupFieldErrors(error: any): { [key: string]: string } {
  switch (error) {
    case 'AlreadyExists':
    case 'InvalidEmail':
      return { email: getSignupErrorMessage(error) };
    case 'InvalidPassword':
      return { password: getSignupErrorMessage(error) };
    case 'InvalidUserType':
      return { userType: getSignupErrorMessage(error) };
    default:
      return {};
  }
}

// Helper functions for login error messages
function getLoginErrorMessage(error: any): string {
  switch (error) {
    case 'NotFound':
      return 'No account found with this email address';
    case 'Unauthorized':
      return 'Invalid email or password';
    case 'InvalidEmail':
      return 'Please enter a valid email address';
    case 'InvalidPassword':
      return 'Invalid password';
    default:
      return 'Login failed. Please try again.';
  }
}

function getLoginFieldErrors(error: any): { email?: string; password?: string } {
  switch (error) {
    case 'NotFound':
    case 'InvalidEmail':
      return { email: getLoginErrorMessage(error) };
    case 'Unauthorized':
    case 'InvalidPassword':
      return { password: getLoginErrorMessage(error) };
    default:
      return {};
  }
}
