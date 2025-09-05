"use client";

import React, { useState, useEffect } from "react";
import { Upload, ArrowRight, Info, X } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';

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
    className="relative h-[104px] w-full md:w-[495px] rounded-xl border border-solid border-[#8d8d8d] bg-white cursor-pointer hover:border-gray-400 transition-colors"
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

const FreelancerOnboarding: React.FC<{ initialRole?: 'Client' | 'Freelancer' }> = ({ initialRole }) => {
  const router = useRouter();
  const [role, setRole] = useState<'Client' | 'Freelancer'>(initialRole ?? 'Client');
  // persist role to localStorage when changed
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('demo_profile');
        const base = raw ? JSON.parse(raw) : {};
        base.role = role;
        localStorage.setItem('demo_profile', JSON.stringify(base));
      }
    } catch (e) {
      // ignore
    }
  }, [role]);

  const [showProTipModal, setShowProTipModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // open pro tip as modal automatically on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowProTipModal(true);
    }
  }, []);

  const handleResumeUpload = () => console.log("Resume upload clicked");
  const handleManualFill = () => console.log("Manual fill clicked");

  const handleSave = () => {
    const payload = { name: `${firstName} ${lastName}`.trim(), role };
    if (typeof window !== 'undefined') localStorage.setItem('demo_profile', JSON.stringify(payload));
    // small feedback can be added later
  };

  const handleNextForClient = () => {
    // ensure saved
    handleSave();
    router.push('/onboarding/step2');
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen w-full relative">
      {/* Header */}
      <header className="bg-white h-[84px] w-full border-b border-[#e0e0e0] flex items-center justify-between px-6 md:px-[116px]">
        <Logo />
        <div className="text-[20px] leading-[28px]">
          <span className="text-[#101010]">Want to Hire ?</span>
          <span className="text-[#775da8]"> </span>
          <span className="text-[#28a745]">Join As Client</span>
        </div>
      </header>

      {/* ProTip modal for small screens */}
      {showProTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-[95vw] w-full p-6 relative">
            <button onClick={() => setShowProTipModal(false)} className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
              <X size={16} />
            </button>
            <ProTip
              title="PRO TIP:"
              description="Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success."
            />
          </div>
        </div>
      )}

      {/* Scrollbar */}
      <div className="fixed right-0 top-[515px] w-2 h-[66px] bg-[#d9d9d9] rounded-[27px]" />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-84px)] px-6 md:px-[116px] py-12">
        <div className="flex gap-12 items-start max-w-7xl w-full flex-col md:flex-row">
          {/* Left Content */}
          <div className="flex-1 max-w-[699px] w-full">
             {/* Title area */}
             <div className="mb-12">
               <h1 className="text-[42px] font-semibold leading-[50px] tracking-[-0.8px] text-[#161616] mb-3">
                 {role === 'Client' ? 'Tell us about your company' : 'How Would You Like to Tell About Yourself?'}
               </h1>
               <p className="text-[20px] leading-[28px] text-[#393939]">
                 {role === 'Client'
                   ? 'Provide basic details to create your client account.'
                   : 'Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable.'}
               </p>
             </div>

             {/* Conditional content by role */}
             {role === 'Client' ? (
               <>
               <div className="flex  gap-4">
                {/* First Name question as a standalone block */}
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block ">FIRST NAME</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]" />
                  </div>
                </div>

                {/* Last Name question as a separate standalone block */}
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block ">LAST NAME</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]" />
                  </div>
                </div>
              </div>

                {/* Action buttons kept outside the input blocks. Exit button removed. */}
                <div className="flex gap-4 mt-4 max-w-[700px] w-full">
                  <button onClick={handleSave} className="w-full md:w-[220px] h-12 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center">Save</button>
                  <button onClick={handleNextForClient} className="w-full md:w-[220px] h-12 bg-[#161616] text-white rounded-[30px]">Next</button>
                </div>
               </>
             ) : (
               <div className="flex flex-col gap-5 md:flex-row md:flex-wrap">
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
             )}
            </div>

           {/* Right Content - Pro Tip */}
           <div className="flex-shrink-0 flex flex-col items-center gap-6">
            {/* Show ProTip on md+ */}
            <div className="hidden md:block">
              <ProTip
                title="PRO TIP:"
                description="Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success."
              />
            </div>
            {role !== 'Client' && (
              <Button asChild>
                <Link href="/onboarding/step2" className="no-underline">
                  Continue
                </Link>
              </Button>
            )}
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default FreelancerOnboarding;
