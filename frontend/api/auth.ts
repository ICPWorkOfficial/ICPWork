import { icpAgent } from '@/lib/icpagent';
import { UserType } from '@/types/icp';

export const register = async (email: string, username: string, password: string, userType: UserType) => {
  return await icpAgent.register(email, username, password, userType);
};

export const login = async (email: string, password: string) => {
  return await icpAgent.login(email, password);
};

export const verifyOTP = async (userId: string, otp: string) => {
  return await icpAgent.verifyOTP(userId, otp);
};

export const resendOTP = async (userId: string) => {
  return await icpAgent.resendOTP(userId);
};

export const changePassword = async (userId: string, otp: string, newPassword: string) => {
  return await icpAgent.changePassword(userId, otp, newPassword);
};

export const getUser = async (userId: string) => {
  return await icpAgent.getUser(userId);
};

export const getUserByEmail = async (email: string) => {
  return await icpAgent.getUserByEmail(email);
};
