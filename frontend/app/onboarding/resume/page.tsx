'use client'

import React, { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowRight, Info } from 'lucide-react'
import { useRouter } from 'next/navigation' // Import useRouter for navigation

// Types based on existing design system
interface ProfileSetupProps {
  onResumeUpload: (file: File) => void
  onManualSetup: () => void
}

// Design tokens extracted from Figma
const designTokens = {
  colors: {
    primary: '#28A745',
    secondary: '#1DA1F2',
    purple: '#775DA8',
    dark: '#161616',
    text: {
      primary: '#161616',
      secondary: '#393939',
      muted: '#8D8D8D',
      neutral: '#6B7280'
    },
    background: {
      primary: '#FCFCFC',
      white: '#FFFFFF'
    },
    border: {
      default: '#8D8D8D',
      selected: '#E0E0E0'
    }
  },
  typography: {
    heading: {
      large: 'font-mona text-[42px] leading-[50px] tracking-[-0.8px] font-semibold',
      medium: 'font-mona text-[32px] leading-[40px] tracking-[-0.4px] font-semibold',
      small: 'font-mona text-[20px] leading-[28px] font-normal'
    },
    body: {
      large: 'font-mona text-[20px] leading-[28px] font-normal',
      small: 'font-mona text-[14px] leading-[20px] font-medium tracking-[1px] uppercase'
    }
  }
}

// Header Component (reused from previous)
const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200 px-4 py-6 md:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
        <span className="text-xl font-bold">ICPWork</span>
      </div>
      <div className="hidden md:flex items-center space-x-6">
        <span className="text-gray-600">Want to Hire ?</span>
        <Badge
          variant="outline"
          className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
        >
          Join As Client
        </Badge>
      </div>
    </div>
  </header>
)

// Option Card Component
interface OptionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}

const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  variant = 'primary',
  className = ''
}) => (
  <Card
    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-gray-300 hover:border-gray-400 ${className}`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="space-y-4">
        <span className={`${designTokens.typography.body.small} text-gray-500`}>
          {title}
        </span>
        <div className="flex items-center gap-4">
          <div className="text-gray-500">
            {icon}
          </div>
          <span
            className={`${designTokens.typography.heading.small} ${
              variant === 'secondary' ? 'text-blue-500' : 'text-gray-600'
            } underline underline-offset-4`}
          >
            {description}
          </span>
          {variant === 'secondary' && (
            <ArrowRight size={20} className="text-blue-500" />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Pro Tip Card Component
const ProTipCard: React.FC = () => (
  <Card className="bg-white shadow-lg border-0 rounded-lg">
    <CardContent className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Info size={16} className="text-white" />
        </div>
        <h3 className={`${designTokens.typography.heading.medium} text-gray-700 uppercase`}>
          PRO TIP:
        </h3>
      </div>
      <p className={`${designTokens.typography.body.large} text-gray-600`}>
        Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success.
      </p>
    </CardContent>
  </Card>
)

// This component now accepts props and is not a "Page" component.
const ProfileSetupComponent: FC<ProfileSetupProps> = ({
  onResumeUpload,
  onManualSetup
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onResumeUpload) {
      onResumeUpload(file)
    }
  }

  const handleResumeUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>)
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Left Content - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-12">

              {/* Header Section */}
              <div className="space-y-4 max-w-4xl">
                <h1 className={`${designTokens.typography.heading.large} text-gray-900`}>
                  How Would You Like to Tell About Yourself?
                </h1>
                <p className={`${designTokens.typography.body.large} text-gray-600`}>
                  Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success.
                </p>
              </div>

              {/* Options Section */}
              <div className="space-y-6 max-w-2xl">

                {/* Resume Upload Option */}
                <OptionCard
                  title="IMPORT FROM YOUR RESUME"
                  description="Click here to upload Your Resume"
                  icon={<FileText size={20} />}
                  onClick={handleResumeUploadClick}
                  variant="primary"
                />

                {/* Manual Setup Option */}
                <OptionCard
                  title="FILL OUT MANUALLY"
                  description="Click here"
                  icon={null}
                  onClick={onManualSetup}
                  variant="secondary"
                />

              </div>
            </div>

            {/* Right Content - Pro Tip */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ProTipCard />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2">
        <div className="w-2 h-16 bg-gray-300 rounded-full">
          <div className="w-full h-1/3 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

// Export the main page component
export default function ProfileSetupPage() {
  const router = useRouter()

  const handleResumeUpload = (file: File) => {
    console.log('Uploading file:', file.name)
    // Handle file upload logic here
  }

  const handleManualSetup = () => {
    console.log('Proceeding with manual setup')
    router.push('/onboarding/manual-profile')
  }

  return (
    <ProfileSetupComponent
      onResumeUpload={handleResumeUpload}
      onManualSetup={handleManualSetup}
    />
  )
}