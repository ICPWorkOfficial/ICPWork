"use client";

import React from "react";
import { Upload, ArrowRight, Info } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

// OptionCard Component
interface OptionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isFile?: boolean;
  onClick?: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  icon,
  isFile = false,
  onClick,
}) => (
  <div
    className="relative h-[104px] w-[495px] rounded-xl border border-solid border-[#8d8d8d] bg-white cursor-pointer hover:border-gray-400 transition-colors"
    onClick={onClick}
  >
    <div className="absolute left-6 top-5 flex flex-col gap-4">
      <p className="text-[14px] font-medium uppercase tracking-[1px] text-[#8d8d8d] leading-[20px]">
        {title}
      </p>
      <div className="flex items-center gap-4">
        {isFile && (
          <Upload className="h-5 w-4 text-[#525252]" strokeWidth={1.5} />
        )}
        <span
          className={`text-[20px] leading-[28px] underline ${
            isFile ? "text-[#525252]" : "text-[#1da1f2]"
          }`}
        >
          {description}
        </span>
        {!isFile && (
          <ArrowRight className="h-3 w-[72px] text-[#1da1f2]" strokeWidth={2} />
        )}
      </div>
    </div>
  </div>
);

// ProTip Component
interface ProTipProps {
  title: string;
  description: string;
}

const ProTip: React.FC<ProTipProps> = ({ title, description }) => (
  <div className="bg-white rounded-[7px] shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] h-[415px] w-[386px] p-10">
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-[7px]">
        <Info className="h-8 w-8 text-[#1da1f2] fill-current" />
        <h3 className="text-[32px] font-semibold uppercase tracking-[-0.4px] text-[#393939] leading-[40px]">
          {title}
        </h3>
      </div>
      <p className="text-[20px] text-[#525252] leading-[28px] w-[316px]">
        {description}
      </p>
    </div>
  </div>
);

// Logo Component
const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="relative w-[57px] h-[33px]">
      <svg viewBox="0 0 57 33" fill="none" className="w-full h-full">
        {/* SVG paths */}
      </svg>
    </div>
    <span className="text-[24px] font-bold text-black">ICPWork</span>
    <span className="text-[16px] font-normal text-black">®</span>
  </div>
);

const FreelancerOnboarding: React.FC = () => {
  const handleResumeUpload = () => console.log("Resume upload clicked");
  const handleManualFill = () => console.log("Manual fill clicked");

  return (
    <div className="bg-[#fcfcfc] min-h-screen w-full relative">
      {/* Header */}
      <header className="bg-white h-[84px] w-full border-b border-[#e0e0e0] flex items-center justify-between px-[116px]">
        <Logo />
        <div className="text-[20px] leading-[28px]">
          <span className="text-[#101010]">Want to Hire ?</span>
          <span className="text-[#775da8]"> </span>
          <span className="text-[#28a745]">Join As Client</span>
        </div>
      </header>

      {/* Scrollbar */}
      <div className="fixed right-0 top-[515px] w-2 h-[66px] bg-[#d9d9d9] rounded-[27px]" />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-84px)] px-[116px] py-12">
        <div className="flex gap-12 items-start max-w-7xl w-full">
          {/* Left Content */}
          <div className="flex-1 max-w-[699px]">
            <div className="mb-12">
              <h1 className="text-[42px] font-semibold leading-[50px] tracking-[-0.8px] text-[#161616] mb-3">
                How Would You Like to Tell About Yourself?
              </h1>
              <p className="text-[20px] leading-[28px] text-[#393939]">
                Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success.
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-5">
              <OptionCard
                title="Import from your resume"
                description="Click here to upload Your Resume"
                isFile
                onClick={handleResumeUpload}
              />
              <OptionCard
                title="Fill out manually"
                description="Click here"
                onClick={handleManualFill}
              />
            </div>
          </div>

          {/* Right Content - Pro Tip */}
          <div className="flex-shrink-0 flex flex-col items-center gap-6">
            <ProTip
              title="PRO TIP:"
              description="Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success."
            />
            <Button asChild>
              <Link href="/onboarding/step2" className="no-underline">
                Continue
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerOnboarding;
