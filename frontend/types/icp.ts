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

// ===== ESCROW TYPES =====

export type EscrowStatus = 
  | { Pending: null }
  | { Completed: null }
  | { Disputed: null }
  | { Cancelled: null }
  | { Refunded: null };

export interface EscrowAgreement {
  id: number;
  buyer: string; // Principal as string
  seller: string; // Principal as string
  arbitrator?: string; // Principal as string
  amount: number;
  platformFee: number; // 5% of the amount
  netAmount: number; // Amount after platform fee deduction
  description: string;
  status: EscrowStatus;
  createdAt: number;
  deadline: number; // Project deadline
  completedAt?: number;
  buyerApproved: boolean;
  sellerApproved: boolean;
  serviceId: string; // Reference to the service
  projectTitle: string;
}

export interface CreateEscrowArgs {
  seller: string; // Principal as string
  arbitrator?: string; // Principal as string
  amount: number;
  description: string;
  deadline: number; // Project deadline in nanoseconds
  serviceId: string;
  projectTitle: string;
}

export interface PlatformFeeStats {
  totalFees: number;
  totalTransactions: number;
  collectedFees: number;
}

// ===== ESCROW API RESPONSE TYPES =====

export interface EscrowApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EscrowBalanceResponse {
  balance: number;
  formatted: string;
}

export interface EscrowCreateResponse {
  escrowId: number;
  message: string;
}

export interface EscrowActionResponse {
  success: boolean;
  message: string;
}