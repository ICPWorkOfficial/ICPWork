'use client';

import React, { useState, useRef } from 'react';
import { FileText, Upload, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
    neutral600: '#525252'
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
interface UserProfile {
  name: string;
  avatar?: string;
  skills: string[];
  location: string;
  resume?: {
    name: string;
    url?: string;
  };
  linkedIn?: string;
}

interface FileUploadAreaProps {
  title: string;
  description: string;
  onFileUpload?: (file: File) => void;
  uploadedFile?: { name: string };
  accept?: string;
}

interface SkillTagProps {
  skill: string;
}

interface UserPreviewCardProps {
  profile: UserProfile;
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  isComplete?: boolean;
}

// Reusable Components
const SkillTag: React.FC<SkillTagProps> = ({ skill }) => (
  <div className="inline-flex items-center px-[26px] py-2 h-8 rounded-[33px] border-[0.8px] border-dashed border-[#A8A8A8]">
    <span className={`${designTokens.typography.bodySmall} text-[#161616]`}>
      {skill}
    </span>
  </div>
);

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps, isComplete = false }) => (
  <div className="flex items-center gap-4">
    <span className={`${designTokens.typography.headingSmall} text-[#6F6F6F]`}>
      Step
    </span>
    <div className="relative w-[91px] h-[92px]">
      {/* Background circle */}
      <div className="absolute inset-0">
        <svg width="91" height="92" viewBox="0 0 91 92" fill="none">
          <path 
            d="M91 46C91 71.4051 70.629 92 45.5 92C20.371 92 0 71.4051 0 46C0 20.5949 20.371 0 45.5 0C70.629 0 91 20.5949 91 46ZM7.23641 46C7.23641 67.3646 24.3676 84.6841 45.5 84.6841C66.6324 84.6841 83.7636 67.3646 83.7636 46C83.7636 24.6354 66.6324 7.31593 45.5 7.31593C24.3676 7.31593 7.23641 24.6354 7.23641 46Z" 
            fill="#F5F5F5"
          />
        </svg>
      </div>
      {/* Progress circle - complete circle for step 5/5 */}
      {isComplete && (
        <div className="absolute inset-0">
          <svg width="91" height="92" viewBox="0 0 92 92" fill="none">
            <path 
              d="M91.8028 45.9014C91.8028 71.2521 71.2521 91.8028 45.9014 91.8028C20.5508 91.8028 0 71.2521 0 45.9014C0 20.5508 20.5508 0 45.9014 0C71.2521 0 91.8028 20.5508 91.8028 45.9014ZM7.30025 45.9014C7.30025 67.2203 24.5826 84.5026 45.9014 84.5026C67.2203 84.5026 84.5026 67.2203 84.5026 45.9014C84.5026 24.5826 67.2203 7.30025 45.9014 7.30025C24.5826 7.30025 7.30025 24.5826 7.30025 45.9014Z" 
              fill="#161616"
            />
          </svg>
        </div>
      )}
      {/* Step text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${designTokens.typography.bodyRegular} text-[#6F6F6F]`}>
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  </div>
);

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  title, 
  description, 
  onFileUpload, 
  uploadedFile,
  accept = ".pdf,.doc,.docx"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div 
      className="relative w-[495px] h-[104px] rounded-xl border-[0.6px] border-[#8D8D8D] p-6 cursor-pointer hover:border-gray-400 transition-colors"
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col gap-4">
        <label className={`${designTokens.typography.labelSmall} text-[#8D8D8D] cursor-pointer`}>
          {title}
        </label>
        
        <div className="flex items-center gap-4">
          {title.toLowerCase().includes('resume') && (
            <FileText size={20} className="text-[#525252]" />
          )}
          
          <span className={`${designTokens.typography.bodyRegular} text-[#525252] underline cursor-pointer`}>
            {uploadedFile ? uploadedFile.name : description}
          </span>
        </div>
      </div>
    </div>
  );
};

const UserPreviewCard: React.FC<UserPreviewCardProps> = ({ profile }) => (
  <div className="bg-white rounded-xl shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] w-[495px] h-[1012px] p-8">
    <div className="flex flex-col items-center gap-10">
      {/* User Avatar */}
      <div className="w-40 h-40 rounded-full overflow-hidden bg-[#F4F4F4] flex items-center justify-center">
        {profile.avatar ? (
          <Image 
            src={profile.avatar} 
            alt={profile.name}
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={80} className="text-[#C6C6C6]" />
        )}
      </div>
      
      {/* User Info */}
      <div className="flex flex-col items-center gap-6">
        <h2 className={`${designTokens.typography.headingMedium} text-[#041D37]`}>
          {profile.name}
        </h2>
        
        {/* Availability Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-[25.778px] h-4 bg-[#32CD32] rounded-[10.483px] relative">
              <div className="absolute right-0 top-0.5 w-3 h-3 bg-white rounded-[10.483px]" />
            </div>
          </div>
          <span className="text-[16px] font-medium leading-[20px] tracking-[-0.1px] text-[#161616]">
            Available for work
          </span>
        </div>
      </div>
    </div>
    
    {/* Profile Sections */}
    <div className="mt-8 space-y-5">
      {/* Skills Section */}
      <div className="border-t border-[#E0E0E0] pt-5">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>
          Skills
        </h3>
        <div className="flex flex-wrap gap-3">
          {profile.skills.slice(0, 5).map((skill, index) => (
            <SkillTag key={index} skill={skill} />
          ))}
        </div>
        {profile.skills.length > 5 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {profile.skills.slice(5).map((skill, index) => (
              <SkillTag key={index + 5} skill={skill} />
            ))}
          </div>
        )}
      </div>
      
      {/* Location Section */}
      <div className="border-t border-[#E0E0E0] pt-5">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-5`}>
          Location
        </h3>
        <p className={`${designTokens.typography.bodyRegular} text-[#161616]`}>
          {profile.location}
        </p>
      </div>
      
      {/* Resume Section */}
      <div className="border-t border-[#E0E0E0] pt-6">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-4`}>
          Resume
        </h3>
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-[#A8A8A8]" />
          <span className={`${designTokens.typography.bodyRegular} text-[#161616]`}>
            {profile.resume?.name || 'No resume uploaded'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

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

// Main Page Component
const ResumeUploadPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Cyrus Roshan',
    skills: ['Prototyping', 'Development', 'Prototyping', 'Wireframing', 'Prototyping'],
    location: 'California, CA, USA',
    resume: { name: 'resume.pdf' }
  });

  const [linkedInProfile, setLinkedInProfile] = useState('');

  const handleResumeUpload = (file: File) => {
    setUserProfile(prev => ({
      ...prev,
      resume: { name: file.name }
    }));
  };

  const handleLinkedInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLinkedInProfile(event.target.value);
    setUserProfile(prev => ({
      ...prev,
      linkedIn: event.target.value
    }));
  };

  const handleBack = () => {
    // Handle back navigation
    console.log('Navigate back');
  };

  const handleFinish = () => {
    // Handle finish and go to workspace
    console.log('Go to workspace');
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      {/* Header */}
      <header className="bg-white h-[84px] border-b border-[#E0E0E0] flex items-center justify-between px-28">
        <Logo />
        <div className={`${designTokens.typography.bodyRegular}`}>
          <span className="text-[#101010]">Want to Hire ?</span>
          <span className="text-[#775da8]"> </span>
          <span className="text-[#28a745]">Join As Client</span>
        </div>
      </header>

      {/* Full Progress Bar */}
      <div className="w-full h-0.5 bg-[#44B0FF]" />

      {/* Main Content */}
      <div className="flex gap-12 px-28 py-12">
        {/* Left Content */}
        <div className="flex-1 max-w-[600px]">
          {/* Step Progress */}
          <div className="mb-6">
            <StepProgress currentStep={5} totalSteps={5} isComplete={true} />
          </div>

          {/* Title */}
          <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-6`}>
            Almost Done! Add your Resume
          </h1>

          {/* Upload Areas */}
          <div className="space-y-5 mb-8">
            {/* Resume Upload */}
            <FileUploadArea
              title="ADD YOUR RESUME"
              description="Click here to upload Your Resume"
              onFileUpload={handleResumeUpload}
              uploadedFile={userProfile.resume}
              accept=".pdf,.doc,.docx"
            />
            
            {/* LinkedIn Profile Input */}
            <div className="relative w-[495px] h-[104px] rounded-xl border-[0.6px] border-[#8D8D8D] p-6">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-4`}>
                ADD LINKEDIN PROFILE
              </label>
              
              <input
                type="url"
                value={linkedInProfile}
                onChange={handleLinkedInChange}
                placeholder="Add your profile Link Here"
                className={`${designTokens.typography.bodyRegular} text-[#6F6F6F] bg-transparent border-none outline-none w-full placeholder-[#6F6F6F]`}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-[25px]">
            <button
              onClick={handleBack}
              className="w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>
                Back
              </span>
            </button>
            
            <button
              onClick={handleFinish}
              className="w-[362px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <span className={`${designTokens.typography.headingSmall} text-white`}>
                <Link href="/dashboard" className="no-underline">
                    Yay! Let&apos;s Go To Workspace
                </Link>
              </span>
            </button>
          </div>
        </div>

        {/* Right Content - Preview Card */}
        <div className="flex-shrink-0">
          <UserPreviewCard profile={userProfile} />
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;