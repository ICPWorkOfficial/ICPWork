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
  userId: string; // Store user ID for ICP calls
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
    general?: string;
  };
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
  hasDigit: boolean;
}

export default function PasswordResetFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FlowStep>('forgot-password');
  const [state, setState] = useState<PasswordResetState>({
    email: '',
    userId: '',
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
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false,
    hasDigit: false
  });
  
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

  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasDigit: /\d/.test(password)
    };
  };

  const isPasswordValid = (validation: PasswordValidation): boolean => {
    return validation.minLength && validation.hasUppercase && 
           validation.hasLowercase && validation.hasSpecialChar && validation.hasDigit;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Step 1: Find user and send OTP
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
      // First, find user by email
      const userResponse = await fetch(`/api/auth/user-by-email?email=${encodeURIComponent(state.email)}`);
      const userData = await userResponse.json();

      if (!userResponse.ok || !userData.user) {
        updateState({ 
          isLoading: false,
          errors: { email: "No account found with this email address" }
        });
        return;
      }

      // Generate and send OTP for password reset
      const otpResponse = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.user.id })
      });

      const otpResult = await otpResponse.json();

      if (!otpResponse.ok) {
        updateState({ 
          isLoading: false,
          errors: { email: otpResult.error || "Failed to send reset code" }
        });
        return;
      }

      // Success - move to verification step
      updateState({ 
        isLoading: false,
        userId: userData.user.id,
        timeLeft: 105 
      });
      setCurrentStep('verify-code');

    } catch (error) {
      console.error('Send code error:', error);
      updateState({ 
        isLoading: false,
        errors: { email: "Network error. Please try again." }
      });
    }
  };

  // Step 2: Verify OTP Code
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
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.userId,
          otp: fullCode
        })
      });

      const result = await response.json();

      if (!response.ok) {
        updateState({ 
          isLoading: false,
          errors: { code: result.error || "Invalid verification code" }
        });
        return;
      }

      // Success - move to password reset
      updateState({ isLoading: false });
      setCurrentStep('reset-password');

    } catch (error) {
      console.error('Verify code error:', error);
      updateState({ 
        isLoading: false,
        errors: { code: "Network error. Please try again." }
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
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.userId })
      });

      if (!response.ok) {
        const result = await response.json();
        updateState({ 
          isLoading: false,
          errors: { general: result.error || "Failed to resend code" }
        });
        return;
      }

      updateState({ isLoading: false });

    } catch (error) {
      console.error('Resend code error:', error);
      updateState({ 
        isLoading: false,
        errors: { general: "Network error. Please try again." }
      });
    }
  };

  // Step 3: Reset Password with ICP
  const handlePasswordChange = (value: string) => {
    updateState({ newPassword: value });
    const validation = validatePassword(value);
    setPasswordValidation(validation);
    setShowPasswordValidation(value.length > 0 && !isPasswordValid(validation));
  };

  const handleResetPassword = async () => {
    clearErrors();
    const errors: any = {};

    const validation = validatePassword(state.newPassword);
    if (!isPasswordValid(validation)) {
      errors.password = "Password must meet all requirements";
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
      // Need to generate new OTP for password change (ICP requirement)
      const otpResponse = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.userId })
      });

      if (!otpResponse.ok) {
        updateState({ 
          isLoading: false,
          errors: { password: "Failed to generate verification code for password change" }
        });
        return;
      }

      // Use the same OTP code that was verified earlier
      const fullCode = state.code.join('');
      
      const resetResponse = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.userId,
          otp: fullCode,
          newPassword: state.newPassword
        })
      });

      const result = await resetResponse.json();

      if (!resetResponse.ok) {
        updateState({ 
          isLoading: false,
          errors: { password: result.error || "Failed to reset password" }
        });
        return;
      }

      // Success
      updateState({ 
        isLoading: false,
        redirectCountdown: 5 
      });
      setCurrentStep('success');

    } catch (error) {
      console.error('Reset password error:', error);
      updateState({ 
        isLoading: false,
        errors: { password: "Network error. Please try again." }
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
            href="/onboarding" 
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
          
          {/* General Error Message */}
          {state.errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm text-center">{state.errors.general}</p>
            </div>
          )}

          {/* Step 1: Forgot Password */}
          {currentStep === 'forgot-password' && (
            <div className="space-y-8 lg:space-y-12">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-[#212121] tracking-[-0.4px] leading-tight">
                  Forgot Password
                </h1>
                <p className="mt-4 text-gray-600">
                  Enter your email address and we'll send you a verification code to reset your password.
                </p>
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
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-[#28a745] hover:underline">
                  Back to Login
                </Link>
              </div>

              <div className="text-center text-[#7d7d7d] text-sm sm:text-lg font-medium max-w-md mx-auto">
                <p className="mb-1">
                  by using this service, i agree with ICPWork{" "}
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
                  Verify Code
                </h1>
                <p className="text-lg sm:text-xl text-[#393939] leading-relaxed">
                  A 6-digit verification code has been sent to{' '}
                  <span className="font-medium text-[#393939]">{state.email}</span>
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
                          disabled={state.isLoading}
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
                  <span className="text-[#101010]">Didn&apos;t receive the code?</span>{' '}
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
                <p className="mt-4 text-gray-600">
                  Choose a strong password that you haven't used before.
                </p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={state.newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onFocus={() => setShowPasswordValidation(state.newPassword.length > 0 && !isPasswordValid(passwordValidation))}
                    onBlur={() => setTimeout(() => setShowPasswordValidation(false), 200)}
                    placeholder="Enter your new password"
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
                  
                  {/* Password Validation Tooltip */}
                  {showPasswordValidation && (
                    <div className="absolute top-full right-0 mt-2 z-10">
                      <div className="relative w-[250px]">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-[#161616]">
                              Password must have:
                            </h4>
                            <div className="space-y-1">
                              <div className={`text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                                ✓ At least 8 characters
                              </div>
                              <div className={`text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                                ✓ One uppercase letter
                              </div>
                              <div className={`text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                                ✓ One lowercase letter
                              </div>
                              <div className={`text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-500'}`}>
                                ✓ One special character
                              </div>
                              <div className={`text-xs ${passwordValidation.hasDigit ? 'text-green-600' : 'text-red-500'}`}>
                                ✓ One number
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {state.errors.password && (
                    <p className="text-red-500 text-sm mt-2 ml-2">{state.errors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={state.confirmPassword}
                    onChange={(e) => updateState({ confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
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
                      Updating...
                    </div>
                  ) : (
                    "Update Password"
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
                        Password Reset Successfully
                      </h1>
                      <div className="text-base sm:text-lg lg:text-[18px] text-[#393939] leading-relaxed max-w-[616px] mx-auto">
                        <span className="font-semibold">Congratulations!</span>
                        <span> Your password has been successfully updated. You can now log in with your new password.</span>
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

// Additional API Routes needed for password reset

// pages/api/auth/user-by-email.ts
/*
import { NextApiRequest, NextApiResponse } from 'next';
import { icpAgent } from '../../../lib/icp-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await icpAgent.getUserByEmail(email);
    
    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
*/

// pages/api/auth/resend-otp.ts  
/*
import { NextApiRequest, NextApiResponse } from 'next';
import { icpAgent } from '../../../lib/icp-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await icpAgent.resendOTP(userId);
    
    if ('ok' in result) {
      res.status(200).json({ success: true, message: result.ok });
    } else {
      res.status(400).json({ error: result.err });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
*/

// pages/api/auth/change-password.ts
/*
import { NextApiRequest, NextApiResponse } from 'next';
import { icpAgent } from '../../../lib/icp-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ error: 'User ID, OTP, and new password are required' });
    }

    const result = await icpAgent.changePassword(userId, otp, newPassword);
    
    if ('ok' in result) {
      res.status(200).json({ success: true, message: result.ok });
    } else {
      res.status(400).json({ error: result.err });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
*/