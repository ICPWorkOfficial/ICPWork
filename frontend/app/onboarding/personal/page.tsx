'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, FileText, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface AddressFormData {
  country: string
  state: string
  city: string
  zipCode: string
  streetAddress: string
}

interface UserProfile {
  name: string
  avatar?: string
  skills: string[]
  isAvailable: boolean
  isPublic: boolean
}

const FreelancerOnboardingStep3: React.FC = () => {
  const [formData, setFormData] = useState<AddressFormData>({
    country: 'USA',
    state: 'USA',
    city: 'USA',
    zipCode: '121341',
    streetAddress: ''
  })

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Cyrus Roshan',
    skills: ['Prototyping', 'Development', 'Prototyping', 'Wireframing', 'Prototyping'],
    isAvailable: true,
    isPublic: false
  })

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    console.log('Form submitted:', formData)
    // Handle form submission logic
  }

  const handleBack = () => {
    console.log('Going back')
    // Handle navigation back
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-21 flex items-center justify-between px-8">
        <div className="flex items-center">
          {/* ICPWork Logo - replace with your actual logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-yellow-500 to-purple-600 rounded"></div>
            <span className="text-xl font-semibold text-gray-900">ICPWork</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-lg">
          <span className="text-gray-900">Want to Hire ?</span>
          <span className="text-green-600 font-medium">Join As Client</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-0.5">
        <div className="bg-blue-500 h-0.5 w-3/5"></div>
      </div>

      <div className="flex max-w-7xl mx-auto p-8 gap-8">
        {/* Left Side - Form */}
        <div className="flex-1 max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-500 text-lg">Step</span>
            <div className="relative">
              <div className="w-23 h-23 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <svg className="w-20 h-20" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="42" fill="none" stroke="#f5f5f5" strokeWidth="8"/>
                  <circle 
                    cx="46" 
                    cy="46" 
                    r="42" 
                    fill="none" 
                    stroke="#161616" 
                    strokeWidth="8"
                    strokeDasharray="263"
                    strokeDashoffset="105"
                    transform="rotate(-90 46 46)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl font-medium">
                  3/5
                </span>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">
            Your Address Details
          </h1>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-gray-900 font-medium">Private</span>
            <Switch 
              checked={profile.isPublic}
              onCheckedChange={(checked) => setProfile(prev => ({ ...prev, isPublic: checked }))}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-gray-900 font-medium">Public</span>
          </div>

          {/* Address Form */}
          <div className="space-y-5">
            {/* Country and State Row */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="relative">
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="h-26 rounded-xl border-gray-400 border-[0.6px]">
                      <div className="flex flex-col items-start text-left">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide font-light">
                          Select Country
                        </Label>
                        <SelectValue className="text-xl text-gray-900 font-normal" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="h-26 rounded-xl border-gray-400 border-[0.6px]">
                      <div className="flex flex-col items-start text-left">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide font-light">
                          State
                        </Label>
                        <SelectValue className="text-xl text-gray-900 font-normal" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* City and Zip Code Row */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="relative">
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger className="h-26 rounded-xl border-gray-400 border-[0.6px]">
                      <div className="flex flex-col items-start text-left">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide font-light">
                          City
                        </Label>
                        <SelectValue className="text-xl text-gray-900 font-normal" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">Los Angeles</SelectItem>
                      <SelectItem value="SF">San Francisco</SelectItem>
                      <SelectItem value="SD">San Diego</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative h-26 rounded-xl border-gray-400 border-[0.6px] p-6">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-light">
                    Zip Postal Code
                  </Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="border-0 p-0 text-xl h-7 focus-visible:ring-0 shadow-none"
                    placeholder="121341"
                  />
                </div>
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <div className="relative h-26 rounded-xl border-gray-400 border-[0.6px] p-6">
                <Label className="text-xs text-gray-500 uppercase tracking-wide font-light">
                  Street Address
                </Label>
                <Input
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className="border-0 p-0 text-xl h-7 focus-visible:ring-0 shadow-none text-gray-400"
                  placeholder="Enter Address Line 1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-16 w-55 rounded-full border-2 border-[#041d37] text-[#041d37] text-lg font-medium hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="h-16 w-55 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-lg font-medium shadow-lg"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Right Side - Profile Preview */}
        <div className="w-125 bg-white rounded-xl shadow-lg p-8">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-6 mb-8">
            <Avatar className="w-40 h-40">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-gray-200 text-gray-400 text-4xl">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-4">
              <h2 className="text-4xl font-medium text-[#003366] tracking-tight">
                {profile.name}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-green-500 rounded-full relative">
                  <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-900 font-medium">Available for work</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-5">
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.skills.slice(0, 3).map((skill, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="px-6 py-2 rounded-full border-dashed border-gray-400 text-gray-900 text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {profile.skills.slice(3).map((skill, index) => (
                  <Badge 
                    key={index + 3}
                    variant="outline" 
                    className="px-6 py-2 rounded-full border-dashed border-gray-400 text-gray-900 text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                Location
              </h3>
              <MapPin className="w-5 h-6 text-gray-400" />
            </div>

            {/* Resume Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                Resume
              </h3>
              <FileText className="w-4 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreelancerOnboardingStep3