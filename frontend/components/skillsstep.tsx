'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

// ✅ Types
export interface SkillsStepProps {
  onBack?: () => void
  onNext?: (skills: string[]) => void
  initialSkills?: string[]
}

// ✅ Design tokens (can also move into a shared theme file)
const designTokens = {
  colors: {
    primary: '#28A745',
    dark: '#161616',
    background: { white: '#FFFFFF' },
    border: { dashed: '#A8A8A8' },
  },
  typography: {
    body: {
      small: 'text-sm',
    },
  },
}

// ✅ Subcomponent: SkillTag
const SkillTag: React.FC<{ skill: string; onRemove: () => void }> = ({ skill, onRemove }) => (
  <div
    className="flex items-center gap-2 px-4 py-1 rounded-full border-dashed"
    style={{ borderColor: designTokens.colors.border.dashed, borderWidth: '1px' }}
  >
    <span className={designTokens.typography.body.small} style={{ color: designTokens.colors.dark }}>
      {skill}
    </span>
    <button
      onClick={onRemove}
      className="text-gray-500 hover:text-gray-700 transition-colors"
    >
      <X size={12} />
    </button>
  </div>
)

// ✅ Main Component: SkillsStep
const SkillsStep: React.FC<SkillsStepProps> = ({
  onBack,
  onNext,
  initialSkills = [],
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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: designTokens.colors.dark }}>
        What are your skills?
      </h2>

      <Card className="rounded-xl border border-gray-300">
        <CardContent className="p-6 space-y-4">
          <span className="uppercase text-xs tracking-wide text-gray-500">Skills</span>
          <div className="flex flex-wrap items-center gap-3">
            {skills.map((skill, index) => (
              <SkillTag
                key={index}
                skill={skill}
                onRemove={() => handleRemoveSkill(index)}
              />
            ))}

            {/* Input Field */}
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

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="w-32 rounded-full"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="w-32 rounded-full"
          style={{ backgroundColor: designTokens.colors.dark, color: designTokens.colors.background.white }}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default SkillsStep