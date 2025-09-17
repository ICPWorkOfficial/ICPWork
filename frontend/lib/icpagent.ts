import { HttpAgent, Actor } from '@dfinity/agent';

// Define the canister interface based on the backend main.mo
const idlFactory = ({ IDL }: any) => {
  const UserType = IDL.Variant({
    'freelancer': IDL.Null,
    'client': IDL.Null,
  });

  const User = IDL.Record({
    'email': IDL.Text,
    'passwordHash': IDL.Vec(IDL.Nat8), // Blob type for password hash
    'userType': UserType,
  });

  const Error = IDL.Variant({
    'AuthenticationFailed': IDL.Null,
    'RegistrationFailed': IDL.Null,
    'StorageError': IDL.Text,
    'InvalidUserType': IDL.Null,
    'EmailRequired': IDL.Null,
    'InvalidSession': IDL.Null,
    'UserAlreadyExists': IDL.Null,
    'UserNotFound': IDL.Null,
    'InvalidCredentials': IDL.Null,
    'InvalidEmail': IDL.Null,
    'WeakPassword': IDL.Null,
  });

  const SessionInfo = IDL.Record({
    'sessionId': IDL.Text,
    'userType': IDL.Text,
    'expiresAt': IDL.Int,
  });

  return IDL.Service({
    // Authentication functions
    'signup': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Variant({ 'ok': IDL.Record({ 'sessionId': IDL.Text, 'user': User }), 'err': Error })], []),
    'login': IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ 'ok': IDL.Record({ 'sessionId': IDL.Text, 'user': User }), 'err': Error })], []),
    'logoutUser': IDL.Func([IDL.Text], [IDL.Variant({ 'ok': IDL.Null, 'err': Error })], []),
    
    // Session management
    'getUserInfo': IDL.Func([IDL.Text], [IDL.Variant({ 'ok': IDL.Record({ 'email': IDL.Text, 'userType': IDL.Text, 'expiresAt': IDL.Int }), 'err': Error })], []),
    'getSessionInfo': IDL.Func([IDL.Text], [IDL.Opt(SessionInfo)], ['query']),
    'isSessionValid': IDL.Func([IDL.Text], [IDL.Bool], []),
    
    // User management
    'getUserByEmail': IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ 'ok': User, 'err': Error })], []),
    'getActiveSessionCount': IDL.Func([], [IDL.Nat], []),
    
    // Legacy functions for backward compatibility
    'registerUser': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Variant({ 'ok': IDL.Null, 'err': Error })], []),
  });
};

// Create the agent and actor
const createAgent = () => {
  const host = process.env.NODE_ENV === 'production' 
    ? 'https://ic0.app' 
    : 'http://localhost:4943';
  
  return new HttpAgent({ host });
};

const createActor = () => {
  const agent = createAgent();
  const canisterId = process.env.NEXT_PUBLIC_MAIN_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Main canister ID
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};

// Mock data for testing when canister is not available
const mockUsers = new Map<string, { email: string; passwordHash: string; userType: 'freelancer' | 'client' }>();

// ICP Agent class
class ICPAgent {
  private actor: any;
  private useMock: boolean = false;

  constructor() {
    try {
      this.actor = createActor();
    } catch (error) {
      console.warn('Failed to create actor, using mock mode:', error);
      this.useMock = true;
    }
  }

