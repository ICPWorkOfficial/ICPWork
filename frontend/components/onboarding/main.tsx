import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';



interface OnboardingStartingScreenProps {
  onGetStarted?: () => void;
}

const OnboardingStartingScreen: React.FC<OnboardingStartingScreenProps> = ({ 
  onGetStarted 
}) => {
  const steps = [
    {
      id: 1,
      icon: (
        <Image
          src="/icons/step1.svg"
          alt="Step 1"
          width={48}
          height={48}
          className="rounded-lg object-cover"
        />
      ),
      title: "Set Up Your Professional Profile",
      description:
        "Create your identity on Organaise by setting up a detailed profile. Highlight your expertise, define your niche, and let your experience speak for itself. A strong profile is the first step to standing out in a competitive marketplace.",
    },
    {
      id: 2,
      icon: (
        <Image
          src="/icons/step2.svg"
          alt="Step 2"
          width={48}
          height={48}
          className="rounded-lg object-cover"
        />
      ),
      title: "Enhance Your Portfolio & Expand Your Skillset",
      description:
        "Showcase your best work and keep learning. Update your portfolio with your latest projects and achievements. With Organaise, you also gain access to exclusive resources for skill enhancement to stay ahead of the curve.",
    },
    {
      id: 3,
      icon: (
        <Image
          src="/icons/step3.svg"
          alt="Step 3"
          width={48}
          height={48}
          className="rounded-lg object-cover"
        />
      ),
      title: "Connect with Clients & Start Earning",
      description:
        "Dive into a world of opportunities. Browse projects that match your skillset, connect with premier clients, and start earning. With Organaise, every project is a new horizon.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      {/* Header */}
      <header className="w-full h-[84px] bg-white border-b border-[#e0e0e0] flex items-center justify-between px-8">
        <div className="flex items-center">
          {/* Logo */}
            <img
            src="/logo.svg"
            alt="ICPWork Logo"
            className="h-8 w-auto"
            />
        </div>
        
        {/* Right side navigation */}
        <div className="flex items-center space-x-2">
          <span className="text-[#101010] text-xl">Want to Hire ?</span>
          <button className="text-[#28a745] text-xl font-medium hover:underline">
            Join As Client
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-[32px] font-semibold text-[#161616] leading-[40px] tracking-[-0.4px] max-w-[495px]">
                Embark on Your Freelancing Journey in Just 3 Simple Steps
              </h1>
              <p className="text-[20px] text-[#393939] leading-[28px] max-w-[544px]">
                Unlock the full potential of your freelance career with Organaise. Begin a rewarding journey where your skills are valued and your professional growth is inevitable. Start now and pave the path to your success.
              </p>
            </div>
            <Link href="/onboarding/step1" className="no-underline">
              <Button 
                className="bg-[#161616] text-white px-8 py-4 rounded-[30px] text-[18px] font-medium h-auto shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] hover:bg-[#2a2a2a] transition-colors"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Right Column - Steps */}
          <div className="space-y-5 max-w-[495px]">
            {steps.map((step, index) => (
              <div key={step.id}>
                <div className="flex items-start space-x-4">
                  {/* Step Icon */}
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-1">
                    <h3 className="text-[20px] font-medium text-[#161616] leading-[28px]">
                      {step.id}. {step.title}
                    </h3>
                    <p className="text-[16px] text-[#393939] leading-[24px] max-w-[496px]">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Separator line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="h-px bg-[#e0e0e0] w-full mt-5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStartingScreen;