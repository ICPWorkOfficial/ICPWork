// Step 1
export type ProfileMethod = 'resume' | 'manual' | null;

// Step 2
export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
}

// Step 3
export interface AddressData {
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
  isPublic: boolean;
}

// Step 4
export interface ProfileData {
  profilePhoto?: File;
}

// Step 5
export interface FinalData {
  resume?: File;
  linkedinProfile?: string;
}

// Unified context for all steps
export interface OnboardingStep5Context {
  profileMethod?: ProfileMethod;
  resumeFile?: File | null;
  personalInfo?: PersonalInfo;
  skills?: string[];
  address?: AddressData;
  profile?: ProfileData;
  final?: FinalData;
  onComplete?: (stepData: any) => void;
}

// Props for each step
export interface OnboardingStep1Props {
  onContinue?: (method: 'resume' | 'manual') => void;
  onBack?: () => void;
}

export interface OnboardingStep2Props {
  data: OnboardingStep5Context;
  onNext: (stepData: { skills: string[] }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingStep3Props {
  data: OnboardingStep5Context;
  onNext: (stepData: { address: AddressData }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingStep4Props {
  data: OnboardingStep5Context;
  onComplete: (stepData: { profile: ProfileData }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingStep5Props {
  data: OnboardingStep5Context;
  onComplete: (stepData: { final: FinalData }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}