  async login(email: string, password: string) {
    try {
      if (this.useMock) {
        return this.mockLogin(email, password);
      }

      const result = await this.actor.login(email, password);
      if ('ok' in result) {
        return {
          success: true,
          sessionId: result.ok.sessionId,
          user: {
            email: result.ok.user.email,
            userType: Object.keys(result.ok.user.userType)[0] as 'freelancer' | 'client'
          }
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        throw new Error(errorType);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(email: string, password: string, userType: 'freelancer' | 'client') {
    try {
      if (this.useMock) {
        return this.mockSignup(email, password, userType);
      }

      const result = await this.actor.signup(email, password, userType);
      if ('ok' in result) {
        return {
          success: true,
          sessionId: result.ok.sessionId,
          user: {
            email: result.ok.user.email,
            userType: Object.keys(result.ok.user.userType)[0] as 'freelancer' | 'client'
          }
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        throw new Error(errorType);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async getUserByEmail(sessionId: string, email: string) {
    try {
      if (this.useMock) {
        return this.mockGetUserByEmail(email);
      }

      const result = await this.actor.getUserByEmail(sessionId, email);
      if ('ok' in result) {
        return {
          success: true,
          user: {
            email: result.ok.email,
            userType: Object.keys(result.ok.userType)[0] as 'freelancer' | 'client'
          }
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        throw new Error(errorType);
      }
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async logout(sessionId: string) {
    try {
      if (this.useMock) {
        return { success: true };
      }

      const result = await this.actor.logoutUser(sessionId);
      if ('ok' in result) {
        return { success: true };
      } else {
        const errorType = Object.keys(result.err)[0];
        throw new Error(errorType);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getUserInfo(sessionId: string) {
    try {
      if (this.useMock) {
        return this.mockGetUserInfo();
      }

      const result = await this.actor.getUserInfo(sessionId);
      if ('ok' in result) {
        return {
          success: true,
          userInfo: {
            email: result.ok.email,
            userType: result.ok.userType,
            expiresAt: result.ok.expiresAt
          }
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        throw new Error(errorType);
      }
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  async getSessionInfo(sessionId: string) {
    try {
      if (this.useMock) {
        return this.mockGetSessionInfo();
      }

      const result = await this.actor.getSessionInfo(sessionId);
      return result;
    } catch (error) {
      console.error('Get session info error:', error);
      throw error;
    }
  }

  async isSessionValid(sessionId: string) {
    try {
      if (this.useMock) {
        return true;
      }

      return await this.actor.isSessionValid(sessionId);
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  async listUsers() {
    try {
      if (this.useMock) {
        return this.mockListUsers();
      }

      const result = await this.actor.listUsers();
      return result.map((user: any) => ({
        email: user.email,
        userType: Object.keys(user.userType)[0] as 'freelancer' | 'client'
      }));
    } catch (error) {
      console.error('List users error:', error);
      throw error;
    }
  }

  // Mock methods for testing without canister
  private mockLogin(email: string, password: string) {
    const user = mockUsers.get(email);
    if (!user) {
      throw new Error('UserNotFound');
    }
    if (user.passwordHash !== password) {
      throw new Error('InvalidCredentials');
    }
    return {
      success: true,
      sessionId: `mock_session_${Date.now()}`,
      user: {
        email: user.email,
        userType: user.userType
      }
    };
  }

  private mockSignup(email: string, password: string, userType: 'freelancer' | 'client') {
    if (mockUsers.has(email)) {
      throw new Error('UserAlreadyExists');
    }
    if (!email.includes('@')) {
      throw new Error('InvalidEmail');
    }
    if (password.length < 8) {
      throw new Error('WeakPassword');
    }
    
    mockUsers.set(email, { email, passwordHash: password, userType });
    return {
      success: true,
      sessionId: `mock_session_${Date.now()}`,
      user: {
        email,
        userType
      }
    };
  }

  private mockGetUserInfo() {
    return {
      success: true,
      userInfo: {
        email: 'mock@example.com',
        userType: 'freelancer',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      }
    };
  }

  private mockGetSessionInfo() {
    return {
      sessionId: 'mock_session',
      userType: 'freelancer',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
  }

  private mockGetUserByEmail(email: string) {
    const user = mockUsers.get(email);
    if (!user) {
      throw new Error('UserNotFound');
    }
    return {
      success: true,
      user: {
        email: user.email,
        userType: user.userType
      }
    };
  }

  private mockListUsers() {
    return Array.from(mockUsers.values()).map(user => ({
      email: user.email,
      userType: user.userType
    }));
  }

  // Legacy methods for compatibility
  async register(email: string, username: string, password: string, userType: 'FREELANCER' | 'CLIENT') {
    const convertedUserType = userType.toLowerCase() as 'freelancer' | 'client';
    return this.signup(email, password, convertedUserType);
  }

  async getUser(userId: string) {
    // For legacy compatibility, we'll need a sessionId
    // This should be updated in the calling code to provide sessionId
    throw new Error('getUser method requires sessionId. Use getUserByEmail(sessionId, email) instead.');
  }

  // OTP methods (placeholder implementations)
  async verifyOTP(userId: string, otp: string) {
    // This would need to be implemented in the backend
    throw new Error('OTP verification not implemented yet');
  }

  async resendOTP(userId: string) {
    // This would need to be implemented in the backend
    throw new Error('OTP resend not implemented yet');
  }

  async changePassword(userId: string, otp: string, newPassword: string) {
    // This would need to be implemented in the backend
    throw new Error('Password change not implemented yet');
  }
}

export const icpAgent = new ICPAgent();