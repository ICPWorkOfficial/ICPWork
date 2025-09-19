import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

// Transform user data from API to profile format
function transformUserDataToProfile(userData: any) {
  // Helper function to get first value from array or return empty string
  const getFirstValue = (arr: any[] | undefined): string => {
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
  };

  const firstName = getFirstValue(userData.firstName);
  const lastName = getFirstValue(userData.lastName);
  const fullName = `${firstName} ${lastName}`.trim() || userData.email;
  
  return {
    personal: {
      name: fullName,
      title: getFirstValue(userData.description) || 'Professional',
      description: getFirstValue(userData.description) || 'No description available',
      about: getFirstValue(userData.description) || 'No about information available',
      profileImage: '/caffine.png', // Default profile image
      socials: [
        {
          platform: 'linkedin',
          url: getFirstValue(userData.linkedinProfile) || '#',
          icon: 'linkedin'
        }
      ]
    },
    skills: userData.skills || [],
    stats: {
      companiesServed: 0,
      projectsDone: 0,
      hackathonsParticipated: 0
    },
    workExperience: [
      {
        id: 1,
        designation: 'Web Developer',
        company: getFirstValue(userData.companyName) || 'Freelancer',
        description: getFirstValue(userData.description) || 'Professional web development services',
        duration: '2023 - Present',
        timeWorked: '1+ years'
      }
    ],
    services: [
      {
        id: 1,
        title: 'Web Development',
        image: '/caffine.png',
        personName: fullName,
        description: getFirstValue(userData.description) || 'Professional web development services',
        rating: 5,
        price: '$50/hr'
      }
    ],
    reviews: [
      {
        id: 1,
        text: 'Great work! Very professional and delivered on time.',
        reviewer: 'Client Name',
        designation: 'Project Manager'
      }
    ],
    portfolio: [
      {
        id: 1,
        title: 'Sample Project',
        image: '/caffine.png',
        description: 'A sample project showcasing web development skills'
      }
    ],
    status: 'complete'
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: 'No session found'
      }, { status: 401 });
    }

    // Get session data
    const session = sessionStore.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid session'
      }, { status: 401 });
    }

    // Get user data from the users API
    const userResponse = await fetch(`http://localhost:3000/api/users/email/${session.email}`);
    const userResult = await userResponse.json();
    
    if (userResult.user && userResult.user.ok) {
      const userData = userResult.user.ok;
      const transformedProfile = transformUserDataToProfile(userData);
      
      return NextResponse.json({
        success: true,
        profile: transformedProfile
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error fetching profile data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}