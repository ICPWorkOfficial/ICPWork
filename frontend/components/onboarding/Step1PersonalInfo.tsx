'use client';

import React from 'react';
import { User } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';

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

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  linkedinProfile: string;
  profilePhoto: string | null;
}

interface Step1PersonalInfoProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  onNext: () => void;
  userId?: string;
}

const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  userId
}) => {
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    // Validate phone number format if provided
    if (formData.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // Validate LinkedIn profile URL if provided
    if (formData.linkedinProfile && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(formData.linkedinProfile)) {
      newErrors.linkedinProfile = 'Please enter a valid LinkedIn profile URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-4`}>
          Personal Information
        </h1>
        <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
          Let's start with your basic personal information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Photo */}
        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
          <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
            PROFILE PHOTO
          </label>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-[#F4F4F4] overflow-hidden flex items-center justify-center">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[#C6C6C6]" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <ImageUploader
                userId={userId || 'anonymous'}
                folder="profile-photos"
                maxFiles={1}
                onUploadSuccess={(result) => {
                  setFormData({ ...formData, profilePhoto: result.url });
                }}
                onUploadError={(error) => {
                  console.error('Profile photo upload failed:', error);
                }}
                className="w-60"
              />
              <span className="text-sm text-[#6F6F6F]">Recommended size: 400x400px. JPG or PNG.</span>
            </div>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
            <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
              FIRST NAME *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          
          <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
            <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
              LAST NAME *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
            <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
              PHONE NUMBER *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
              placeholder="+1 555 555 5555"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
          
          <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
            <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
              LINKEDIN PROFILE
            </label>
            <input
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
              className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedinProfile && <p className="text-red-500 text-sm mt-1">{errors.linkedinProfile}</p>}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-8">
        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <span className={`${designTokens.typography.headingSmall} text-white`}>
            Next Step
          </span>
        </button>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
