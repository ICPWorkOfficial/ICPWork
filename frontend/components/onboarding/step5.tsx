import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, User, Upload, Loader2, CheckCircle } from 'lucide-react';

interface FinalData {
  resume?: File;
  linkedinProfile?: string;
}

interface OnboardingStep5Props {
  data: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
    skills?: string[];
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
    profile?: {
      profilePhoto?: File;
    };
    final?: FinalData;
  };
  onComplete: (stepData: { final: FinalData }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const OnboardingStep5: React.FC<OnboardingStep5Props> = ({ 
  data,
  onComplete,
  onBack,
  currentStep,
  totalSteps
}) => {
  const [resume, setResume] = useState<File | null>(data.final?.resume || null);
  const [linkedinProfile, setLinkedinProfile] = useState(data.final?.linkedinProfile || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Get user data for preview
  const userName = data.personalInfo?.firstName && data.personalInfo?.lastName 
    ? `${data.personalInfo.firstName} ${data.personalInfo.lastName}`
    : 'Cyrus Roshan';
    
  const skills = data.skills || ['Prototyping', 'Development', 'Prototyping', 'Wireframing', 'Prototyping'];
  
  const location = data.address?.city && data.address?.state && data.address?.country
    ? `${data.address.city}, ${data.address.state}, ${data.address.country}`
    : 'California, CA, USA';

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setResume(file);
      setUploadError(null);
    } else {
      setUploadError('Please upload a PDF or document file');
    }
  };

  const handleResumeClick = () => {
    resumeInputRef.current?.click();
  };

  // API function to upload profile data
  const uploadProfileData = async () => {
    const formData = new FormData();
    
    // Add all collected data
    if (data.personalInfo) {
      formData.append('firstName', data.personalInfo.firstName || '');
      formData.append('lastName', data.personalInfo.lastName || '');
    }
    
    if (data.skills) {
      formData.append('skills', JSON.stringify(data.skills));
    }
    
    if (data.address) {
      formData.append('address', JSON.stringify(data.address));
    }
    
    if (data.profile?.profilePhoto) {
      formData.append('profilePhoto', data.profile.profilePhoto);
    }
    
    if (resume) {
      formData.append('resume', resume);
    }
    
    if (linkedinProfile) {
      formData.append('linkedinProfile', linkedinProfile);
    }

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleComplete = async () => {
    if (!resume) {
      setUploadError('Please upload your resume before continuing');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload to API
      await uploadProfileData();
      
      setUploadSuccess(true);
      
      // Complete onboarding after successful upload
      setTimeout(() => {
        onComplete({ 
          final: { 
            resume, 
            linkedinProfile 
          } 
        });
      }, 1500);
      
    } catch (error) {
      setUploadError('Failed to create profile. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      {/* Header */}
      <header className="w-full h-[84px] bg-white border-b border-[#e0e0e0] flex items-center justify-between px-8">
        <div className="flex items-center">
          {/* Logo */}
          <div className="text-xl font-semibold text-[#161616]">
            ICPWork
          </div>
        </div>
        
        {/* Right side navigation */}
        <div className="flex items-center space-x-2">
          <span className="text-[#101010] text-xl">Want to Hire ?</span>
          <button className="text-[#28a745] text-xl font-medium hover:underline">
            Join As Client
          </button>
        </div>
      </header>

      {/* Progress Bar - Full Width (Complete) */}
      <div className="w-full h-0.5 bg-[#44b0ff]" />

      {/* Resume PDF indicator */}
      <div className="px-8 py-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#161616]" />
          <span className="text-[20px] text-[#161616]">
            {resume ? resume.name : 'resume.pdf'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex px-8 py-8">
        <div className="max-w-7xl w-full flex justify-between">
          
          {/* Left Column - Form */}
          <div className="w-[650px] space-y-6">
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-4">
              <span className="text-[18px] text-[#6f6f6f]">Step</span>
              
              {/* Circular Progress - Complete */}
              <div className="relative w-[91px] h-[92px]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 91 92">
                  {/* Complete circle */}
                  <circle
                    cx="45.5"
                    cy="46"
                    r="40"
                    fill="none"
                    stroke="#161616"
                    strokeWidth="7"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[20px] text-[#6f6f6f]">{currentStep}/{totalSteps}</span>
                </div>
              </div>
            </div>

            {/* Main Question */}
            <div className="space-y-6">
              <h1 className="text-[32px] font-semibold text-[#161616] leading-[40px] tracking-[-0.4px]">
                Almost Done! Add your Resume
              </h1>

              {/* Upload sections */}
              <div className="space-y-5">
                
                {/* Resume Upload */}
                <Card className="w-[495px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl cursor-pointer hover:border-[#1da1f2] transition-colors" onClick={handleResumeClick}>
                  <CardContent className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="text-[14px] font-medium text-[#8d8d8d] tracking-[1px] uppercase">
                        Add Your Resume
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <FileText className="w-5 h-5 text-[#525252]" />
                        <span className="text-[20px] text-neutral-600 underline">
                          {resume ? resume.name : 'Myresume.pdf'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* LinkedIn Profile */}
                <Card className="w-[495px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl">
                  <CardContent className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                        Add LinkedIn Profile
                      </div>
                      
                      <Input
                        value={linkedinProfile}
                        onChange={(e) => setLinkedinProfile(e.target.value)}
                        placeholder="Add your profile Link Here"
                        className="border-none p-0 h-auto text-[20px] text-[#6f6f6f] placeholder:text-[#6f6f6f] focus:ring-0 focus:border-none shadow-none bg-transparent"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Hidden file input */}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>

              {/* Upload Status */}
              {uploadError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {uploadError}
                  </AlertDescription>
                </Alert>
              )}

              {uploadSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Profile created successfully! Redirecting to workspace...
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-[25px] pt-8">
              <Button
                onClick={onBack}
                disabled={isUploading}
                variant="outline"
                className="w-[220px] h-16 rounded-[30px] border border-[#041d37] text-[#041d37] text-[18px] font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </Button>
              
              <Button
                onClick={handleComplete}
                disabled={isUploading || uploadSuccess}
                className="w-[362px] h-16 rounded-[30px] text-[18px] font-medium shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] bg-[#161616] text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : uploadSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Success!
                  </>
                ) : (
                  "Yay! Let's Go To Workspace"
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Final Profile Preview with Uploaded Photo */}
          <div className="w-[495px]">
            <Card className="bg-white rounded-xl shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] p-10">
              <CardContent className="p-0 space-y-8">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-10">
                  
                  {/* Avatar with uploaded photo */}
                  <div className="w-40 h-40 bg-[#f4f4f4] rounded-full flex items-center justify-center overflow-hidden">
                    {data.profile?.profilePhoto ? (
                      <img
                        src={URL.createObjectURL(data.profile.profilePhoto)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Default placeholder image (from the design)
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center space-y-6">
                    <h2 className="text-[42px] font-medium text-[#003366] leading-[50px] tracking-[-0.8px]">
                      {userName}
                    </h2>
                    
                    {/* Status */}
                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex items-center">
                        <div className="w-[25.778px] h-4 bg-[#32cd32] rounded-[10.483px] relative">
                          <div className="w-3 h-3 bg-white rounded-[10.483px] absolute right-0 top-0.5" />
                        </div>
                      </div>
                      <span className="text-[16px] font-medium text-[#161616] tracking-[-0.1px]">
                        Available for work
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Sections */}
                <div className="space-y-5">
                  
                  {/* Skills Section */}
                  <div className="space-y-5">
                    <div className="h-[0.8px] bg-[#e0e0e0] w-full" />
                    <div className="text-[14px] font-medium text-[#8d8d8d] tracking-[1px] uppercase">
                      Skills
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="h-8 px-[26px] py-2 border-[0.8px] border-dashed border-[#a8a8a8] rounded-[33px] text-[14px] text-[#161616] bg-transparent"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      {skills.length > 3 && (
                        <div className="flex flex-wrap gap-3">
                          {skills.slice(3, 5).map((skill, index) => (
                            <Badge
                              key={index + 3}
                              variant="outline"
                              className="h-8 px-[26px] py-2 border-[0.8px] border-dashed border-[#a8a8a8] rounded-[33px] text-[14px] text-[#161616] bg-transparent"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="space-y-5">
                    <div className="h-[0.8px] bg-[#e0e0e0] w-full" />
                    <div className="text-[14px] font-medium text-[#8d8d8d] tracking-[1px] uppercase">
                      Location
                    </div>
                    <div className="text-[20px] text-[#161616] leading-[28px]">
                      {location}
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div className="space-y-6">
                    <div className="h-[0.8px] bg-[#e0e0e0] w-full" />
                    <div className="space-y-4">
                      <div className="text-[14px] font-medium text-[#8d8d8d] tracking-[1px] uppercase">
                        Resume
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-[15.556px] h-5 text-[#a8a8a8]" />
                        <span className="text-[20px] text-[#161616] leading-[28px]">
                          {resume ? resume.name : 'resume.pdf'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep5;