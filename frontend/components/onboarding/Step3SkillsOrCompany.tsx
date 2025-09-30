
'use client';

import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

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

interface Skill {
  id: string;
  name: string;
}

interface FormData {
  skills: Skill[];
  companyName: string;
  companyWebsite: string;
  industry: string;
  businessType: string;
  numberOfEmployees: string;
  resume: string | null;
}

interface Step3SkillsOrCompanyProps {
  role: 'Client' | 'Freelancer';
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

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

const Step3SkillsOrCompany: React.FC<Step3SkillsOrCompanyProps> = ({
  role,
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  onBack
}) => {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: trimmed.toUpperCase()
    };
    
    setFormData({
      ...formData,
      skills: [...formData.skills, newSkill]
    });
    setSkillInput('');
  };

  const removeSkill = (id: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill.id !== id)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (role === 'Freelancer') {
      if (formData.skills.length === 0) {
        newErrors.skills = 'At least one skill is required';
      }
    } else {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.companyWebsite.trim()) {
        newErrors.companyWebsite = 'Company website is required';
      }
      // Validate website URL if provided
      if (formData.companyWebsite && !/^https?:\/\/.+/.test(formData.companyWebsite)) {
        newErrors.companyWebsite = 'Please enter a valid website URL (must start with http:// or https://)';
      }
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
          {role === 'Freelancer' ? 'Your Skills & Expertise' : 'Company Information'}
        </h1>
        <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
          {role === 'Freelancer' 
            ? 'Add your skills to showcase your expertise to potential clients.'
            : 'Tell us about your company to help freelancers understand your business.'
          }
        </p>
      </div>

      <div className="space-y-6">
        {role === 'Freelancer' ? (
          <>
            {/* Skills Section */}
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

            {/* Resume Upload */}
            <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                UPLOAD RESUME
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#F4F4F4] flex items-center justify-center">
                  <FileText size={24} className="text-[#C6C6C6]" />
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setFormData({ ...formData, resume: String(reader.result || '') });
                      reader.readAsDataURL(file);
                    }}
                    className="w-60"
                  />
                  <span className="text-sm text-[#6F6F6F]">PDF, DOC, or DOCX. Max 10MB.</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Company Information */}
            <div className="space-y-4">
              <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                  COMPANY NAME *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Media & Entertainment">Media & Entertainment</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                  <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                    BUSINESS TYPE
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  >
                    <option value="">Select Type</option>
                    <option value="Startup">Startup</option>
                    <option value="SME">SME</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Agency">Agency</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              </div>
              
              <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
                <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                  NUMBER OF EMPLOYEES
                </label>
                <select
                  value={formData.numberOfEmployees}
                  onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
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
          </>
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

export default Step3SkillsOrCompany;
