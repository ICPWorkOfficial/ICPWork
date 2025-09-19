'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeAuth } from '@/hooks/useSafeAuth';

// Import step components
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2RoleSelection from './Step2RoleSelection';
import Step3SkillsOrCompany from './Step3SkillsOrCompany';
import Step4Location from './Step4Location';
import Step5Description from './Step5Description';

// Design tokens from Figma
const designTokens = {
  colors: {
    primary: '#161616',
    secondary: '#041D37',
    textSecondary: '#8D8D8D',
    textStrong: '#6F6F6F',
    background: '#FFFFFF',
    backgroundPage: '#FCFCFC',
    borderDefault: '#E0E0E0',
    borderInput: '#8D8D8D',
    borderDashed: '#A8A8A8',
    success: '#32CD32',
    progressBlue: '#44B0FF',
    progressBackground: '#F6F6F6'
  },
  typography: {
    headingLarge: 'text-[32px] font-semibold leading-[40px] tracking-[-0.4px]',
    headingMedium: 'text-[42px] font-medium leading-[50px] tracking-[-0.8px]',
    headingSmall: 'text-[18px] font-medium leading-[28px]',
    bodyRegular: 'text-[20px] leading-[28px]',
    bodySmall: 'text-[14px] leading-[20px]',
    labelSmall: 'text-[14px] font-medium leading-[20px] tracking-[1px] uppercase'
  }
};

// Types
interface Skill {
  id: string;
  name: string;
}

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  phoneNumber: string;
  linkedinProfile: string;
  profilePhoto: string | null;
  
  // Skills (for freelancers)
  skills: Skill[];
  
  // Company Info (for clients)
  companyName: string;
  companyWebsite: string;
  industry: string;
  businessType: string;
  numberOfEmployees: string;
  
  // Address
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
  
  // Resume (for freelancers)
  resume: string | null;
  
  // Description
  description: string;
}

const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-[57px] h-[33px]">
      <svg viewBox="0 0 57 33" fill="none" className="w-full h-full">
        <path d="M40.1879 8.63504L32.2559 10.2732L25.8785 16.0471L18.2052 8.3738L18.2457 8.33328L11.1216 1.20916C9.50931 -0.403096 6.89434 -0.403096 5.28209 1.20916L1.20919 5.28206C-0.403065 6.89432 -0.403065 9.50928 1.20919 11.1215L18.4285 28.3408C23.8524 33.7647 32.6474 33.7647 38.0713 28.3408L38.1213 28.2908L55.0284 11.3836L50.0424 6.47868L40.1879 8.63504Z" fill="url(#paint0_linear)" />
        <path d="M50.1 6.4793L43.8062 7.68634L39.4091 8.63473L38.6832 9.0296L31.0349 1.38128C29.4226 -0.230975 26.8077 -0.230975 25.1954 1.38128L18.2437 8.33297L30.7409 20.8301C34.8379 24.9272 41.4809 24.9272 45.5788 20.8301L48.0317 18.3773L55.0265 11.3825L50.1009 6.4793H50.1Z" fill="url(#paint1_linear)" />
        <path d="M18.2441 8.33384L18.2039 8.37407L38.1198 28.29L38.1601 28.2498L18.2441 8.33384Z" fill="#FDB131" />
        <path d="M55.0284 11.3825C51.1668 15.2441 44.9057 15.2441 41.0432 11.3825L38.1635 8.5028L45.1557 1.5106C46.768 -0.101657 49.3829 -0.101657 50.9952 1.5106L55.0276 5.54297C56.6398 7.15523 56.6398 9.7702 55.0276 11.3825H55.0284Z" fill="#29AAE1" />
        <defs>
          <linearGradient id="paint0_linear" x1="15.066" y1="-1.80067" x2="47.4853" y2="30.6187" gradientUnits="userSpaceOnUse">
            <stop offset="0.21" stopColor="#F05A24" />
            <stop offset="0.68" stopColor="#FAAF3B" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="26.2265" y1="-0.549979" x2="55.4515" y2="28.675" gradientUnits="userSpaceOnUse">
            <stop offset="0.22" stopColor="#EC1E79" />
            <stop offset="0.89" stopColor="#522784" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span className="text-[24px] font-bold text-black">ICPWork</span>
    <span className="text-[16px] font-normal text-black">®</span>
  </div>
);

