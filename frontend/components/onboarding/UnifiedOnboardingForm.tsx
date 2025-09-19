'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, User, Phone, Upload, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSafeAuth } from '@/hooks/useSafeAuth';

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
  
  // Profile
  profilePhoto: string | null;
  phoneNumber: string;
  linkedinProfile: string;
  
  // Resume (for freelancers)
  resume: string | null;
  
  // Description
  description: string;
}

// Reusable Components
const SkillTag: React.FC<{ skill: Skill; onRemove: (id: string) => void }> = ({ skill, onRemove }) => (
  <div className="inline-flex items-center gap-2 px-[26px] py-2 h-8 rounded-[33px] border-[0.8px] border-dashed border-[#A8A8A8]">
    <span className={`${designTokens.typography.bodySmall} text-[#161616]`}>
      {skill.name}
    </span>
    <button
      onClick={() => onRemove(skill.id)}
      className="w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-100 rounded"
      aria-label={`Remove ${skill.name}`}
    >
      <X size={10} className="text-[#393939]" strokeWidth={2} />
    </button>
  </div>
);

const UserPreviewCard: React.FC<{
  formData: FormData;
  role: 'Client' | 'Freelancer';
  isAvailable?: boolean;
}> = ({ formData, role, isAvailable = true }) => {
  const isClient = role === 'Client';
  
  return (
    <div className="relative w-full max-w-[495px] mx-auto rounded-xl">
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl pointer-events-none lg:block hidden"
        style={{
          background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)',
          opacity: 0.5,
          transform: 'rotate(3deg)'
        }}
      />
      
      <div className="relative bg-white w-full p-6 lg:p-8 z-10 shadow-lg">
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <div className="w-28 h-28 lg:w-40 lg:h-40 bg-[#F4F4F4] rounded-full flex items-center justify-center overflow-hidden">
            {formData.profilePhoto && !isClient ? (
              <img src={formData.profilePhoto} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <User size={72} className="text-[#C6C6C6]" />
            )}
          </div>
          
          <div className="flex flex-col items-center gap-4 lg:gap-6">
            <h2 className={`${designTokens.typography.headingMedium} text-[#041D37] text-center`}>
              {`${formData.firstName} ${formData.lastName}`.trim() || 'Preview User'}
            </h2>
            
            {!isClient && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-[#32CD32] rounded-full relative">
                    <div className="absolute right-0 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <span className="text-[14px] font-medium leading-[18px] text-[#161616]">Available for work</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-6 px-4 lg:px-0">
          {/* Section 1 */}
          <div className="border-t border-[#E0E0E0] pt-5">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>
              {isClient ? 'Company' : 'Skills'}
            </h3>
            {isClient ? (
              <div className="text-sm text-[#161616] font-medium">{formData.companyName || '—'}</div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {formData.skills.slice(0, 3).map((skill) => (
                  <div key={skill.id} className="inline-flex items-center gap-2 px-[26px] py-2 h-8 rounded-[33px] border-[0.8px] border-dashed border-[#A8A8A8]">
                    <span className={`${designTokens.typography.bodySmall} text-[#161616]`}>
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Section 2 */}
          <div className="border-t border-[#E0E0E0] pt-5 mt-5">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>
              {isClient ? 'Website' : 'Location'}
            </h3>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#A8A8A8]" />
              <span className="text-[14px] text-[#161616]">
                {isClient 
                  ? (formData.companyWebsite || '—')
                  : `${formData.city}, ${formData.state}, ${formData.country}`
                }
              </span>
            </div>
          </div>
          
          {/* Section 3 */}
          <div className="border-t border-[#E0E0E0] pt-5 mt-6 pb-6">
            <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>
              {isClient ? 'Phone' : 'Resume'}
            </h3>
            <div className="flex items-center gap-2">
              {isClient ? (
                <>
                  <Phone size={18} className="text-[#A8A8A8]" />
                  <span className="text-[14px] text-[#161616]">{formData.phoneNumber || '—'}</span>
                </>
              ) : (
                <FileText size={18} className="text-[#A8A8A8]" />
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

// Main Component
const UnifiedOnboardingForm: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useSafeAuth();
  
  // Form state
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
    country: 'USA',
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
  
  const [skillInput, setSkillInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Country/State/City options
  const countryOptions = ['USA', 'UK', 'Canada', 'Australia'];
  const stateOptionsMap: Record<string, string[]> = {
    USA: ['California', 'New York', 'Texas', 'Florida'],
    UK: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia']
  };
  const cityOptionsMap: Record<string, string[]> = {
    California: ['Los Angeles', 'San Francisco', 'San Diego'],
    'New York': ['New York City', 'Buffalo', 'Rochester'],
    Texas: ['Houston', 'Dallas', 'Austin'],
    Florida: ['Miami', 'Orlando', 'Tampa'],
    England: ['London', 'Manchester', 'Birmingham'],
    Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
    Wales: ['Cardiff', 'Swansea', 'Newport'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn'],
    Ontario: ['Toronto', 'Ottawa', 'Hamilton'],
    Quebec: ['Montreal', 'Quebec City', 'Laval'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],
    Alberta: ['Calgary', 'Edmonton', 'Red Deer'],
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong'],
    Victoria: ['Melbourne', 'Geelong', 'Ballarat'],
    Queensland: ['Brisbane', 'Gold Coast', 'Townsville'],
    'Western Australia': ['Perth', 'Fremantle', 'Rockingham']
  };
  
  // Load user data and determine role
  useEffect(() => {
    if (user?.userType) {
      setRole(user.userType === 'client' ? 'Client' : 'Freelancer');
    }
  }, [user]);
  
  // Update dependent dropdowns when country changes
  useEffect(() => {
    const defaultStates = stateOptionsMap[formData.country] || [];
    setFormData(prev => ({
      ...prev,
      state: defaultStates[0] || '',
      city: ''
    }));
  }, [formData.country]);
  
  // Update city when state changes
  useEffect(() => {
    const defaultCities = cityOptionsMap[formData.state] || [];
    setFormData(prev => ({
      ...prev,
      city: defaultCities[0] || ''
    }));
  }, [formData.state]);
  
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
  
  // Skill management
  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: trimmed.toUpperCase()
    };
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    setSkillInput('');
  };
  
  const removeSkill = (id: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (role === 'Freelancer' && formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    if (role === 'Client') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.companyWebsite.trim()) {
        newErrors.companyWebsite = 'Company website is required';
      }
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
        // Redirect to dashboard or next step
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
            width: '100%',
            background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)'
          }}
        />
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-28 py-12">
        {/* Mobile preview modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <button 
              aria-label="Close preview" 
              onClick={() => setShowPreview(false)} 
              className="absolute top-4 right-4 z-60 bg-white p-2 rounded-full shadow-lg"
            >
              <X size={18} />
            </button>
            
            <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[90vh] p-4 sm:p-6 relative overflow-auto shadow-lg">
              <div className="w-full flex justify-center">
                <UserPreviewCard formData={formData} role={role} />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Content - Form */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-4`}>
                Complete Your Profile
              </h1>
              <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
                Fill out your profile information to get started on ICPWork.
              </p>
              
              {/* Role Toggle */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('Freelancer')}
                    className={`px-6 py-3 rounded-[30px] border transition-colors ${
                      role === 'Freelancer' 
                        ? 'bg-[#161616] text-white border-transparent' 
                        : 'bg-white text-[#161616] border-[#041D37]'
                    }`}
                  >
                    Freelancer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Client')}
                    className={`px-6 py-3 rounded-[30px] border transition-colors ${
                      role === 'Client' 
                        ? 'bg-[#161616] text-white border-transparent' 
                        : 'bg-white text-[#161616] border-[#041D37]'
                    }`}
                  >
                    Client
                  </button>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                    <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                      FIRST NAME *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              </div>
              
              {/* Role-specific sections */}
              {role === 'Freelancer' ? (
                <>
                  {/* Skills */}
                  <div className="space-y-4">
                    <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Skills</h2>
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        ADD YOUR SKILLS *
                      </label>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] mb-4"
                        placeholder="Type a skill and press Enter"
                      />
                      <div className="flex flex-wrap gap-3">
                        {formData.skills.map((skill) => (
                          <SkillTag key={skill.id} skill={skill} onRemove={removeSkill} />
                        ))}
                      </div>
                      {errors.skills && <p className="text-red-500 text-sm mt-2">{errors.skills}</p>}
                    </div>
                  </div>
                  
                  {/* Profile Photo */}
                  <div className="space-y-4">
                    <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Profile Photo</h2>
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        UPLOAD PROFILE PHOTO
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
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => setFormData(prev => ({ ...prev, profilePhoto: String(reader.result || '') }));
                              reader.readAsDataURL(file);
                            }}
                            className="w-60"
                          />
                          <span className="text-sm text-[#6F6F6F]">Recommended size: 400x400px. JPG or PNG.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Company Information</h2>
                    <div className="space-y-4">
                      <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                        <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                          COMPANY NAME *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          placeholder="Enter your company name"
                        />
                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                      </div>
                      
                      <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                        <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                          COMPANY WEBSITE *
                        </label>
                        <input
                          type="url"
                          value={formData.companyWebsite}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          placeholder="https://yourcompany.com"
                        />
                        {errors.companyWebsite && <p className="text-red-500 text-sm mt-1">{errors.companyWebsite}</p>}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                          <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                            INDUSTRY
                          </label>
                          <select
                            value={formData.industry}
                            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          >
                            <option value="">Select Industry</option>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="Manufacturing">Manufacturing</option>
                          </select>
                        </div>
                        
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                          <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                            BUSINESS TYPE
                          </label>
                          <select
                            value={formData.businessType}
                            onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          >
                            <option value="">Select Type</option>
                            <option value="Startup">Startup</option>
                            <option value="SME">SME</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="Agency">Agency</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                        <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                          NUMBER OF EMPLOYEES
                        </label>
                        <select
                          value={formData.numberOfEmployees}
                          onChange={(e) => setFormData(prev => ({ ...prev, numberOfEmployees: e.target.value }))}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        >
                          <option value="">Select Range</option>
                          <option value="1">1-10</option>
                          <option value="11">11-50</option>
                          <option value="51">51-200</option>
                          <option value="201">200+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Contact Information</h2>
                <div className="space-y-4">
                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                    <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>
              
              {/* Address Information */}
              <div className="space-y-4">
                <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Address Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        COUNTRY
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                      >
                        {countryOptions.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        STATE
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                      >
                        {(stateOptionsMap[formData.country] || []).map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        CITY
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                      >
                        {(cityOptionsMap[formData.state] || []).map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        ZIP CODE
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        placeholder="Enter zip code"
                      />
                    </div>
                    
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                      <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                        STREET ADDRESS
                      </label>
                      <input
                        type="text"
                        value={formData.streetAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                        className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        placeholder="Enter street address"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-4">
                <h2 className={`${designTokens.typography.headingSmall} text-[#161616]`}>Description</h2>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                  <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                    {role === 'Client' ? 'COMPANY DESCRIPTION' : 'PROFESSIONAL DESCRIPTION'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] h-32 resize-none"
                    placeholder={role === 'Client' ? 'Tell us about your company...' : 'Tell us about your professional background...'}
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="w-full sm:w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>Preview</span>
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <span className={`${designTokens.typography.headingSmall} text-white`}>
                    {isSubmitting ? 'Saving...' : 'Complete Profile'}
                  </span>
                </button>
              </div>
              
              {errors.submit && (
                <div className="text-red-500 text-center mt-4">
                  {errors.submit}
                </div>
              )}
            </form>
          </div>
          
          {/* Right Content - Preview Card */}
          <div className="hidden lg:flex lg:flex-shrink-0 w-full lg:w-[495px]">
            <UserPreviewCard formData={formData} role={role} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedOnboardingForm;
