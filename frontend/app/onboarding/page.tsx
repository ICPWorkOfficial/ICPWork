'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Briefcase, Users } from 'lucide-react'

// Design system types
interface DesignTokens {
  colors: {
    primary: string
    secondary: string
    dark: string
    text: {
      primary: string
      secondary: string
      muted: string
    }
    background: {
      primary: string
      white: string
      selected: string
    }
    border: {
      default: string
      inked: string
    }
  }
  typography: {
    heading: {
      h1: string
      h5: string
      h6: string
    }
    body: string
    bodyLarge: string
  }
}

// Design tokens from Figma
const tokens: DesignTokens = {
  colors: {
    primary: '#28A745',
    secondary: '#775DA8',
    dark: '#161616',
    text: {
      primary: '#161616',
      secondary: '#393939',
      muted: '#CACACA'
    },
    background: {
      primary: '#FCFCFC',
      white: '#FFFFFF',
      selected: '#E0E0E0'
    },
    border: {
      default: '#E0E0E0',
      inked: '#161616'
    }
  },
  typography: {
    heading: {
      h1: 'font-mona text-[32px] leading-[40px] tracking-[-0.4px] font-semibold',
      h5: 'font-mona text-[20px] leading-[28px] font-normal',
      h6: 'font-mona text-[18px] leading-[28px] font-medium'
    },
    body: 'font-mona text-[16px] leading-[24px] font-normal',
    bodyLarge: 'font-mona text-[20px] leading-[28px] font-normal'
  }
}

// Step interface
interface Step {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}

// Header component
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

// Step component props interface
interface StepProps {
  step: Step
  isLast?: boolean
}

const StepCard: React.FC<StepProps> = ({ step, isLast = false }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center">
          <div className="text-emerald-600">
            {step.icon}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <h3 className={`${tokens.typography.heading.h5} text-gray-900 font-medium`}>
          {step.number}. {step.title}
        </h3>
        <p className={`${tokens.typography.body} text-gray-600 max-w-lg`}>
          {step.description}
        </p>
      </div>
    </div>

    {/* Divider */}
    {!isLast && (
      <div className="w-full h-px bg-gray-200 mt-4" />
    )}
  </div>
)

// Main component - simplified for client component usage
const FreelancerOnboarding: React.FC = () => {
  // If you need to access params or searchParams in a client component,
  // use useParams() and useSearchParams() hooks from 'next/navigation' instead
  const steps: Step[] = [
    {
      number: 1,
      title: "Set Up Your Professional Profile",
      description: "Create your identity on Organaise by setting up a detailed profile. Highlight your expertise, define your niche, and let your experience speak for itself. A strong profile is the first step to standing out in a competitive marketplace.",
      icon: <User size={24} />
    },
    {
      number: 2,
      title: "Enhance Your Portfolio & Expand Your Skillset",
      description: "Showcase your best work and keep learning. Update your portfolio with your latest projects and achievements. With Organaise, you also gain access to exclusive resources for skill enhancement to stay ahead of the curve.",
      icon: <Briefcase size={24} />
    },
    {
      number: 3,
      title: "Connect with Clients & Start Earning",
      description: "Dive into a world of opportunities. Browse projects that match your skillset, connect with premier clients, and start earning. With Organaise, every project is a new horizon.",
      icon: <Users size={24} />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 lg:space-y-12">
              <div className="space-y-6">
                <h1 className={`${tokens.typography.heading.h1} text-gray-900 max-w-lg`}>
                  Embark on Your Freelancing Journey in Just 3 Simple Steps
                </h1>
                <p className={`${tokens.typography.bodyLarge} text-gray-600 max-w-xl`}>
                  Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success.
                </p>
              </div>

              <Button 
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg"
              >
                Get Started
              </Button>
            </div>

            {/* Right Content - Steps */}
            <div className="space-y-6">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-6 lg:p-8 space-y-8">
                  {steps.map((step, index) => (
                    <StepCard 
                      key={step.number} 
                      step={step} 
                      isLast={index === steps.length - 1}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default FreelancerOnboarding