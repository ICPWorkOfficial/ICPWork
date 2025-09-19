import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/user_management';

async function getUserManagementActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // User management canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// POST - Update user profile with all fields
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profileData } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email is required',
          errors: { email: 'Email is required' }
        }, 
        { status: 400 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Profile data is required',
          errors: { profileData: 'Profile data is required' }
        }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format',
          errors: { email: 'Please enter a valid email address' }
        }, 
        { status: 400 }
      );
    }

    // Validate and sanitize profile data - convert empty strings to null for Motoko optional fields
    const validatedProfileData = {
      firstName: profileData.firstName && String(profileData.firstName).trim() ? String(profileData.firstName).trim() : null,
      lastName: profileData.lastName && String(profileData.lastName).trim() ? String(profileData.lastName).trim() : null,
      phoneNumber: profileData.phoneNumber && String(profileData.phoneNumber).trim() ? String(profileData.phoneNumber).trim() : null,
      companyName: profileData.companyName && String(profileData.companyName).trim() ? String(profileData.companyName).trim() : null,
      companyWebsite: profileData.companyWebsite && String(profileData.companyWebsite).trim() ? String(profileData.companyWebsite).trim() : null,
      industry: profileData.industry && String(profileData.industry).trim() ? String(profileData.industry).trim() : null,
      businessType: profileData.businessType && String(profileData.businessType).trim() ? String(profileData.businessType).trim() : null,
      numberOfEmployees: profileData.numberOfEmployees ? Number(profileData.numberOfEmployees) : null,
      description: profileData.description && String(profileData.description).trim() ? String(profileData.description).trim() : null,
      skills: Array.isArray(profileData.skills) ? profileData.skills.map(skill => String(skill).trim()).filter(skill => skill.length > 0) : [],
      country: profileData.country && String(profileData.country).trim() ? String(profileData.country).trim() : null,
      state: profileData.state && String(profileData.state).trim() ? String(profileData.state).trim() : null,
      city: profileData.city && String(profileData.city).trim() ? String(profileData.city).trim() : null,
      zipCode: profileData.zipCode && String(profileData.zipCode).trim() ? String(profileData.zipCode).trim() : null,
      streetAddress: profileData.streetAddress && String(profileData.streetAddress).trim() ? String(profileData.streetAddress).trim() : null,
      photo: profileData.photo && String(profileData.photo).trim() ? String(profileData.photo).trim() : null,
      linkedinProfile: profileData.linkedinProfile && String(profileData.linkedinProfile).trim() ? String(profileData.linkedinProfile).trim() : null,
    };

    // Additional validation for specific fields
    const errors: { [key: string]: string } = {};

    // Validate phone number format if provided
    if (validatedProfileData.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(validatedProfileData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    // Validate website URL if provided
    if (validatedProfileData.companyWebsite && !/^https?:\/\/.+/.test(validatedProfileData.companyWebsite)) {
      errors.companyWebsite = 'Please enter a valid website URL (must start with http:// or https://)';
    }

    // Validate LinkedIn profile URL if provided
    if (validatedProfileData.linkedinProfile && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(validatedProfileData.linkedinProfile)) {
      errors.linkedinProfile = 'Please enter a valid LinkedIn profile URL';
    }

    // Validate number of employees if provided
    if (validatedProfileData.numberOfEmployees !== null && (validatedProfileData.numberOfEmployees < 0 || !Number.isInteger(validatedProfileData.numberOfEmployees))) {
      errors.numberOfEmployees = 'Number of employees must be a positive integer';
    }

    // Validate skills array
    if (validatedProfileData.skills.length > 50) {
      errors.skills = 'Maximum 50 skills allowed';
    }

    // Check for duplicate skills
    const uniqueSkills = [...new Set(validatedProfileData.skills)];
    if (uniqueSkills.length !== validatedProfileData.skills.length) {
      errors.skills = 'Duplicate skills are not allowed';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please fix the validation errors',
          errors 
        }, 
        { status: 400 }
      );
    }

    // Call the user management canister
    const actor = await getUserManagementActor();
    
    // Transform the data to match Motoko's expected format
    const motokoProfileData = {
      firstName: validatedProfileData.firstName ? [validatedProfileData.firstName] : [],
      lastName: validatedProfileData.lastName ? [validatedProfileData.lastName] : [],
      phoneNumber: validatedProfileData.phoneNumber ? [validatedProfileData.phoneNumber] : [],
      companyName: validatedProfileData.companyName ? [validatedProfileData.companyName] : [],
      companyWebsite: validatedProfileData.companyWebsite ? [validatedProfileData.companyWebsite] : [],
      industry: validatedProfileData.industry ? [validatedProfileData.industry] : [],
      businessType: validatedProfileData.businessType ? [validatedProfileData.businessType] : [],
      numberOfEmployees: validatedProfileData.numberOfEmployees ? [validatedProfileData.numberOfEmployees] : [],
      description: validatedProfileData.description ? [validatedProfileData.description] : [],
      skills: validatedProfileData.skills,
      country: validatedProfileData.country ? [validatedProfileData.country] : [],
      state: validatedProfileData.state ? [validatedProfileData.state] : [],
      city: validatedProfileData.city ? [validatedProfileData.city] : [],
      zipCode: validatedProfileData.zipCode ? [validatedProfileData.zipCode] : [],
      streetAddress: validatedProfileData.streetAddress ? [validatedProfileData.streetAddress] : [],
      photo: validatedProfileData.photo ? [validatedProfileData.photo] : [],
      linkedinProfile: validatedProfileData.linkedinProfile ? [validatedProfileData.linkedinProfile] : [],
    };
    
    const result = await actor.updateUserProfile(email, motokoProfileData);
    
    if ('ok' in result) {
      // Convert BigInt values to strings for JSON serialization
      const serializedUser = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        message: 'Profile updated successfully',
        user: serializedUser
      });
    } else {
      // Handle different error types
      const errorType = Object.keys(result.err)[0];
      const errorMessage = getErrorMessage(errorType);
      const fieldErrors = getFieldErrors(errorType);
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          errors: fieldErrors
        }, 
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Helper function to convert backend errors to user-friendly messages
function getErrorMessage(errorType: string): string {
  switch (errorType) {
    case 'NotFound':
      return 'User not found with the provided email address';
    case 'InvalidData':
      return 'Invalid profile data provided';
    case 'InvalidEmail':
      return 'Invalid email address format';
    case 'Unauthorized':
      return 'Unauthorized to update this profile';
    default:
      return 'Failed to update profile. Please try again.';
  }
}

// Helper function to map errors to specific form fields
function getFieldErrors(errorType: string): { [key: string]: string } {
  switch (errorType) {
    case 'NotFound':
      return { email: 'User not found with this email address' };
    case 'InvalidData':
      return { profileData: 'Invalid profile data provided' };
    case 'InvalidEmail':
      return { email: 'Invalid email address format' };
    default:
      return {};
  }
}

// GET - Get current user profile (for reference)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email parameter is required' 
        }, 
        { status: 400 }
      );
    }

    const actor = await getUserManagementActor();
    const result = await actor.getUser(email);
    
    if ('ok' in result) {
      // Convert BigInt values to strings for JSON serialization
      const serializedUser = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        user: serializedUser
      });
    } else {
      const errorType = Object.keys(result.err)[0];
      const errorMessage = getErrorMessage(errorType);
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage 
        }, 
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Get profile error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
