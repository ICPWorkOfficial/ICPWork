"use client";

import SkillsStep from "@/components/skillsstep"

export default function OnboardingPage() {
  const handleNext = (skills: string[]) => {
    console.log("User skills:", skills)
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <SkillsStep
        onBack={() => console.log("Back clicked")}
        onNext={handleNext}
        initialSkills={["React", "TypeScript"]}
      />
    </div>
  )
}
