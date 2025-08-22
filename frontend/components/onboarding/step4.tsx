import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, FileText, User, Upload } from 'lucide-react';

interface ProfileData {
  profilePhoto?: File;
}

interface OnboardingStep4Props {
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
    profile?: ProfileData;
  };
  onComplete: (stepData: { profile: ProfileData }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ 
  data,
  onComplete,
  onBack,
  currentStep,
  totalSteps
}) => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(data.profile?.profilePhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user data for preview
  const userName = data.personalInfo?.firstName && data.personalInfo?.lastName 
    ? `${data.personalInfo.firstName} ${data.personalInfo.lastName}`
    : 'Cyrus Roshan';
    
  const skills = data.skills || ['Prototyping', 'Development', 'Prototyping', 'Wireframing', 'Prototyping'];
  
  const location = data.address?.city && data.address?.state && data.address?.country
    ? `${data.address.city}, ${data.address.state}, ${data.address.country}`
    : 'California, CA, USA';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProfilePhoto(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleComplete = () => {
    onComplete({ profile: { profilePhoto: profilePhoto || undefined } });
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

      {/* Main Content */}
      <div className="flex-1 flex px-8 py-12">
        <div className="max-w-7xl w-full flex justify-between">
          
          {/* Left Column - Form */}
          <div className="w-[650px] space-y-6">
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-4">
              <span className="text-[18px] text-[#6f6f6f]">Step</span>
              
              {/* Circular Progress - Complete */}
              <div className="relative w-[91px] h-[92px]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 91 92">
                  {/* Background circle */}
                  <circle
                    cx="45.5"
                    cy="46"
                    r="40"
                    fill="none"
                    stroke="#f5f5f5"
                    strokeWidth="7"
                  />
                  {/* Progress circle - Complete */}
                  <circle
                    cx="45.5"
                    cy="46"
                    r="40"
                    fill="none"
                    stroke="#161616"
                    strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset="0"
                    className="transition-all duration-300"
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
                Add Your Profile Photo
              </h1>

              {/* Profile Photo Upload */}
              <div className="space-y-5">
                <Card className="w-[495px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl cursor-pointer hover:border-[#1da1f2] transition-colors" onClick={handleUploadClick}>
                  <CardContent className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                        Add Profile Photo
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Image className="w-6 h-6 text-[#717171]" />
                        <span className="text-[20px] text-neutral-600 underline">
                          {profilePhoto ? profilePhoto.name : 'My Profile.jpg'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-[25px] pt-12">
              <Button
                onClick={onBack}
                variant="outline"
                className="w-[220px] h-16 rounded-[30px] border border-[#041d37] text-[#041d37] text-[18px] font-medium bg-white hover:bg-gray-50"
              >
                Back
              </Button>
              
              <Button
                onClick={handleComplete}
                className="w-[220px] h-16 rounded-[30px] text-[18px] font-medium shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] bg-[#161616] text-white hover:bg-[#2a2a2a] transition-colors"
              >
                Complete Setup
              </Button>
            </div>
          </div>

          {/* Right Column - Final Profile Preview */}
          <div className="w-[495px]">
            <Card className="bg-white rounded-xl shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] p-10">
              <CardContent className="p-0 space-y-8">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-10">
                  
                  {/* Avatar */}
                  <div className="w-40 h-40 bg-[#f4f4f4] rounded-full flex items-center justify-center overflow-hidden">
                    {profilePhoto ? (
                      <img
                        src={URL.createObjectURL(profilePhoto)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-[#c6c6c6]" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center space-y-6">
                    <h2 className="text-[42px] font-medium text-[#041d37] leading-[50px] tracking-[-0.8px]">
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
                    <div className="space-y-5">
                      <div className="text-[14px] font-medium text-[#8d8d8d] tracking-[1px] uppercase">
                        Resume
                      </div>
                      <FileText className="w-[15.556px] h-5 text-[#a8a8a8]" />
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

export default OnboardingStep4;