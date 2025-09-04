'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    headingLarge: 'md:text-[32px] text-[20px] font-semibold leading-[40px] tracking-[-0.4px]',
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
  onToggleAvailable?: (v: boolean) => void;
  address?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  profilePhoto?: string;
  resumeFileName?: string;
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
      {/* Progress Bar */}
      
      {/* Step text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${designTokens.typography.bodyRegular} text-[#6F6F6F]`}>
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  </div>
);

const UserPreviewCard: React.FC<UserPreviewCardProps> = ({ name, skills, isAvailable = true, onToggleAvailable, address, profilePhoto, resumeFileName }) => {
  // temporary fallback address shown when no address prop provided
  const tempAddress: UserPreviewCardProps['address'] = {
    streetAddress: '123 Demo Lane',
    city: 'London',
    state: 'England',
    country: 'UK',
    postalCode: 'SW1A 1AA'
  };

  // prefer actual address prop when any field is present, otherwise use tempAddress
  const hasAddress = address && Object.values(address).some(Boolean);
  const displayAddress = hasAddress ? address : tempAddress;

  return (
    <div className="relative w-full max-w-[495px] mx-auto  rounded-xl">
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl pointer-events-none lg:block hidden"
        style={{
          background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)',
          opacity: 0.5,
          transform: 'rotate(3deg) '
        }}
      />

      <div className="relative bg-white w-full p-6 lg:p-8 z-10 shadow-lg">
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <div className="w-28 h-28 lg:w-40 lg:h-40 bg-[#F4F4F4] rounded-full flex items-center justify-center overflow-hidden">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <User size={72} className="text-[#C6C6C6]" />
            )}
          </div>

          <div className="flex flex-col items-center gap-4 lg:gap-6">
            <h2 className={`${designTokens.typography.headingMedium} text-[#041D37] text-center`}>
              {name}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-[14px] font-medium leading-[18px] text-[#161616]">Available for work</span>
              {/* Toggle switch */}
              <button
                onClick={() => onToggleAvailable && onToggleAvailable(!isAvailable)}
                aria-pressed={isAvailable}
                className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${isAvailable ? 'bg-[#32CD32]' : 'bg-[#E6E6E6]'}`}
              >
                <span className={`ml-1 h-4 w-4 rounded-full bg-white transform transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 px-4 lg:px-0">
          <div className="border-t border-[#E0E0E0] pt-5">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>Skills</h3>
        <div className="flex flex-wrap gap-3">
          {skills.slice(0, 3).map((skill) => (
            <SkillTag key={skill.id} skill={skill} onRemove={() => {}} variant="display" />
          ))}
        </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-5 mt-5">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>Location</h3>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-[#A8A8A8] mt-1" />
              <div className="text-sm text-[#6F6F6F]">
                {displayAddress?.streetAddress ? (
                  <div className="font-medium text-[#041D37]">{displayAddress.streetAddress}</div>
                ) : null}
                <div>
                  {[displayAddress?.city, displayAddress?.state, displayAddress?.postalCode, displayAddress?.country].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-5 mt-6 pb-6">
        <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>Resume</h3>
        {resumeFileName ? (
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-[#A8A8A8]" />
            <span className="text-sm text-[#6F6F6F]">{resumeFileName}</span>
          </div>
        ) : (
          <FileText size={18} className="text-[#A8A8A8]" />
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'UI UX DESIGN' },
    { id: '2', name: 'UI UX DESIGN' }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<{ name?: string; skills?: Skill[]; address?: any; profilePhoto?: string; phone?: string; resumeFileName?: string; linkedin?: string } | null>(null);

  // Profile resume + linkedin state (replacing profile photo + phone)
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [linkedin, setLinkedin] = useState<string>('');

  // Load a dummy profile from localStorage (simulate backend). If none, use defaults.
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('demo_profile') : null;
      if (raw) {
        const prof = JSON.parse(raw);
        if (prof?.skills && Array.isArray(prof.skills)) {
          setSkills(prof.skills.map((s: any, i: number) => ({ id: String(i + 1), name: (s.name || s).toUpperCase() })));
        }
        if (typeof prof.available === 'boolean') setIsAvailable(prof.available);
        if (prof.resumeFileName) setResumeFileName(prof.resumeFileName);
        if (prof.linkedin) setLinkedin(prof.linkedin);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Prepare preview data from local dummy storage when modal opens
  useEffect(() => {
    if (!showPreview) return;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('demo_profile') : null;
      if (raw) {
        const prof = JSON.parse(raw);
        setPreviewProfile({
          name: prof.name || 'Preview User',
          skills: (prof.skills || []).map((s: any, i: number) => ({ id: String(i + 1), name: (s.name || s).toUpperCase() })),
          resumeFileName: prof.resumeFileName || undefined,
          linkedin: prof.linkedin || undefined
        });
      } else {
        setPreviewProfile({ name: 'Preview User', skills, resumeFileName: resumeFileName || undefined, linkedin });
      }
    } catch (e) {
      setPreviewProfile({ name: 'Preview User', skills, resumeFileName: resumeFileName || undefined, linkedin });
    }
  }, [showPreview]);

  const handleBack = () => {
    console.log('Navigate back');
    router.push('/onboarding/step1');
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // Simulate save by writing to localStorage as JSON. This avoids backend calls / canister issues.
      const payload: any = {
        name: 'Demo User',
        skills: skills.map(s => ({ name: s.name })),
        available: isAvailable,
        resumeFileName: resumeFileName || null,
        linkedin: linkedin || null
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_profile', JSON.stringify(payload));
      }
      // proceed to next step
      router.push('/onboarding/step5');
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Pie chart calculations
  const completedSteps = 5;
  const totalSteps = 5;
  const radius = 56; // px
  const circumference = 2 * Math.PI * radius;
  const completedLength = (completedSteps / totalSteps) * circumference;

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
      <div className="w-full h-2 bg-[#f6f6f6] rounded-full">
        <div 
          className="h-full bg-[#44b0ff] rounded-full transition-all duration-300"
          style={{ width: `${(5/ totalSteps) * 100}%`,
          background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)',
          // opacity: 0.3,
        }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-28 py-12">
        {/* Mobile preview modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            {/* Close button placed on the overlay so it's always visible */}
            <button aria-label="Close preview" onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-60 bg-white p-2 rounded-full shadow-lg">
              <X size={18} />
            </button>

            <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[90vh] p-4 sm:p-6 relative overflow-auto shadow-lg">
              <div className="w-full flex justify-center">
                {previewProfile ? (
                  <UserPreviewCard name={previewProfile.name || 'Preview User'} skills={previewProfile.skills || skills} isAvailable={isAvailable} onToggleAvailable={setIsAvailable} resumeFileName={previewProfile.resumeFileName || resumeFileName || undefined} />
                ) : (
                  <div className="p-6">Loading preview…</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Content */}
          <div className="flex-1">
            {/* Step label */}
            <div className="mb-4 flex items-center gap-4">
              <span className={`${designTokens.typography.headingSmall} text-[#6F6F6F]`}>Step</span>
              {/* Smaller Pie chart (compact) */}
              <div className="relative w-16 h-16">
                <svg width="64" height="64" viewBox="0 0 128 128" className="transform -rotate-90">
                  <circle cx="64" cy="64" r={radius} fill="none" stroke="#F6F6F6" strokeWidth="8" />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="#161616"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${completedLength} ${circumference - completedLength}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`${designTokens.typography.bodySmall} text-[#6F6F6F]`}>{completedSteps}/{totalSteps}</span>
                </div>
              </div>
            </div>

            {/* Title + mobile preview button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${designTokens.typography.headingLarge} text-[#161616] `}>Almost Done! Add your Resume</h2>
                  

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="md:hidden ml-4 px-3 py-2 rounded bg-[#161616] text-white"
              >
                Preview
              </button>
            </div>

            {/* Profile Photo Upload + Phone Verification (replacing address inputs) */}
            <div className="mb-8">
              <div className="w-full max-w-[700px]">
                {/* Resume Upload */}
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white mb-4">
                  <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>Resume Upload (optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        id="resumeUpload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setResumeFileName(file.name);
                        }}
                        className=" w-60"
                      />
                      <br/>
                      <span className="text-sm text-[#6F6F6F]">Accepted: PDF, DOC, DOCX.</span>
                    </div>
                    {/* <div className="w-28 text-right text-sm text-[#6F6F6F]">
                      {resumeFileName || 'No file selected'}
                    </div> */}
                  </div>
                </div>

                {/* LinkedIn URL (optional) */}
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                  <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>LinkedIn Profile (optional)</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-name"
                    className="w-full p-3 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/onboarding/step4" className="no-underline">
                <button
                  onClick={handleBack}
                  className="w-full sm:w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>Back</span>
                </button>
              </Link>

              <Link href="/onboarding/step5" className="no-underline">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <span className={`${designTokens.typography.headingSmall} text-white`}>Yay! Lets’s Go To workspace</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Content - Preview Card */}
          <div className="hidden lg:flex lg:flex-shrink-0 w-full lg:w-[495px]">
            <UserPreviewCard name={previewProfile?.name || 'Preview User'} skills={skills} isAvailable={isAvailable} onToggleAvailable={setIsAvailable} resumeFileName={previewProfile?.resumeFileName || resumeFileName || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsInputPage;