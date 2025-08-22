import { useState } from 'react';
import { getUser, login, register, verifyOTP, resendOTP, changePassword } from '@/api/auth';
import { UserType } from '@/types/icp';

export const useAuthStore = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      setUser(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email: string, username: string, password: string, userType: UserType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await register(email, username, password, userType);
      setUser(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ...other auth actions (verifyOTP, resendOTP, changePassword)

  return {
    user,
    loading,
    error,
    loginUser,
    registerUser,
    // ...other actions
  };
};
