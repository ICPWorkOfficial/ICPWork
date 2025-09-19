'use client';

import React from 'react';
import { Briefcase, User } from 'lucide-react';

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

interface Step2RoleSelectionProps {
  role: 'Client' | 'Freelancer';
  setRole: (role: 'Client' | 'Freelancer') => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2RoleSelection: React.FC<Step2RoleSelectionProps> = ({
  role,
  setRole,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-4`}>
          Choose Your Role
        </h1>
        <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
          Are you looking to hire talent or offer your services?
        </p>
      </div>

      <div className="space-y-6">
        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Freelancer Card */}
          <div
            className={`rounded-xl border-2 p-8 cursor-pointer transition-all duration-200 ${
              role === 'Freelancer'
                ? 'border-[#44B0FF] bg-blue-50'
                : 'border-[#E0E0E0] bg-white hover:border-[#8D8D8D]'
            }`}
            onClick={() => setRole('Freelancer')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                role === 'Freelancer' ? 'bg-[#44B0FF]' : 'bg-[#F4F4F4]'
              }`}>
                <User size={32} className={role === 'Freelancer' ? 'text-white' : 'text-[#8D8D8D]'} />
              </div>
              <h3 className={`${designTokens.typography.headingSmall} text-[#161616]`}>
                Freelancer
              </h3>
              <p className={`${designTokens.typography.bodySmall} text-[#6F6F6F]`}>
                Offer your skills and services to clients worldwide. Build your portfolio and grow your freelance business.
              </p>
              <div className="space-y-2 text-left w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#32CD32] rounded-full"></div>
                  <span className="text-sm text-[#6F6F6F]">Create service listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#32CD32] rounded-full"></div>
                  <span className="text-sm text-[#6F6F6F]">Manage projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#32CD32] rounded-full"></div>
                  <span className="text-sm text-[#6F6F6F]">Build your portfolio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Card */}
          <div
            className={`rounded-xl border-2 p-8 cursor-pointer transition-all duration-200 ${
              role === 'Client'
                ? 'border-[#44B0FF] bg-blue-50'
                : 'border-[#E0E0E0] bg-white hover:border-[#8D8D8D]'
            }`}
            onClick={() => setRole('Client')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                role === 'Client' ? 'bg-[#44B0FF]' : 'bg-[#F4F4F4]'
              }`}>
                <Briefcase size={32} className={role === 'Client' ? 'text-white' : 'text-[#8D8D8D]'} />
              </div>
              <h3 className={`${designTokens.typography.headingSmall} text-[#161616]`}>
                Client
              </h3>
              <p className={`${designTokens.typography.bodySmall} text-[#6F6F6F]`}>
                Find and hire talented freelancers for your projects. Post jobs and manage your team.
              </p>
              <div className="space-y-2 text-left w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#32CD32] rounded-full"></div>
                  <span className="text-sm text-[#6F6F6F]">Post job listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#32CD32] rounded-full"></div>
                  <span className="text-sm text-[#6F6F6F]">Hire freelancers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#32CD32] rounded-full"></div>
                  <span className="text-sm text-[#6F6F6F]">Manage projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific information */}
        {role && (
          <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
            <h4 className={`${designTokens.typography.headingSmall} text-[#161616] mb-3`}>
              What's next for {role}s?
            </h4>
            {role === 'Freelancer' ? (
              <div className="space-y-2">
                <p className="text-sm text-[#6F6F6F]">
                  • Add your skills and expertise to showcase your abilities
                </p>
                <p className="text-sm text-[#6F6F6F]">
                  • Create a compelling profile description
                </p>
                <p className="text-sm text-[#6F6F6F]">
                  • Set your location and availability
                </p>
                <p className="text-sm text-[#6F6F6F]">
                  • Upload your resume and portfolio samples
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-[#6F6F6F]">
                  • Add your company information and website
                </p>
                <p className="text-sm text-[#6F6F6F]">
                  • Describe your business and industry
                </p>
                <p className="text-sm text-[#6F6F6F]">
                  • Set your location and contact preferences
                </p>
                <p className="text-sm text-[#6F6F6F]">
                  • Define your hiring needs and budget
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>
            Back
          </span>
        </button>
        
        <button
          type="button"
          onClick={onNext}
          disabled={!role}
          className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={`${designTokens.typography.headingSmall} text-white`}>
            Next Step
          </span>
        </button>
      </div>
    </div>
  );
};

export default Step2RoleSelection;
