'use client';

import React, { useState } from 'react';
import { User, Briefcase, MapPin, Phone, Globe, FileText, CheckCircle } from 'lucide-react';

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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  linkedinProfile: string;
  profilePhoto: string | null;
  skills: Skill[];
  companyName: string;
  companyWebsite: string;
  industry: string;
  businessType: string;
  numberOfEmployees: string;
  resume: string | null;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
  description: string;
}

interface Step5DescriptionProps {
  role: 'Client' | 'Freelancer';
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const Step5Description: React.FC<Step5DescriptionProps> = ({
  role,
  formData,
  setFormData,
  errors,
  setErrors,
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit();
    }
  };

  const getLocationString = () => {
    const parts = [formData.city, formData.state, formData.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-4`}>
          {role === 'Freelancer' ? 'Professional Description' : 'Company Description'}
        </h1>
        <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
          {role === 'Freelancer' 
            ? 'Write a compelling description of your professional background and expertise.'
            : 'Tell us about your company, its mission, and what makes it unique.'
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
          <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
            {role === 'Client' ? 'COMPANY DESCRIPTION *' : 'PROFESSIONAL DESCRIPTION *'}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] h-32 resize-none"
            placeholder={role === 'Client' 
              ? 'Tell us about your company, its mission, values, and what makes it unique. Describe your industry focus and the types of projects you work on...'
              : 'Describe your professional background, expertise, and what services you offer. Highlight your experience, achievements, and what makes you stand out...'
            }
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#8D8D8D]">
              {formData.description.length}/500 characters
            </span>
            {formData.description.length >= 50 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={16} />
                <span className="text-xs">Good length</span>
              </div>
            )}
          </div>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Profile Summary */}
        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
          <h3 className={`${designTokens.typography.headingSmall} text-[#161616] mb-4`}>
            Profile Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User size={18} className="text-[#8D8D8D]" />
              <span className="text-sm text-[#6F6F6F]">
                <strong>Name:</strong> {formData.firstName} {formData.lastName}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#8D8D8D]" />
              <span className="text-sm text-[#6F6F6F]">
                <strong>Phone:</strong> {formData.phoneNumber}
              </span>
            </div>
            
            {formData.linkedinProfile && (
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#8D8D8D]" />
                <span className="text-sm text-[#6F6F6F]">
                  <strong>LinkedIn:</strong> {formData.linkedinProfile}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#8D8D8D]" />
              <span className="text-sm text-[#6F6F6F]">
                <strong>Location:</strong> {getLocationString()}
              </span>
            </div>
            
            {role === 'Freelancer' ? (
              <>
                {formData.skills.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-[#8D8D8D] mt-0.5" />
                    <div>
                      <span className="text-sm text-[#6F6F6F]">
                        <strong>Skills:</strong> {formData.skills.map(s => s.name).join(', ')}
                      </span>
                    </div>
                  </div>
                )}
                {formData.resume && (
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#8D8D8D]" />
                    <span className="text-sm text-[#6F6F6F]">
                      <strong>Resume:</strong> Uploaded
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {formData.companyName && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-[#8D8D8D]" />
                    <span className="text-sm text-[#6F6F6F]">
                      <strong>Company:</strong> {formData.companyName}
                    </span>
                  </div>
                )}
                {formData.companyWebsite && (
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[#8D8D8D]" />
                    <span className="text-sm text-[#6F6F6F]">
                      <strong>Website:</strong> {formData.companyWebsite}
                    </span>
                  </div>
                )}
                {formData.industry && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-[#8D8D8D]" />
                    <span className="text-sm text-[#6F6F6F]">
                      <strong>Industry:</strong> {formData.industry}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Preview Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full sm:w-[220px] h-12 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className={`${designTokens.typography.bodySmall} text-[#041D37]`}>
              Preview Profile
            </span>
          </button>
        </div>
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <span className={`${designTokens.typography.headingSmall} text-white`}>
            {isSubmitting ? 'Completing...' : 'Complete Profile'}
          </span>
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[90vh] p-6 relative overflow-auto shadow-lg">
            <button 
              aria-label="Close preview" 
              onClick={() => setShowPreview(false)} 
              className="absolute top-4 right-4 z-60 bg-white p-2 rounded-full shadow-lg"
            >
              ×
            </button>
            
            <div className="w-full flex justify-center">
              <div className="relative w-full max-w-[495px] mx-auto rounded-xl">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)',
                    opacity: 0.5,
                    transform: 'rotate(3deg)'
                  }}
                />
                
                <div className="relative bg-white w-full p-6 lg:p-8 z-10 shadow-lg">
                  <div className="flex flex-col items-center gap-6 lg:gap-8">
                    <div className="w-28 h-28 lg:w-40 lg:h-40 bg-[#F4F4F4] rounded-full flex items-center justify-center overflow-hidden">
                      {formData.profilePhoto ? (
                        <img src={formData.profilePhoto} alt="Profile" className="object-cover w-full h-full" />
                      ) : (
                        <User size={72} className="text-[#C6C6C6]" />
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-4 lg:gap-6">
                      <h2 className={`${designTokens.typography.headingMedium} text-[#041D37] text-center`}>
                        {`${formData.firstName} ${formData.lastName}`.trim() || 'Preview User'}
                      </h2>
                      
                      {role === 'Freelancer' && (
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
                        {role === 'Client' ? 'Company' : 'Skills'}
                      </h3>
                      {role === 'Client' ? (
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
                        {role === 'Client' ? 'Website' : 'Location'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#A8A8A8]" />
                        <span className="text-[14px] text-[#161616]">
                          {role === 'Client' 
                            ? (formData.companyWebsite || '—')
                            : getLocationString()
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Section 3 */}
                    <div className="border-t border-[#E0E0E0] pt-5 mt-6 pb-6">
                      <h3 className={`${designTokens.typography.labelSmall} text-[#8D8D8D] mb-3`}>
                        {role === 'Client' ? 'Phone' : 'Resume'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {role === 'Client' ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Description;
