import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, MapPin, FileText, User } from 'lucide-react';

interface AddressData {
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
  isPublic: boolean;
}

interface OnboardingStep3Props {
  data: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
    skills?: string[];
    address?: AddressData;
  };
  onNext: (stepData: { address: AddressData }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ 
  data,
  onNext,
  onBack,
  currentStep,
  totalSteps
}) => {
  const [addressData, setAddressData] = useState<AddressData>({
    country: data.address?.country || '',
    state: data.address?.state || '',
    city: data.address?.city || '',
    zipCode: data.address?.zipCode || '',
    streetAddress: data.address?.streetAddress || '',
    isPublic: data.address?.isPublic ?? true,
  });

  // Get user name and skills for preview
  const userName = data.personalInfo?.firstName && data.personalInfo?.lastName 
    ? `${data.personalInfo.firstName} ${data.personalInfo.lastName}`
    : 'Cyrus Roshan';
    
  const skills = data.skills || ['Prototyping', 'Development', 'Prototyping', 'Wireframing', 'Prototyping'];

  const updateField = (field: keyof AddressData, value: string | boolean) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isValid) {
      onNext({ address: addressData });
    }
  };

  const isValid = addressData.country && addressData.state && addressData.city && addressData.zipCode && addressData.streetAddress;

  // Mock data for dropdowns
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France'];
  const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];
  const cities = ['Los Angeles', 'New York City', 'Chicago', 'Houston', 'Phoenix'];

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

      {/* Progress Bar */}
      <div className="w-full h-0.5 bg-[#f6f6f6]">
        <div 
          className="h-full bg-[#44b0ff] transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex px-8 py-12">
        <div className="max-w-7xl w-full flex justify-between">
          
          {/* Left Column - Form */}
          <div className="w-[650px] space-y-6">
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-4">
              <span className="text-[18px] text-[#6f6f6f]">Step</span>
              
              {/* Circular Progress */}
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
                  {/* Progress circle */}
                  <circle
                    cx="45.5"
                    cy="46"
                    r="40"
                    fill="none"
                    stroke="#161616"
                    strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (currentStep / totalSteps))}`}
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
                Your Address Details
              </h1>

              {/* Privacy Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-[16px] font-medium text-[#161616] tracking-[-0.1px]">
                  Private
                </span>
                <Switch
                  checked={addressData.isPublic}
                  onCheckedChange={(checked) => updateField('isPublic', checked)}
                  className="data-[state=checked]:bg-[#32cd32]"
                />
                <span className="text-[16px] font-medium text-[#161616] tracking-[-0.1px]">
                  Public
                </span>
              </div>

              {/* Address Form */}
              <div className="space-y-5">
                
                {/* First Row - Country and State */}
                <div className="flex space-x-5">
                  {/* Country */}
                  <Card className="w-[289px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl">
                    <CardContent className="p-6 h-full">
                      <div className="space-y-4">
                        <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                          Select Country
                        </div>
                        
                        <Select value={addressData.country} onValueChange={(value) => updateField('country', value)}>
                          <SelectTrigger className="border-none p-0 h-auto text-[20px] text-[#161616] shadow-none bg-transparent">
                            <SelectValue placeholder="USA" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* State */}
                  <Card className="w-[289px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl">
                    <CardContent className="p-6 h-full">
                      <div className="space-y-4">
                        <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                          State
                        </div>
                        
                        <Select value={addressData.state} onValueChange={(value) => updateField('state', value)}>
                          <SelectTrigger className="border-none p-0 h-auto text-[20px] text-[#161616] shadow-none bg-transparent">
                            <SelectValue placeholder="USA" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Row - City and Zip Code */}
                <div className="flex space-x-5">
                  {/* City */}
                  <Card className="w-[289px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl">
                    <CardContent className="p-6 h-full">
                      <div className="space-y-4">
                        <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                          City
                        </div>
                        
                        <Select value={addressData.city} onValueChange={(value) => updateField('city', value)}>
                          <SelectTrigger className="border-none p-0 h-auto text-[20px] text-[#161616] shadow-none bg-transparent">
                            <SelectValue placeholder="USA" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Zip Code */}
                  <Card className="w-[289px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl">
                    <CardContent className="p-6 h-full">
                      <div className="space-y-4">
                        <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                          Zip Postal Code
                        </div>
                        
                        <Input
                          value={addressData.zipCode}
                          onChange={(e) => updateField('zipCode', e.target.value)}
                          placeholder="121341"
                          className="border-none p-0 h-auto text-[20px] text-[#161616] placeholder:text-[#161616] focus:ring-0 focus:border-none shadow-none bg-transparent"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Street Address */}
                <Card className="w-[599px] h-[104px] border-[0.6px] border-[#8d8d8d] rounded-xl">
                  <CardContent className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="text-[14px] font-light text-[#6f6f6f] tracking-[1px] uppercase">
                        Street Address
                      </div>
                      
                      <Input
                        value={addressData.streetAddress}
                        onChange={(e) => updateField('streetAddress', e.target.value)}
                        placeholder="Enter Address Line 1"
                        className="border-none p-0 h-auto text-[20px] text-[#8d8d8d] placeholder:text-[#8d8d8d] focus:ring-0 focus:border-none shadow-none bg-transparent"
                      />
                    </div>
                  </CardContent>
                </Card>
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
                onClick={handleNext}
                disabled={!isValid}
                className={`w-[220px] h-16 rounded-[30px] text-[18px] font-medium shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] transition-colors ${
                  isValid
                    ? 'bg-[#161616] text-white hover:bg-[#2a2a2a]'
                    : 'bg-[#e0e0e0] text-[#8d8d8d] cursor-not-allowed'
                }`}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Right Column - Profile Preview */}
          <div className="w-[495px]">
            <Card className="bg-white rounded-xl shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] p-10">
              <CardContent className="p-0 space-y-8">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-10">
                  
                  {/* Avatar */}
                  <div className="w-40 h-40 bg-[#f4f4f4] rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-[#c6c6c6]" />
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
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-6 text-[#a8a8a8]" />
                      {addressData.city && addressData.state && (
                        <span className="text-[16px] text-[#161616]">
                          {addressData.city}, {addressData.state}
                        </span>
                      )}
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

export default OnboardingStep3;