// Main Component
const MultiStepOnboarding: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useSafeAuth();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<'Client' | 'Freelancer'>('Freelancer');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    skills: [],
    companyName: '',
    companyWebsite: '',
    industry: '',
    businessType: '',
    numberOfEmployees: '',
    country: 'United States',
    state: '',
    city: '',
    zipCode: '',
    streetAddress: '',
    profilePhoto: null,
    phoneNumber: '',
    linkedinProfile: '',
    resume: null,
    description: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load user data and determine role
  useEffect(() => {
    if (user?.userType) {
      setRole(user.userType === 'client' ? 'Client' : 'Freelancer');
    }
  }, [user]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Step navigation
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare profile data for the API
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        companyName: role === 'Client' ? formData.companyName.trim() : null,
        companyWebsite: role === 'Client' ? formData.companyWebsite.trim() : null,
        industry: role === 'Client' ? formData.industry : null,
        businessType: role === 'Client' ? formData.businessType : null,
        numberOfEmployees: role === 'Client' ? parseInt(formData.numberOfEmployees) : null,
        description: formData.description.trim() || null,
        skills: role === 'Freelancer' ? formData.skills.map(s => s.name) : [],
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zipCode: formData.zipCode.trim(),
        streetAddress: formData.streetAddress.trim(),
        photo: formData.profilePhoto,
        linkedinProfile: formData.linkedinProfile.trim() || null,
      };
      
      // Call the update profile API
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          profileData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Handle API errors
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ submit: result.message || 'Failed to update profile' });
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / 5) * 100;

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              phoneNumber: formData.phoneNumber,
              linkedinProfile: formData.linkedinProfile,
              profilePhoto: formData.profilePhoto
            }}
            setFormData={(data) => setFormData({ ...formData, ...data })}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            userId={user?.email}
          />
        );
      case 2:
        return (
          <Step2RoleSelection
            role={role}
            setRole={setRole}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step3SkillsOrCompany
            role={role}
            formData={{
              skills: formData.skills,
              companyName: formData.companyName,
              companyWebsite: formData.companyWebsite,
              industry: formData.industry,
              businessType: formData.businessType,
              numberOfEmployees: formData.numberOfEmployees,
              resume: formData.resume
            }}
            setFormData={(data) => setFormData({ ...formData, ...data })}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step4Location
            formData={{
              country: formData.country,
              state: formData.state,
              city: formData.city,
              zipCode: formData.zipCode,
              streetAddress: formData.streetAddress
            }}
            setFormData={(data) => setFormData({ ...formData, ...data })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <Step5Description
            role={role}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      {/* Header */}
      <header className="bg-white h-[84px] border-b border-[#E0E0E0] flex items-center justify-between px-4 md:px-28">
        <Logo />
        <div className={`${designTokens.typography.bodyRegular} hidden md:flex items-center gap-2`}>
          <span className="text-[#101010]">Want to Hire ?</span>
          <span className="text-[#28a745]">Join As Client</span>
        </div>
      </header>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#f6f6f6] rounded-full">
        <div 
          className="h-full bg-[#44b0ff] rounded-full transition-all duration-300"
          style={{ 
            width: `${progressPercentage}%`,
            background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)'
          }}
        />
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-[#E0E0E0] py-4">
        <div className="max-w-6xl mx-auto px-4 md:px-28">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-[#44B0FF] text-white'
                      : 'bg-[#F6F6F6] text-[#8D8D8D]'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-[#44B0FF]' : 'bg-[#F6F6F6]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-[#8D8D8D]">
              Step {currentStep} of 5
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-28 py-12">
        {renderCurrentStep()}
        
        {/* Global Error Display */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepOnboarding;
