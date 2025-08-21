'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileText, Upload } from 'lucide-react'
import Image from 'next/image'

interface ResumeFormData {
  resumeFile: File | null
  linkedinProfile: string
}

interface UserProfile {
  name: string
  avatar?: string
  skills: string[]
  location: string
  resumeFileName?: string
  isAvailable: boolean
}

const FreelancerOnboardingStep5: React.FC = () => {
  const [formData, setFormData] = useState<ResumeFormData>({
    resumeFile: null,
    linkedinProfile: ''
  })

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Cyrus Roshan',
    avatar: '/api/placeholder/160/160', // Replace with actual avatar URL
    skills: ['Prototyping', 'Development', 'Prototyping', 'Wireframing', 'Prototyping'],
    location: 'California, CA, USA',
    resumeFileName: 'resume.pdf',
    isAvailable: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        resumeFile: file
      }))
      setProfile(prev => ({
        ...prev,
        resumeFileName: file.name
      }))
    }
  }

  const handleLinkedInChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      linkedinProfile: value
    }))
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFinish = () => {
    console.log('Onboarding completed:', formData)
    // Handle final submission logic
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
          {/* ICPWork Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-yellow-500 to-purple-600 rounded"></div>
            <span className="text-xl font-semibold text-gray-900">ICPWork</span>
            <span className="text-sm text-gray-500 ml-1">®</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-lg">
          <span className="text-gray-900">Want to Hire ?</span>
          <span className="text-green-600 font-medium">Join As Client</span>
        </div>
      </header>

      {/* Full Progress Bar */}
      <div className="w-full bg-blue-500 h-0.5"></div>

      {/* Resume filename display */}
      <div className="absolute left-19 top-57 text-gray-900 text-xl">
        resume.pdf
      </div>

      <div className="flex max-w-7xl mx-auto p-8 gap-8">
        {/* Left Side - Form */}
        <div className="flex-1 max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-6 mt-16">
            <span className="text-gray-500 text-lg">Step</span>
            <div className="relative">
              <div className="w-23 h-23 rounded-full border-4 border-gray-200 flex items-center justify-center">
                {/* Complete circular progress for step 5/5 */}
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
                    strokeDashoffset="0"
                    transform="rotate(-90 46 46)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl font-medium">
                  5/5
                </span>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">
            Almost Done! Add your Resume
          </h1>

          {/* Resume Upload Section */}
          <div className="space-y-5 mb-16">
            {/* Resume Upload Field */}
            <div 
              className="relative h-26 rounded-xl border-gray-400 border-[0.6px] p-6 cursor-pointer hover:border-gray-500 transition-colors"
              onClick={triggerFileUpload}
            >
              <Label className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Add Your Resume
              </Label>
              <div className="flex items-center gap-4 mt-4">
                <FileText className="w-4 h-5 text-gray-400" />
                <span className="text-xl text-neutral-600 underline decoration-solid">
                  {formData.resumeFile?.name || 'Myresume.pdf'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* LinkedIn Profile Field */}
            <div className="relative h-26 rounded-xl border-gray-400 border-[0.6px] p-6">
              <Label className="text-sm font-light text-gray-500 uppercase tracking-wide">
                Add LinkedIn Profile
              </Label>
              <Input
                value={formData.linkedinProfile}
                onChange={(e) => handleLinkedInChange(e.target.value)}
                className="border-0 p-0 text-xl h-7 focus-visible:ring-0 shadow-none text-gray-500 mt-4"
                placeholder="Add your profile Link Here"
              />
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
              onClick={handleFinish}
              className="h-16 w-90 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-lg font-medium shadow-lg"
            >
              Yay! Let's Go To Workspace
            </Button>
          </div>
        </div>

        {/* Right Side - Profile Preview */}
        <div className="w-125 bg-white rounded-xl shadow-lg p-8">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-10 mb-8">
            <Avatar className="w-40 h-40">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-gray-200 text-gray-400 text-4xl">
                <Image 
                  src="/api/placeholder/160/160" 
                  alt="Profile"
                  width={160}
                  height={160}
                  className="rounded-full"
                />
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-6">
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
              <p className="text-xl text-gray-900">{profile.location}</p>
            </div>

            {/* Resume Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                Resume
              </h3>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-5 text-gray-400" />
                <span className="text-xl text-gray-900">{profile.resumeFileName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreelancerOnboardingStep5