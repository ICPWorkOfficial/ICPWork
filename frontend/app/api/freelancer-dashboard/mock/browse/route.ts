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
  },
  {
    email: 'freelancer3@example.com',
    serviceTitle: 'UI/UX Design Services',
    mainCategory: 'Design',
    subCategory: 'UI Design',
    description: 'Professional UI/UX design for web and mobile applications',
    requirementPlans: {
      basic: {
        price: '300',
        description: 'Basic UI design',
        features: ['Wireframes', 'Basic UI design', '2 revisions'],
        deliveryTime: '3 days'
      },
      advanced: {
        price: '600',
        description: 'Complete UI/UX design',
        features: ['User research', 'Wireframes', 'High-fidelity design', 'Prototype', '5 revisions'],
        deliveryTime: '1 week'
      },
      premium: {
        price: '1200',
        description: 'Enterprise UI/UX design',
        features: ['Complete user research', 'Design system', 'High-fidelity design', 'Interactive prototype', 'Unlimited revisions', 'Design guidelines'],
        deliveryTime: '2 weeks'
      }
    },
    additionalCharges: {
      fastDelivery: null,
      additionalChanges: null,
      perExtraChange: null
    },
    portfolioImages: ['design1.jpg', 'design2.jpg', 'design3.jpg', 'design4.jpg'],
    additionalQuestions: ['What is your target audience?', 'Do you have brand guidelines?'],
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 259200000,
    isActive: true
  }
];

// GET - Browse freelancer profiles with filters (mock)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const activeOnly = searchParams.get('activeOnly') !== 'false';

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

    // Sort profiles
    filteredProfiles = filteredProfiles.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

    // Convert to the expected format [email, profile]
    const profiles = paginatedProfiles.map(profile => [profile.email, profile]);

    return NextResponse.json({ 
      success: true,
      profiles: profiles,
      pagination: {
        page,
        limit,
        total: filteredProfiles.length,
        totalPages: Math.ceil(filteredProfiles.length / limit),
        hasNext: endIndex < filteredProfiles.length,
        hasPrev: page > 1
      },
      count: profiles.length,
      note: 'This is mock data for testing. The actual canister integration will work once the main canister is deployed.'
    });
  } catch (error: any) {
    console.error('Mock browse API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}