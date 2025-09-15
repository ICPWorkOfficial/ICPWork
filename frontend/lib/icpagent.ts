import { HttpAgent, Actor } from '@dfinity/agent';

// Define the canister interface based on the backend auth.mo
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

  const AuthError = IDL.Variant({
    'UserAlreadyExists': IDL.Null,
    'UserNotFound': IDL.Null,
    'InvalidCredentials': IDL.Null,
    'InvalidEmail': IDL.Null,
    'WeakPassword': IDL.Null,
  });

  return IDL.Service({
    'signup': IDL.Func([IDL.Text, IDL.Text, UserType], [IDL.Variant({ 'ok': User, 'err': AuthError })], []),
    'login': IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ 'ok': User, 'err': AuthError })], []),
    'getUserByEmail': IDL.Func([IDL.Text], [IDL.Opt(User)], ['query']),
    'listUsers': IDL.Func([], [IDL.Vec(User)], ['query']),
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
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'; // Default local canister ID
  
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

      // Convert userType to the expected format for Motoko
      const result = await this.actor.login(email, password);
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
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(email: string, password: string, userType: 'freelancer' | 'client') {
    try {
      if (this.useMock) {
        return this.mockSignup(email, password, userType);
      }

      // Convert userType to the expected format for Motoko
      const userTypeVariant = userType === 'freelancer' 
        ? { 'freelancer': null } 
        : { 'client': null };
      
      const result = await this.actor.signup(email, password, userTypeVariant);
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
      console.error('Signup error:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      if (this.useMock) {
        return this.mockGetUserByEmail(email);
      }

      const result = await this.actor.getUserByEmail(email);
      if (result && result.length > 0) {
        const user = result[0];
        return {
          success: true,
          user: {
            email: user.email,
            userType: Object.keys(user.userType)[0] as 'freelancer' | 'client'
          }
        };
      } else {
        throw new Error('UserNotFound');
      }
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
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
      user: {
        email,
        userType
      }
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
    return this.getUserByEmail(userId);
  }
}

export const icpAgent = new ICPAgent();