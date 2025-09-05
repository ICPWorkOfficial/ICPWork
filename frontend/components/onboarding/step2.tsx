'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, User, Phone } from 'lucide-react';
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
  skills?: Skill[];
  role?: 'Client' | 'Freelancer';
  companyName?: string;
  companyWebsite?: string;
  phone?: string;
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



const UserPreviewCard: React.FC<UserPreviewCardProps> = ({ name, skills = [], role = 'Freelancer', companyName, companyWebsite, phone, isAvailable = true }) => {
  return (
    <div className="relative w-full max-w-[495px] mx-auto  rounded-xl">
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)',
          opacity: 0.5,
          transform: 'rotate(3deg) '
        }}
      />

      <div className="relative bg-white w-full p-6 lg:p-8 z-10 shadow-lg">
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <div className="w-28 h-28 lg:w-40 lg:h-40 bg-[#F4F4F4] rounded-full flex items-center justify-center">
        <User size={72} className="text-[#C6C6C6]" />
          </div>

          <div className="flex flex-col items-center gap-4 lg:gap-6">
        <h2 className={`${designTokens.typography.headingMedium} text-[#041D37] text-center`}>
          {name}
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-6 h-3 bg-[#32CD32] rounded-full relative">
          <div className="absolute right-0 top-0.5 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
          <span className="text-[14px] font-medium leading-[18px] text-[#161616]">Available for work</span>
        </div>
          </div>
        </div>

        <div className="mt-6 pt-6 px-4 lg:px-0">
          {/* For freelancers show skills; for clients show company name */}
          <div className="border-t border-[#E0E0E0] pt-5">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>{role === 'Client' ? 'Company' : 'Skills'}</h3>
            <div className="flex flex-wrap gap-3">
              {role === 'Client' ? (
                <div className="inline-flex items-center gap-2  py-2 rounded-[8px] ">
                  <span className={`${designTokens.typography.bodySmall} text-[#161616]`}>{companyName || '—'}</span>
                </div>
              ) : (
                skills.slice(0, 3).map((skill) => (
                  <SkillTag key={skill.id} skill={skill} onRemove={() => {}} variant="display" />
                ))
              )}
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-5 mt-5">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>{role === 'Client' ? 'Website' : 'Location'}</h3>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#A8A8A8]" />
              <span className="text-[14px] text-[#161616]">{role === 'Client' ? (companyWebsite || '—') : 'Remote'}</span>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-5 mt-6 pb-6">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>{role === 'Client' ? 'Phone' : 'Resume'}</h3>
            <div className="flex items-center gap-2">
              {role === 'Client' ? (
                <>
                  <Phone size={18} className="text-[#A8A8A8]" />
                  <span className="text-[14px] text-[#161616]">{phone || '—'}</span>
                </>
              ) : (
                <>
                  <FileText size={18} className="text-[#A8A8A8]" />
                </>
              )}
            </div>
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
  const [role, setRole] = useState<'Client' | 'Freelancer'>('Client');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyWebsite, setCompanyWebsite] = useState<string>('');
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'UI UX DESIGN' },
    { id: '2', name: 'UI UX DESIGN' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<{ name?: string; skills?: Skill[]; companyName?: string; companyWebsite?: string; phone?: string; role?: 'Client' | 'Freelancer' } | null>(null);

  // Load a dummy profile from localStorage (simulate backend). If none, use defaults.
  useEffect(() => {
    // localStorage reads disabled during development to avoid overriding role provided by caller
    // try {
    //   const raw = typeof window !== 'undefined' ? localStorage.getItem('demo_profile') : null;
    //   if (raw) {
    //     const prof = JSON.parse(raw);
    //     if (prof?.skills && Array.isArray(prof.skills)) {
    //       setSkills(prof.skills.map((s: any, i: number) => ({ id: String(i + 1), name: (s.name || s).toUpperCase() })));
    //     }
    //   }
    // } catch (e) {
    //   // ignore parse errors
    // }
  }, []);

  // Prepare preview data from local dummy storage when modal opens
  useEffect(() => {
    if (!showPreview) return;
    // localStorage disabled — build preview from current component state instead
    try {
      setPreviewProfile({
        name: 'Preview User',
        skills: skills,
        companyName: companyName,
        companyWebsite: companyWebsite,
        phone: undefined,
        role: role
      });
    } catch (e) {
      setPreviewProfile({ name: 'Preview User', skills });
    }
  }, [showPreview, skills, companyName, companyWebsite, role]);

  // load role and client info from demo_profile if present
  useEffect(() => {
    // localStorage loading disabled — do not override role set by parent or default
    // try {
    //   const raw = typeof window !== 'undefined' ? localStorage.getItem('demo_profile') : null;
    //   if (raw) {
    //     const prof = JSON.parse(raw);
    //     if (prof.role === 'Client') setRole('Client');
    //     if (prof.name) {
    //       // if name is full name, do nothing here — preview will use it
    //     }
    //     if (prof.companyName) setCompanyName(prof.companyName);
    //     if (prof.companyWebsite) setCompanyWebsite(prof.companyWebsite);
    //   }
    // } catch (e) {}
  }, []);

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: trimmed.toUpperCase()
    };
    setSkills(prev => [...prev, newSkill]);
    setInputValue('');
  };

  const removeSkill = (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const handleBack = () => {
    console.log('Navigate back');
    router.push('/onboarding/step1');
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // Save different payloads depending on role
      const base: any = { role };
      if (role === 'Client') {
        base.name = (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('demo_profile') || '{}').name) || `${companyName}` || 'Client';
        base.companyName = companyName || undefined;
        base.companyWebsite = companyWebsite || undefined;
      } else {
        base.name = 'Demo User';
        base.skills = skills.map(s => ({ name: s.name }));
      }
      if (typeof window !== 'undefined') {
        // localStorage persistence disabled during development
        // localStorage.setItem('demo_profile', JSON.stringify(base));
      }
      // proceed to next step
      router.push('/onboarding/step3');
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Pie chart calculations
  const completedSteps = 2;
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
          style={{ width: `${(2 / totalSteps) * 100}%`,
          background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)',
          // opacity: 0.3,
        }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-28 py-12 h-screen overflow-hidden">
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
                  <UserPreviewCard
                    name={previewProfile.name || 'Preview User'}
                    skills={previewProfile.skills || skills}
                    role={previewProfile.role || role}
                    companyName={previewProfile.companyName || companyName}
                    companyWebsite={previewProfile.companyWebsite || companyWebsite}
                    phone={previewProfile.phone || ''}
                    isAvailable={true}
                  />
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
              <h1 className={`${designTokens.typography.headingLarge} text-[#161616]`}>
                {role === 'Client' ? 'Tell us about your company' : 'What are your skills?'}
              </h1>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="md:hidden ml-4 px-3 py-2 rounded bg-[#161616] text-white"
              >
                Preview
              </button>
            </div>

            {/* Role-specific Input Card */}
            <div className="mb-8">
              {role === 'Client' ? (
                <div className="flex flex-col gap-4 w-full max-w-[700px]">
                  {/* Company Name card */}
                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white w-full">
                    <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>Company Name</label>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={`${designTokens.typography.bodySmall} text-[#161616] w-full p-2 rounded border border-transparent focus:border-[#44B0FF]`} placeholder="Enter company name" />
                  </div>

                  {/* Divider / spacing automatically provided by gap-4 */}

                  {/* Company Website card */}
                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white w-full">
                    <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>Company Website</label>
                    <input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className={`${designTokens.typography.bodySmall} text-[#161616] w-full p-2 rounded border border-transparent focus:border-[#44B0FF]`} placeholder="https://yourcompany.com" />
                  </div>
                </div>
               ) : (
                <div className="w-full max-w-[700px] rounded-xl border-[0.6px] border-[#8D8D8D] p-4 md:p-6">
                  <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>Type skill</label>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`${designTokens.typography.bodySmall} text-[#161616] bg-transparent border border-transparent focus:border-[#44B0FF] focus:ring-0 rounded w-full p-2`}
                      placeholder="Type a skill and press Enter"
                      aria-label="Add a skill"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 items-center mt-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-[33px] border border-[#E6E6E6]">
                        <span className={`${designTokens.typography.bodySmall} text-[#161616]`}>{skill.name}</span>
                        <button onClick={() => removeSkill(skill.id)} aria-label={`Remove ${skill.name}`} className="ml-2 p-1 rounded hover:bg-gray-100">
                          <X size={14} className="text-[#393939]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/onboarding/step1" className="no-underline">
                <button
                  onClick={handleBack}
                  className="w-full sm:w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>Back</span>
                </button>
              </Link>

              <Link href="/onboarding/step3" className="no-underline">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <span className={`${designTokens.typography.headingSmall} text-white`}>Next</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Content - Preview Card */}
          <div className="hidden lg:flex lg:flex-shrink-0 w-full lg:w-[495px]">
            <UserPreviewCard
              name={previewProfile?.name || 'Preview User'}
              skills={previewProfile?.skills || skills}
              role={role}
              companyName={previewProfile?.companyName || companyName}
              companyWebsite={previewProfile?.companyWebsite || companyWebsite}
              phone={previewProfile?.phone || ''}
              isAvailable={true}
            />
          </div>
         </div>
       </div>
     </div>
   );
 };

 export default SkillsInputPage;