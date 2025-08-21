"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

const imgGroup = "http://localhost:3845/assets/8c5c7ba178e12ae235670d36614d947e17b56a28.svg";
const imgGroup1 = "http://localhost:3845/assets/3bd7619d707a349fcdbb464c90fa37776627de8c.svg";
const imgGroup2 = "http://localhost:3845/assets/12642661b3ecc31de108f93f78c20846dc996ff0.svg";

interface VerifyCodeProps {
  email?: string;
  onVerifyCode?: (code: string) => void;
  onResendCode?: () => void;
}

export default function VerifyCode({ 
  email = "organansie@mail.com",
  onVerifyCode,
  onResendCode 
}: VerifyCodeProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(105); // 01:45 in seconds
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onVerifyCode?.(fullCode);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setCode(Array(6).fill(""));
    setTimeLeft(105); // Reset timer
    
    try {
      await onResendCode?.();
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = code.every(digit => digit !== "");
  const canResend = timeLeft === 0;

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative">
      {/* Header */}
      <header className="bg-white border-b border-[#e0e0e0] h-[84px] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-[140px] h-[40px]">
            <Image
              src={imgGroup}
              alt="ICPWork Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xl">
          <span className="text-[#101010]">Want to Hire ?</span>
          <Link 
            href="/join-as-client" 
            className="text-[#28a745] hover:underline"
          >
            Join As Client
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] font-semibold text-[#212121] tracking-[-0.4px] leading-[40px] mb-2">
            Verify Code
          </h1>
          <p className="text-xl text-[#393939] leading-[28px]">
            A 6-digit OTP <span className="lowercase">sent to</span>{' '}
            <span className="lowercase text-[#393939]">{email}</span>
          </p>
        </div>

        {/* OTP Input Section */}
        <div className="flex flex-col items-center gap-16 mb-8">
          {/* OTP Inputs */}
          <div className="flex gap-[25px]">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-[84px] h-[84px] text-center text-[42px] font-normal tracking-[-0.8px] rounded-xl border-[0.6px] ${
                  digit 
                    ? 'border-[#161616] text-neutral-800' 
                    : 'border-[#7d7d7d] text-neutral-400'
                } focus:border-[#161616] focus:ring-0`}
                placeholder=""
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyCode}
            disabled={!isCodeComplete}
            className="w-[360px] h-[46px] bg-[#161616] hover:bg-[#161616]/90 text-white font-medium text-lg rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] disabled:opacity-50"
          >
            Verify Code
          </Button>
        </div>

        {/* Timer and Resend Section */}
        <div className="text-center">
          <div className="text-xl font-medium text-[#ff4e4e] mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xl">
            <span className="text-[#101010]">Didn&apos;t Received ?</span>{' '}
            <button
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`text-[#28a745] hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${
                canResend ? 'hover:underline' : ''
              }`}
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </main>

      {/* Decorative Images */}
      <div className="absolute right-[112px] top-[28px] w-[140px] h-[700px] pointer-events-none">
        <div className="relative w-full h-full">
          <Image
            src={imgGroup1}
            alt="Decorative graphic 1"
            fill
            className="object-contain"
          />
          <Image
            src={imgGroup2}
            alt="Decorative graphic 2"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}