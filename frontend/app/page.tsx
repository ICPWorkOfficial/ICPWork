'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

// Type definitions
type UserType = 'client' | 'freelancer';
type SelectionState = UserType | null;

interface UserOption {
  id: UserType;
  title: string;
  description: string;
  buttonText: string;
}

// Configuration object with proper typing
const userOptions: UserOption[] = [
  {
    id: 'client',
    title: 'Client',
    description: 'I am a Client, want to hire someone.',
    buttonText: 'Continue as Client'
  },
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'I am a Freelancer, looking for some gigs and work.',
    buttonText: 'Apply As Freelancer'
  }
];

export default function FreelancerOnboarding() {
  const [selectedType, setSelectedType] = useState<SelectionState>(null);
  const router = useRouter();

  const handleCardSelect = (type: UserType): void => {
    setSelectedType(type);
    router.push(`/login?user=${type}`);
  };

  const getSelectedOption = (): UserOption | undefined => {
    return userOptions.find(option => option.id === selectedType);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="ICPWork logo"
            width={132}
            height={132}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-full px-6 shadow-sm hover:shadow-md transition-shadow"
        >
          Exit
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-16 max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-12 text-center">
          Join as a Client or Freelancer?
        </h1>

        {/* Selection Cards */}
        <div className="flex flex-col md:flex-row gap-5 mb-12 w-full max-w-4xl">
          {userOptions.map((option: UserOption) => (
            <Card 
              key={option.id}
              className={`flex-1 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedType === option.id 
                  ? 'border-gray-900 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleCardSelect(option.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-12 text-center h-48">
                <div className="mb-4">
                </div>
                <h2 className={`text-2xl text-gray-900 mb-2 ${
                  option.id === 'freelancer' ? 'font-semibold' : 'font-medium'
                }`}>
                  {option.title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-8">
          {/* Login Link */}
          <div className="text-center">
            <span className="text-xl text-gray-900">Already Have an Account? </span>
            <Link href='/login'>
            <button className="text-xl text-green-600 hover:text-green-700 font-medium hover:underline transition-colors">
              LogIn
            </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}