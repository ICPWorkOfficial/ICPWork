import { useState } from 'react';
import { getUser, login, register, verifyOTP, resendOTP, changePassword } from '@/api/auth';
import { UserType } from '@/types/icp';

interface User{
    success: boolean;
    user: {
        email: string;
        userType: string;
    }
}

export const useAuthStore = () => {
  const [user, setUser] = useState<User>();
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
      // Convert userType to match backend expectations
      const result = await register(email, username, password, userType);
      setUser(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyUserOTP = async (userId: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verifyOTP(userId, otp);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendUserOTP = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resendOTP(userId);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeUserPassword = async (userId: string, otp: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await changePassword(userId, otp, newPassword);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    loginUser,
    registerUser,
    verifyUserOTP,
    resendUserOTP,
    changeUserPassword,
  };
};
