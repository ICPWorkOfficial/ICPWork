'use client';

import React, { useState } from 'react';
import { X, MapPin, FileText, User } from 'lucide-react';
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

interface SkillTagProps {
  skill: Skill;
  onRemove: (id: string) => void;
  variant?: 'input' | 'display';
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

interface UserPreviewCardProps {
  name: string;
  skills: Skill[];
  isAvailable?: boolean;
}

// Reusable Components
const SkillTag: React.FC<SkillTagProps> = ({ skill, onRemove, variant = 'input' }) => (
  <div className="inline-flex items-center gap-2 px-[26px] py-2 h-8 rounded-[33px] border-[0.8px] border-dashed border-[#A8A8A8]">
    <span className={`${designTokens.typography.bodySmall} text-[#161616]`}>
      {skill.name}
    </span>
    {variant === 'input' && (
      <button
        onClick={() => onRemove(skill.id)}
        className="w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-100 rounded"
        aria-label={`Remove ${skill.name}`}
      >
        <X size={10} className="text-[#393939]" strokeWidth={2} />
      </button>
    )}
  </div>
);

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps }) => (
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
      {/* Progress arc */}
      <div className="absolute inset-0">
        <svg width="91" height="92" viewBox="0 0 91 92" fill="none" className="rotate-[277.5deg]">
          <path 
            d="M70.0611 0.119893C72.0726 -0.0128202 73.8261 1.51194 73.7986 3.52766C73.6943 11.1718 71.6815 18.6899 67.9175 25.3881C63.5559 33.1499 57.0311 39.4756 49.1379 43.5948C41.2448 47.714 32.3241 49.4487 23.4625 48.5877C15.8152 47.8447 8.49677 45.1962 2.16649 40.9101C0.49723 39.7798 0.249263 37.4694 1.50853 35.8952V35.8952C2.7678 34.321 5.05647 34.0819 6.74254 35.1869C11.9538 38.6022 17.931 40.7156 24.1685 41.3217C31.6207 42.0457 39.1226 40.5869 45.7604 37.1228C52.3982 33.6588 57.8853 28.3391 61.5533 21.8118C64.6233 16.3485 66.3081 10.2366 66.4867 4.00843C66.5445 1.99335 68.0495 0.252606 70.0611 0.119893V0.119893Z" 
            fill="#161616"
          />
        </svg>
      </div>
      {/* Step text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${designTokens.typography.bodyRegular} text-[#6F6F6F]`}>
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  </div>
);

const UserPreviewCard: React.FC<UserPreviewCardProps> = ({ name, skills, isAvailable = true }) => (
  <div className="bg-white rounded-xl shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] w-[495px] h-[1012px] p-8">
    <div className="flex flex-col items-center gap-8">
      {/* User Avatar */}
      <div className="w-40 h-40 bg-[#F4F4F4] rounded-full flex items-center justify-center">
        <User size={80} className="text-[#C6C6C6]" />
      </div>
      
      {/* User Info */}
      <div className="flex flex-col items-center gap-6">
        <h2 className={`${designTokens.typography.headingMedium} text-[#041D37]`}>
          {name}
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
    
    {/* Skills Section */}
    <div className="mt-8 pt-8">
      <div className="border-t border-[#E0E0E0] pt-5">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>
          Skills
        </h3>
        <div className="flex flex-wrap gap-[23px]">
          {skills.slice(0, 3).map((skill) => (
            <SkillTag key={skill.id} skill={skill} onRemove={() => {}} variant="display" />
          ))}
        </div>
      </div>
      
      {/* Location Section */}
      <div className="border-t border-[#E0E0E0] pt-5 mt-5">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-5`}>
          Location
        </h3>
        <MapPin size={20} className="text-[#A8A8A8]" />
      </div>
      
      {/* Resume Section */}
      <div className="border-t border-[#E0E0E0] pt-5 mt-6">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-5`}>
          Resume
        </h3>
        <FileText size={20} className="text-[#A8A8A8]" />
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
const SkillsInputPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'UI UX DESIGN' },
    { id: '2', name: 'UI UX DESIGN' }
  ]);
  const [inputValue, setInputValue] = useState('UI UX DES');

  const addSkill = (skillName: string) => {
    if (skillName.trim()) {
      const newSkill: Skill = {
        id: Date.now().toString(),
        name: skillName.trim().toUpperCase()
      };
      setSkills([...skills, newSkill]);
      setInputValue('');
    }
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSkill(inputValue);
    }
  };

  const handleBack = () => {
    // Handle back navigation
    console.log('Navigate back');
  };

  const handleNext = () => {
    // Handle next navigation
    console.log('Navigate to next step');
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

      {/* Progress Bar */}
      <div className="w-[576px] h-0.5 bg-[#F6F6F6] relative">
        <div className="absolute inset-0 border border-[#44B0FF]" />
      </div>

      {/* Main Content */}
      <div className="flex gap-12 px-28 py-12">
        {/* Left Content */}
        <div className="flex-1 max-w-[600px]">
          {/* Step Progress */}
          <div className="mb-6">
            <StepProgress currentStep={2} totalSteps={5} />
          </div>

          {/* Title */}
          <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-6`}>
            What are your skills?
          </h1>

          {/* Skills Input */}
          <div className="mb-8">
            <div className="relative w-[503px] h-[104px] rounded-xl border-[0.6px] border-[#8D8D8D] p-6">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-4`}>
                Skills
              </label>
              
              <div className="flex flex-wrap gap-4 items-center">
                {skills.map((skill) => (
                  <SkillTag key={skill.id} skill={skill} onRemove={removeSkill} />
                ))}
                
                <div className="flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`${designTokens.typography.bodySmall} text-[#161616] bg-transparent border-none outline-none`}
                    placeholder=""
                  />
                  <span className="text-[20px] font-light text-[#28a745] ml-1">|</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-[25px]">
            <button
              onClick={handleBack}
              className="w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>
              <Link href="/onboarding/step1" className="no-underline">
                Back
              </Link>
              </span>
            </button>
            
            <Link href="/onboarding/step3" className="no-underline">
            <button
              onClick={handleNext}
              className="w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <span className={`${designTokens.typography.headingSmall} text-white`}>
                  Next
              </span>
            </button>
            </Link>
          </div>
        </div>

        {/* Right Content - Preview Card */}
        <div className="flex-shrink-0">
          <UserPreviewCard 
            name="Cyrus Roshan" 
            skills={skills}
            isAvailable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillsInputPage;