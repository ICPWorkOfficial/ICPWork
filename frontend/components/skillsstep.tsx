'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, MapPin, FileText, User } from 'lucide-react'
import Link from 'next/link'

// ✅ Types
export interface SkillsStepProps {
  onBack?: () => void
  onNext?: (skills: string[]) => void
  userName?: string
  initialSkills?: string[]
}

// ✅ Design tokens (can also move into a shared theme file)
const designTokens = {
  colors: {
    primary: '#28A745',
    secondary: '#1DA1F2',
    purple: '#775DA8',
    navy: '#041D37',
    dark: '#161616',
    text: {
      primary: '#161616',
      secondary: '#393939',
      muted: '#8D8D8D',
      strong: '#6F6F6F'
    },
    background: {
      primary: '#FCFCFC',
      white: '#FFFFFF',
      selected: '#E0E0E0',
      selectedHover: '#C6C6C6',
      gray: '#F4F4F4'
    },
    border: {
      default: '#8D8D8D',
      selected: '#E0E0E0',
      dashed: '#A8A8A8',
      strong: '#6F6F6F'
    }
  },
  typography: {
    heading: {
      medium: 'text-2xl font-semibold',
    },
    body: {
      small: 'text-sm',
      medium: 'text-base font-medium'
    }
  }
}

// ✅ Logo + Header
const ICPWorkLogo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div
      className="w-8 h-8 rounded-lg relative"
      style={{
        background: `linear-gradient(135deg, #F05A24 21%, #FAAF3B 68%)`
      }}
    >
      <div
        className="w-full h-full rounded-lg"
        style={{
          background: `linear-gradient(135deg, #EC1E79 22%, #522784 89%)`,
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
        }}
      />
    </div>
    <span className="text-xl font-bold" style={{ color: designTokens.colors.dark }}>
      ICPWork
    </span>
  </div>
)

const Header: React.FC = () => (
  <header className="border-b px-4 py-6 md:px-6 lg:px-8" style={{ backgroundColor: designTokens.colors.background.white }}>
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <ICPWorkLogo />
      <div className="hidden md:flex items-center space-x-6">
        <span style={{ color: designTokens.colors.text.muted }}>Want to Hire ?</span>
        <Badge variant="outline" className="border-emerald-600 hover:bg-emerald-50" style={{ color: designTokens.colors.primary }}>
          Join As Client
        </Badge>
      </div>
    </div>
  </header>
)

// ✅ Progress Circle
const ProgressCircle: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = (current / total) * 100
  const circumference = 2 * Math.PI * 40
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative">
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke={designTokens.colors.background.selected} strokeWidth="4" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={designTokens.colors.dark}
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', strokeLinecap: 'round' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium" style={{ color: designTokens.colors.text.strong }}>
          {current}/{total}
        </span>
      </div>
    </div>
  )
}

// ✅ Skill Tag
const SkillTag: React.FC<{ skill: string; onRemove: () => void }> = ({ skill, onRemove }) => (
  <div
    className="flex items-center gap-2 px-4 py-1 rounded-full border-dashed"
    style={{ borderColor: designTokens.colors.border.dashed, borderWidth: '1px' }}
  >
    <span className={designTokens.typography.body.small} style={{ color: designTokens.colors.dark }}>
      {skill}
    </span>
    <button onClick={onRemove} className="text-gray-500 hover:text-gray-700 transition-colors">
      <X size={12} />
    </button>
  </div>
)

// ✅ Profile Preview Card
const ProfilePreview: React.FC<{ userName: string; skills: string[] }> = ({ userName, skills }) => (
  <Card className="border-0 rounded-xl sticky top-8 shadow-md">
    <CardContent className="p-6 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-100">
          <User size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: designTokens.colors.navy }}>{userName}</h2>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-sm text-gray-700">Available for work</span>
        </div>
      </div>

      <div>
        <span className="uppercase text-xs tracking-wide text-gray-500">Skills</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.length > 0 ? skills.slice(0, 3).map((skill, i) => (
            <div key={i} className="px-3 py-1 rounded-full border border-dashed text-sm text-gray-700">
              {skill}
            </div>
          )) : (
            <div className="px-3 py-1 rounded-full border border-dashed text-sm text-gray-400">Skill Name</div>
          )}
        </div>
      </div>

      <div>
        <span className="uppercase text-xs tracking-wide text-gray-500">Location</span>
        <MapPin size={20} className="text-gray-400 mt-2" />
      </div>

      <div>
        <span className="uppercase text-xs tracking-wide text-gray-500">Resume</span>
        <FileText size={20} className="text-gray-400 mt-2" />
      </div>
    </CardContent>
  </Card>
)

// ✅ Main Component
const SkillsStep: React.FC<SkillsStepProps> = ({
  onBack,
  onNext,
  userName = 'Your Name',
  initialSkills = []
}) => {
  const [skills, setSkills] = useState<string[]>(initialSkills)
  const [inputValue, setInputValue] = useState('')

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const newSkill = inputValue.trim().toUpperCase()
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill])
      }
      setInputValue('')
    }
  }

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    onNext?.(skills)
  }

  return (
    <div style={{ backgroundColor: designTokens.colors.background.primary }}>
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-base font-medium text-gray-600">Step</span>
              <ProgressCircle current={2} total={5} />
            </div>

            <div className="space-y-6">
              <h1 className="text-2xl font-semibold" style={{ color: designTokens.colors.dark }}>
                What are your skills?
              </h1>

              <Card className="rounded-xl border border-gray-300">
                <CardContent className="p-6 space-y-4">
                  <span className="uppercase text-xs tracking-wide text-gray-500">Skills</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {skills.map((skill, index) => (
                      <SkillTag key={index} skill={skill} onRemove={() => handleRemoveSkill(index)} />
                    ))}

                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Type a skill and press Enter"
                      className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{ color: designTokens.colors.dark }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="w-32 rounded-full" onClick={onBack}>
                Back
              </Button>
              <Link href='/profile'>
                <Button
                    className="w-32 rounded-full"
                    style={{ backgroundColor: designTokens.colors.dark, color: designTokens.colors.background.white }}
                    onClick={handleNext}
                >
                    Next
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Section: Profile */}
          <div className="lg:col-span-1">
            <ProfilePreview userName={userName} skills={skills} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SkillsStep
