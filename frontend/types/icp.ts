export type UserType = 'freelancer' | 'client';

// Backend User type matching auth.mo exactly
export interface BackendUser {
  email: string;
  passwordHash: number[]; // Blob type from Motoko (Vec Nat8)
  userType: UserType;
}

// Frontend User type (without password hash for security)
export interface User {
  email: string;
  userType: UserType;
}

export interface AuthRequest {
  email: string;
  password: string;
}

// Backend AuthError types matching auth.mo exactly
export type AuthError = 
  | 'UserAlreadyExists'
  | 'UserNotFound' 
  | 'InvalidCredentials'
  | 'InvalidEmail'
  | 'WeakPassword';

// API Response types
export interface LoginResponse {
  sessionId: string;
  user: User;
}

export interface SignupResponse {
  sessionId: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { [key: string]: string };
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