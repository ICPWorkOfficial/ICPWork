import { useState, useEffect } from 'react';
import { getUser, login, register, verifyOTP, resendOTP, changePassword } from '@/api/auth';
import { UserType } from '@/types/icp';

interface User {
    email: string;
    userType: string;
}

interface AuthState {
    user: User | null;
    sessionId: string | null;
    loading: boolean;
    error: string | null;
}

export const useAuthStore = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    sessionId: null,
    loading: false,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/validate-session', {
        method: 'GET',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success && result.valid) {
        setAuthState(prev => ({
          ...prev,
          user: result.user,
          sessionId: result.user.email, // Using email as session identifier for now
          loading: false
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          sessionId: null,
          loading: false
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        user: null,
        sessionId: null,
        loading: false,
        error: 'Session validation failed'
      }));
    }
  };

  const loginUser = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await login(email, password);
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          user: result.user,
          sessionId: result.sessionId,
          loading: false
        }));
      }
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  const registerUser = async (email: string, username: string, password: string, userType: UserType) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Convert userType to match backend expectations
      const result = await register(email, username, password, userType);
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          user: result.user,
          sessionId: result.sessionId,
          loading: false
        }));
      }
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  const logoutUser = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setAuthState(prev => ({
        ...prev,
        user: null,
        sessionId: null,
        loading: false
      }));
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  const verifyUserOTP = async (userId: string, otp: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await verifyOTP(userId, otp);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      throw err;
    }
  };

  const resendUserOTP = async (userId: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await resendOTP(userId);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      throw err;
    }
  };

  const changeUserPassword = async (userId: string, otp: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await changePassword(userId, otp, newPassword);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      throw err;
    }
  };

  return {
    user: authState.user,
    sessionId: authState.sessionId,
    loading: authState.loading,
    error: authState.error,
    loginUser,
    registerUser,
    logoutUser,
    validateSession,
    verifyUserOTP,
    resendUserOTP,
    changeUserPassword,
  };
};
