'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Link from 'next/link';

// Type definitions
type AuthMode = 'login' | 'signup';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
  hasDigit: boolean;
}

// SVG assets
const googleIcon: string = "http://localhost:3845/assets/52243b2205799c2b1fa5d742582bdcf791c4d845.svg";

export default function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState<boolean>(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false,
    hasDigit: false
  });

  const isPasswordValid = (validation: PasswordValidation): boolean => {
    return validation.minLength && validation.hasUppercase && 
           validation.hasLowercase && validation.hasSpecialChar && validation.hasDigit;
  };

  const hasPasswordErrors = (validation: PasswordValidation, password: string): boolean => {
    // Show tooltip if password has content but doesn't meet all requirements
    return password.length > 0 && !isPasswordValid(validation);
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

  const handlePasswordFocus = (): void => {
    // Show validation tooltip only if there are errors when focused
    if (authMode === 'signup') {
      const currentValidation = validatePassword(signupData.password);
      setShowPasswordValidation(hasPasswordErrors(currentValidation, signupData.password));
    }
  };

  const handlePasswordBlur = (): void => {
    // Hide validation after a short delay
    setTimeout(() => {
      setShowPasswordValidation(false);
    }, 200);
  };

  const handleLoginInputChange = (field: keyof LoginFormData, value: string): void => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignupInputChange = (field: keyof SignupFormData, value: string): void => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      const newValidation = validatePassword(value);
      setPasswordValidation(newValidation);
      
      // Show/hide tooltip based on validation errors
      if (authMode === 'signup') {
        setShowPasswordValidation(hasPasswordErrors(newValidation, value));
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else {
      const validation = validatePassword(signupData.password);
      if (!validation.minLength || !validation.hasUppercase || !validation.hasLowercase || 
          !validation.hasSpecialChar || !validation.hasDigit) {
        newErrors.password = 'Password must meet all requirements';
      }
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const isValid = authMode === 'login' ? validateLoginForm() : validateSignupForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      if (authMode === 'login') {
        console.log('Logging in with:', loginData);
      } else {
        console.log('Creating account with:', signupData);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`${authMode} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = (): void => {
    console.log(`${authMode === 'login' ? 'Signing in' : 'Signing up'} with Google...`);
  };

  const toggleAuthMode = (): void => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setErrors({});
    setShowPasswordValidation(false);
  };

  const handleForgotPassword = (): void => {
    console.log('Opening forgot password...');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Header */}
      <Card className="rounded-none border-b border-gray-200 shadow-none">
        <CardContent className="flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="logo.svg" alt="Logo" width={132} height={132} />
          </Link>
          <div className="text-gray-700">
            <span>Want to Hire? </span>
            <Link href="/client-signup" className="text-green-600 hover:text-green-700 font-medium hover:underline">
              Join As Client
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-6 py-16 max-w-2xl mx-auto">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardContent className="space-y-12 p-0">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-[#212121] leading-tight">
                {authMode === 'login' ? (
                  <>
                    LogIn Here
                    <br />
                    Fill the details
                  </>
                ) : (
                  <>
                    Sign Up Here to
                    <br />
                    create new account
                  </>
                )}
              </h1>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder={authMode === 'login' ? 'Enter your Email' : 'Enter your Email Id'}
                    value={authMode === 'login' ? loginData.email : signupData.email}
                    onChange={(e) => 
                      authMode === 'login' 
                        ? handleLoginInputChange('email', e.target.value)
                        : handleSignupInputChange('email', e.target.value)
                    }
                    className="h-16 pl-14 pr-6 text-lg border-[#7d7d7d] rounded-xl focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm ml-2">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1 relative">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'login' ? '********' : 'Enter your Password Here'}
                    value={authMode === 'login' ? loginData.password : signupData.password}
                    onChange={(e) => 
                      authMode === 'login' 
                        ? handleLoginInputChange('password', e.target.value)
                        : handleSignupInputChange('password', e.target.value)
                    }
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    className="h-16 px-6 pr-14 text-lg border-[#7d7d7d] rounded-xl focus:border-gray-900 focus:ring-gray-900"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
                
                {/* Password Validation Tooltip - Exact Figma Design */}
                {showPasswordValidation && authMode === 'signup' && (
                  <div className="absolute top-full right-0 mt-2 z-10">
                    <div className="relative w-[215px] h-[219px]">
                      {/* Background SVG from Figma */}
                      <Image
                        src="/icons/tooltip.svg"
                        alt="Tooltip" 
                        className="absolute inset-0 w-full h-full" 
                      />
                      
                      {/* Content positioned exactly as in Figma */}
                      <div className="absolute top-[42px] left-4 right-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-[#161616] leading-5">
                            Password must :
                          </h4>
                          
                          <div className="space-y-2">
                            <div className={`text-xs leading-5 font-normal ${
                              passwordValidation.minLength 
                                ? 'text-green-600' 
                                : 'text-red-500'
                            }`}>
                              Have minimum 8 characters
                            </div>
                            
                            <div className={`text-xs leading-5 font-normal ${
                              passwordValidation.hasUppercase 
                                ? 'text-green-600' 
                                : 'text-red-500'
                            }`}>
                              Have minimum 1 uppercase letter
                            </div>
                            
                            <div className={`text-xs leading-5 font-normal ${
                              passwordValidation.hasLowercase 
                                ? 'text-green-600' 
                                : 'text-red-500'
                            }`}>
                              Have minimum 1 lowercase letter
                            </div>
                            
                            <div className={`text-xs leading-5 font-normal ${
                              passwordValidation.hasSpecialChar 
                                ? 'text-green-600' 
                                : 'text-red-500'
                            }`}>
                              Have minimum 1 special character
                            </div>
                            
                            <div className={`text-xs leading-5 font-normal ${
                              passwordValidation.hasDigit 
                                ? 'text-green-600' 
                                : 'text-red-500'
                            }`}>
                              Have minimum 1 digit
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-500 text-sm ml-2">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input - Only for Signup */}
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your Password Here"
                      value={signupData.confirmPassword}
                      onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                      className="h-16 px-6 pr-14 text-lg border-[#7d7d7d] rounded-xl focus:border-gray-900 focus:ring-gray-900"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm ml-2">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Forgot Password Link - Only for Login */}
              {authMode === 'login' && (
                <div className="text-right">
                  <Link href="/forgot-password">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#FF3B30] hover:text-red-600 p-0 h-auto font-normal"
                    >
                      Forgot Password?
                    </Button>
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <Link href="/onboarding">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#161616] hover:bg-gray-800 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading 
                    ? (authMode === 'login' ? 'Logging In...' : 'Creating Account...') 
                    : (authMode === 'login' ? 'Login' : 'Create Account')
                  }
                </Button>
              </Link>
            </form>

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <span className="text-xl text-gray-900">
                {authMode === 'login' ? "Don't Have an Account? " : "Already Have an Account? "}
              </span>
              <Button
                variant="link"
                onClick={toggleAuthMode}
                className="text-xl text-green-600 hover:text-green-700 font-medium p-0 h-auto"
              >
                {authMode === 'login' ? 'SignUp' : 'LogIn'}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Google Auth */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAuth}
              className="w-full h-16 bg-white border-gray-300 hover:bg-gray-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <img src={googleIcon} alt="Google" className="w-8 h-8" />
                <span className="text-xl text-[#161616] font-normal">
                  {authMode === 'login' ? 'Or Sign In with Google' : 'Sign Up with Google'}
                </span>
              </div>
            </Button>

            {/* Terms and Privacy */}
            <div className="text-center text-lg text-[#7d7d7d] space-y-1">
              <p>
                By {authMode === 'login' ? 'Logging In' : 'Signing Up'}, I agree with ICPWork{' '}
                <Link href="/privacy" className="text-[#7b59ff] underline hover:text-purple-700">
                  privacy policy
                </Link>
              </p>
              <p>
                and{' '}
                <Link href="/terms" className="text-[#7b59ff] underline hover:text-purple-700">
                  terms and conditions
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}