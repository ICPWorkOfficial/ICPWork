export type UserType = 'FREELANCER' | 'CLIENT';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  userType: UserType;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  userId: string;
  otp: string;
}

export interface PasswordChangeRequest {
  userId: string;
  otp: string;
  newPassword: string;
}

export interface Address {
  country: string;
  state: string;
  city: string;
  localAddress: string;
}

export interface FreelancerProfile {
  userId: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string;
  resumeUrl: string;
  skills: string[];
  address: Address;
}

export interface ClientProfile {
  userId: string;
  organizationName: string;
  website: string;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  description: string;
}