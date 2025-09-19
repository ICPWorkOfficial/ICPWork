import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
const mockProfiles = [
  {
    email: 'freelancer1@example.com',
    serviceTitle: 'Web Development Services',
    mainCategory: 'Web Development',
    subCategory: 'Frontend Development',
    description: 'Professional web development services with modern frameworks',
    requirementPlans: {
      basic: {
        price: '500',
        description: 'Basic website development',
        features: ['Responsive design', 'Basic functionality'],
        deliveryTime: '1 week'
      },
      advanced: {
        price: '1000',
        description: 'Advanced web application',
        features: ['Custom features', 'Database integration', 'API development'],
        deliveryTime: '2 weeks'
      },
      premium: {
        price: '2000',
        description: 'Full-stack web solution',
        features: ['Complete solution', 'Maintenance included', 'SEO optimization'],
        deliveryTime: '3 weeks'
      }
    },
    additionalCharges: {
      fastDelivery: null,
      additionalChanges: null,
      perExtraChange: null
    },
    portfolioImages: ['image1.jpg', 'image2.jpg'],
    additionalQuestions: ['What is your preferred tech stack?', 'Do you have existing designs?'],
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000,
    isActive: true
  },
  {
    email: 'freelancer2@example.com',
    serviceTitle: 'Mobile App Development',
    mainCategory: 'Mobile Development',
    subCategory: 'iOS Development',
    description: 'Native iOS app development with Swift',
    requirementPlans: {
      basic: {
        price: '800',
        description: 'Basic iOS app',
        features: ['Native iOS app', 'Basic UI/UX'],
        deliveryTime: '2 weeks'
      },
      advanced: {
        price: '1500',
        description: 'Advanced iOS app',
        features: ['Custom features', 'API integration', 'Push notifications'],
        deliveryTime: '3 weeks'
      },
      premium: {
        price: '3000',
        description: 'Enterprise iOS app',
        features: ['Full features', 'App Store submission', 'Maintenance'],
        deliveryTime: '4 weeks'
      }
    },
    additionalCharges: {
      fastDelivery: null,
      additionalChanges: null,
      perExtraChange: null
    },
    portfolioImages: ['app1.jpg', 'app2.jpg', 'app3.jpg'],
    additionalQuestions: ['What type of app do you need?', 'Do you have wireframes?'],
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172800000,
    isActive: true
  }
];

// GET - Mock freelancer profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let filteredProfiles = mockProfiles;

    // Apply filters
    if (category && category !== 'All Categories') {
      filteredProfiles = filteredProfiles.filter(profile => profile.mainCategory === category);
    }

    if (subCategory) {
      filteredProfiles = filteredProfiles.filter(profile => profile.subCategory === subCategory);
    }

    if (search) {
      filteredProfiles = filteredProfiles.filter(profile => 
        profile.serviceTitle.toLowerCase().includes(search.toLowerCase()) ||
        profile.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeOnly) {
      filteredProfiles = filteredProfiles.filter(profile => profile.isActive);
    }

    // Convert to the expected format [email, profile]
    const profiles = filteredProfiles.map(profile => [profile.email, profile]);

    return NextResponse.json({ 
      success: true,
      profiles: profiles,
      count: profiles.length,
      note: 'This is mock data for testing. The actual canister integration will work once the main canister is deployed.'
    });
  } catch (error: any) {
    console.error('Mock API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Mock profile creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profile } = body;

    // Simulate successful creation
    const newProfile = {
      ...profile,
      email: email,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    };

    return NextResponse.json({ 
      success: true,
      profile: newProfile,
      message: 'Profile created successfully (mock)',
      note: 'This is mock data. The actual canister integration will work once the main canister is deployed.'
    });
  } catch (error: any) {
    console.error('Mock API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
