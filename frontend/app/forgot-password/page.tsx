"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// Asset imports
const imgCheckCircle = "http://localhost:3845/assets/a9df1773c9fb7a66c433f313872161ed4de11231.svg";

type FlowStep = 'forgot-password' | 'verify-code' | 'reset-password' | 'success';

interface PasswordResetState {
  email: string;
  code: string[];
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  timeLeft: number;
  redirectCountdown: number;
  errors: {
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
  };
}

// Remove the props interface since this is a Page component
export default function PasswordResetFlow() {
  const router = useRouter(); // Use the useRouter hook for navigation
  const [currentStep, setCurrentStep] = useState<FlowStep>('forgot-password');
  const [state, setState] = useState<PasswordResetState>({
    email: '',
    code: Array(6).fill(''),
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    timeLeft: 105, // 01:45 in seconds
    redirectCountdown: 5, // 5 seconds redirect
    errors: {}
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect for verify code step
  useEffect(() => {
    if (currentStep !== 'verify-code' || state.timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, state.timeLeft]);

  // Redirect countdown effect for success step
  useEffect(() => {
    if (currentStep !== 'success') return;
    
    const timer = setInterval(() => {
      setState(prev => {
        const newCountdown = prev.redirectCountdown - 1;
        if (newCountdown <= 0) {
          // Use router.push to handle the redirect
          router.push('/login'); 
          return { ...prev, redirectCountdown: 0 };
        }
        return { ...prev, redirectCountdown: newCountdown };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, router]);

  const updateState = (updates: Partial<PasswordResetState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const clearErrors = () => {
    updateState({ errors: {} });
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Step 1: Forgot Password
  const handleSendCode = async () => {
    clearErrors();
    
    if (!state.email.trim()) {
      updateState({ errors: { email: "Email is required" } });
      return;
    }

    if (!validateEmail(state.email)) {
      updateState({ errors: { email: "Please enter a valid email address" } });
      return;
    }

    updateState({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateState({ 
        isLoading: false,
        timeLeft: 105 
      });
      setCurrentStep('verify-code');
    } catch (error) {
      updateState({ 
        isLoading: false,
        errors: { email: "Failed to send code. Please try again." }
      });
    }
  };

  // Step 2: Verify Code
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...state.code];
    newCode[index] = value;
    updateState({ code: newCode });

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !state.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    clearErrors();
    
    const fullCode = state.code.join('');
    if (fullCode.length !== 6) {
      updateState({ errors: { code: "Please enter the complete 6-digit code" } });
      return;
    }

    updateState({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateState({ isLoading: false });
      setCurrentStep('reset-password');
    } catch (error) {
      updateState({ 
        isLoading: false,
        errors: { code: "Invalid code. Please try again." }
      });
    }
  };

  const handleResendCode = async () => {
    updateState({ 
      isLoading: true,
      code: Array(6).fill(''),
      timeLeft: 105 
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateState({ isLoading: false });
    } catch (error) {
      updateState({ isLoading: false });
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    clearErrors();
    const errors: any = {};

    if (!validatePassword(state.newPassword)) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (state.newPassword !== state.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      updateState({ errors });
      return;
    }

    updateState({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateState({ 
        isLoading: false,
        redirectCountdown: 5 
      });
      setCurrentStep('success');
    } catch (error) {
      updateState({ 
        isLoading: false,
        errors: { password: "Failed to reset password. Please try again." }
      });
    }
  };

  const isCodeComplete = state.code.every(digit => digit !== "");
  const canResend = state.timeLeft === 0;

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#e0e0e0] h-[84px] px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <div className="relative w-[120px] sm:w-[140px] h-[32px] sm:h-[40px]">
            <Image
              src="/logo.svg"
              alt="ICPWork Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-lg lg:text-xl">
          <span className="text-[#101010]">Want to Hire ?</span>
          <Link 
            href="/join-as-client" 
            className="text-[#28a745] hover:underline"
          >
            Join As Client
          </Link>
        </div>
      </header>

      {/* Background decoration for success step */}
      {currentStep === 'success' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-400 to-orange-400 opacity-30 rounded-[20px] blur-sm transform rotate-1 scale-105"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative z-10">
        <div className="w-full max-w-2xl">
          
          {/* Step 1: Forgot Password */}
          {currentStep === 'forgot-password' && (
            <div className="space-y-8 lg:space-y-12">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-[#212121] tracking-[-0.4px] leading-tight">
                  Forgot Password
                </h1>
              </div>

              <div className="space-y-6 lg:space-y-8">
                <div className="relative max-w-md mx-auto">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <Mail className="w-6 h-6 text-[#161616]" />
                  </div>
                  <Input
                    type="email"
                    value={state.email}
                    onChange={(e) => updateState({ email: e.target.value })}
                    placeholder="Enter your email"
                    className={`h-14 sm:h-16 pl-16 pr-6 text-base sm:text-lg font-medium text-[#161616] border-[0.6px] rounded-xl ${
                      state.errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[#7d7d7d] focus:border-[#161616]'
                    } focus:ring-0 bg-white`}
                    disabled={state.isLoading}
                  />
                  {state.errors.email && (
                    <p className="text-red-500 text-sm mt-2 ml-2">{state.errors.email}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleSendCode}
                    disabled={state.isLoading || !state.email.trim()}
                    className="w-full max-w-[360px] h-12 sm:h-[46px] bg-[#161616] hover:bg-[#161616]/90 text-white font-medium text-base sm:text-lg rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] disabled:opacity-50"
                  >
                    {state.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      "Send Code"
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center text-[#7d7d7d] text-sm sm:text-lg font-medium max-w-md mx-auto">
                <p className="mb-1">
                  by Logging In, i agree with ICPWork{" "}
                  <Link href="/privacy-policy" className="text-[#7b59ff] underline hover:no-underline">
                    privacy policy
                  </Link>
                </p>
                <p>
                  and{" "}
                  <Link href="/terms-and-conditions" className="text-[#7b59ff] underline hover:no-underline">
                    terms and conditions
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {currentStep === 'verify-code' && (
            <div className="space-y-8 lg:space-y-12">
              <div className="text-center space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-[#212121] tracking-[-0.4px] leading-tight">
                  Verify Code & Change Password
                </h1>
                <p className="text-lg sm:text-xl text-[#393939] leading-relaxed">
                  A 6-digit OTP <span className="lowercase">sent to</span>{' '}
                  <span className="lowercase text-[#393939]">{state.email}</span>
                </p>
              </div>

              <div className="space-y-8 lg:space-y-16">
                <div className="space-y-6">
                  <div className="flex gap-3 sm:gap-4 lg:gap-[25px] justify-center flex-wrap">
                    {state.code.map((digit, index) => (
                      <div key={index} className="relative">
                        <Input
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeInput(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-[84px] lg:h-[84px] text-center text-2xl sm:text-3xl lg:text-[42px] font-normal tracking-[-0.8px] rounded-xl border-[0.6px] ${
                            digit 
                              ? 'border-[#161616] text-neutral-800' 
                              : 'border-[#7d7d7d] text-neutral-400'
                          } focus:border-[#161616] focus:ring-0`}
                          placeholder=""
                        />
                      </div>
                    ))}
                  </div>
                  {state.errors.code && (
                    <p className="text-red-500 text-sm text-center">{state.errors.code}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={!isCodeComplete || state.isLoading}
                    className="w-full max-w-[360px] h-12 sm:h-[46px] bg-[#161616] hover:bg-[#161616]/90 text-white font-medium text-base sm:text-lg rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] disabled:opacity-50"
                  >
                    {state.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="text-lg sm:text-xl font-medium text-[#ff4e4e]">
                  {formatTime(state.timeLeft)}
                </div>
                <div className="text-lg sm:text-xl">
                  <span className="text-[#101010]">Didn&apos;t Received ?</span>{' '}
                  <button
                    onClick={handleResendCode}
                    disabled={!canResend || state.isLoading}
                    className={`text-[#28a745] hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${
                      canResend ? 'hover:underline' : ''
                    }`}
                  >
                    {state.isLoading ? 'Resending...' : 'Resend Code'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {currentStep === 'reset-password' && (
            <div className="space-y-8 lg:space-y-16">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-[#212121] tracking-[-0.4px] leading-tight">
                  Create New Password
                </h1>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={state.newPassword}
                    onChange={(e) => updateState({ newPassword: e.target.value })}
                    placeholder="Enter your password here"
                    className={`h-14 sm:h-16 pl-6 pr-14 text-base sm:text-lg text-[#161616] border-[0.6px] rounded-xl ${
                      state.errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[#7d7d7d] focus:border-[#161616]'
                    } focus:ring-0 bg-white`}
                    disabled={state.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#7d7d7d] hover:text-[#161616]"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[14px]" /> : <Eye className="w-[18px] h-[14px]" />}
                  </button>
                  {state.errors.password && (
                    <p className="text-red-500 text-sm mt-2 ml-2">{state.errors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={state.confirmPassword}
                    onChange={(e) => updateState({ confirmPassword: e.target.value })}
                    placeholder="Enter your confirm password here"
                    className={`h-14 sm:h-16 pl-6 pr-14 text-base sm:text-lg text-[#161616] border-[0.6px] rounded-xl ${
                      state.errors.confirmPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[#7d7d7d] focus:border-[#161616]'
                    } focus:ring-0 bg-white`}
                    disabled={state.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#7d7d7d] hover:text-[#161616]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-[18px] h-[14px]" /> : <Eye className="w-[18px] h-[14px]" />}
                  </button>
                  {state.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2 ml-2">{state.errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleResetPassword}
                  disabled={state.isLoading || !state.newPassword || !state.confirmPassword}
                  className="w-full max-w-[231px] h-14 sm:h-[60px] bg-[#161616] hover:bg-[#161616]/90 text-white font-medium text-base sm:text-lg rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] disabled:opacity-50"
                >
                  {state.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success Screen */}
          {currentStep === 'success' && (
            <div className="flex justify-center">
              <div className="bg-[#fcfcfc] rounded-[20px] shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] p-6 sm:p-8 lg:p-12 w-full max-w-[820px] relative">
                <div className="space-y-8 lg:space-y-12 text-center">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative w-16 h-16">
                        <Image
                          src={imgCheckCircle}
                          alt="Success checkmark"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h1 className="text-2xl sm:text-3xl lg:text-[28px] font-semibold text-[#161616] leading-tight">
                        Password Change Successfully
                      </h1>
                      <div className="text-base sm:text-lg lg:text-[18px] text-[#393939] leading-relaxed max-w-[616px] mx-auto">
                        <span className="font-semibold">Congratulations!</span>
                        <span> You've successfully completed the verification process and are now officially a part of the Organaise community — where excellence meets opportunity.</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-[28px] text-[#28a745] leading-tight">
                    Redirecting to Login Page... ({state.redirectCountdown}s)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Decorative Images - Hidden on mobile for cleaner look */}
      <div className="hidden lg:block absolute right-[112px] top-[28px] w-[140px] h-[700px] pointer-events-none">
        <div className="relative w-full h-full">
        </div>
      </div>
    </div>
  );
}