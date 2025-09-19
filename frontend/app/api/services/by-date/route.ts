import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/freelancer_dashboard';

async function getFreelancerDashboardActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'umunu-kh777-77774-qaaca-cai'; // Freelancer dashboard canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// Transform freelancer profile to service format
function transformProfileToService(email: string, profile: any) {
  return {
    id: email,
    overview: {
      serviceTitle: profile.serviceTitle,
      mainCategory: profile.mainCategory,
      subCategory: profile.subCategory,
      description: profile.description,
      email: profile.email
    },
    projectTiers: {
      Basic: {
        title: 'Basic',
        description: profile.requirementPlans.basic.description,
        price: profile.requirementPlans.basic.price
      },
      Advanced: {
        title: 'Advanced',
        description: profile.requirementPlans.advanced.description,
        price: profile.requirementPlans.advanced.price
      },
      Premium: {
        title: 'Premium',
        description: profile.requirementPlans.premium.description,
        price: profile.requirementPlans.premium.price
      }
    },
    additionalCharges: [
      ...(profile.additionalCharges.fastDelivery ? [{
        name: 'Fast Delivery',
        price: profile.additionalCharges.fastDelivery.price
      }] : []),
      ...(profile.additionalCharges.additionalChanges ? [{
        name: 'Additional Changes',
        price: profile.additionalCharges.additionalChanges.price
      }] : [])
    ],
    portfolioImages: profile.portfolioImages,
    questions: profile.additionalQuestions.map((question: string) => ({
      question,
      type: 'text',
      options: ['']
    })),
    isActive: profile.isActive,
    createdAt: new Date(Number(profile.createdAt) / 1000000).toISOString(),
    updatedAt: new Date(Number(profile.updatedAt) / 1000000).toISOString()
  };
}

// GET - Fetch services by date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse date parameters
    const startDate = searchParams.get('startDate'); // ISO date string
    const endDate = searchParams.get('endDate'); // ISO date string
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, updatedAt, serviceTitle
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc

    console.log('Date filter params:', { startDate, endDate, limit, offset, sortBy, sortOrder });

    // Validate date parameters
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid startDate format. Use ISO date string (e.g., 2025-01-01T00:00:00.000Z)'
      }, { status: 400 });
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid endDate format. Use ISO date string (e.g., 2025-01-01T00:00:00.000Z)'
      }, { status: 400 });
    }

    // Convert dates to nanoseconds (canister format)
    const startTimestamp = startDate ? BigInt(new Date(startDate).getTime() * 1000000) : null;
    const endTimestamp = endDate ? BigInt(new Date(endDate).getTime() * 1000000) : null;

    console.log('Converted timestamps:', { 
      startTimestamp: startTimestamp?.toString(), 
      endTimestamp: endTimestamp?.toString() 
    });

    const actor = await getFreelancerDashboardActor();
    
    // Get all active profiles from canister
    const result = await actor.getActiveProfiles();
    
    if ('ok' in result) {
      const profiles = result.ok;
      console.log(`Found ${profiles.length} total profiles in canister`);
      
      // Serialize BigInt values
      const serializedProfiles = JSON.parse(JSON.stringify(profiles, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      // Transform profiles to services
      let services = serializedProfiles.map(([email, profile]: [string, any]) => 
        transformProfileToService(email, profile)
      );

      // Filter by date range
      if (startTimestamp || endTimestamp) {
        services = services.filter((service: any) => {
          const serviceCreatedAt = BigInt(new Date(service.createdAt).getTime() * 1000000);
          
          if (startTimestamp && serviceCreatedAt < startTimestamp) {
            return false;
          }
          
          if (endTimestamp && serviceCreatedAt > endTimestamp) {
            return false;
          }
          
          return true;
        });
      }

      console.log(`Found ${services.length} services after date filtering`);

      // Sort services
      services.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case 'serviceTitle':
            aValue = a.overview.serviceTitle.toLowerCase();
            bValue = b.overview.serviceTitle.toLowerCase();
            break;
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const totalCount = services.length;
      const paginatedServices = services.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        services: paginatedServices,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: Math.floor(offset / limit) + 1
        },
        filters: {
          startDate,
          endDate,
          sortBy,
          sortOrder
        },
        message: `Found ${totalCount} services matching date criteria`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles from canister',
        details: result.err
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Error fetching services by date:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Fetch services with complex date filtering
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      dateRanges = [], // Array of {startDate, endDate, label}
      categories = [], // Array of categories to filter by
      subCategories = [], // Array of subcategories to filter by
      priceRange = null, // {min: number, max: number}
      isActive = true,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = body;

    console.log('Complex filter params:', body);

    const actor = await getFreelancerDashboardActor();
    
    // Get all active profiles from canister
    const result = await actor.getActiveProfiles();
    
    if ('ok' in result) {
      const profiles = result.ok;
      
      // Serialize BigInt values
      const serializedProfiles = JSON.parse(JSON.stringify(profiles, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      // Transform profiles to services
      let services = serializedProfiles.map(([email, profile]: [string, any]) => 
        transformProfileToService(email, profile)
      );

      // Apply date range filters
      if (dateRanges.length > 0) {
        services = services.filter((service: any) => {
          const serviceCreatedAt = new Date(service.createdAt).getTime();
          
          return dateRanges.some((range: any) => {
            const startTime = range.startDate ? new Date(range.startDate).getTime() : 0;
            const endTime = range.endDate ? new Date(range.endDate).getTime() : Date.now();
            
            return serviceCreatedAt >= startTime && serviceCreatedAt <= endTime;
          });
        });
      }

      // Apply category filters
      if (categories.length > 0) {
        services = services.filter((service: any) => 
          categories.includes(service.overview.mainCategory)
        );
      }

      // Apply subcategory filters
      if (subCategories.length > 0) {
        services = services.filter((service: any) => 
          subCategories.includes(service.overview.subCategory)
        );
      }

      // Apply price range filter
      if (priceRange) {
        services = services.filter((service: any) => {
          const basicPrice = parseFloat(service.projectTiers.Basic.price);
          const advancedPrice = parseFloat(service.projectTiers.Advanced.price);
          const premiumPrice = parseFloat(service.projectTiers.Premium.price);
          
          const minPrice = priceRange.min || 0;
          const maxPrice = priceRange.max || Infinity;
          
          return basicPrice >= minPrice && basicPrice <= maxPrice ||
                 advancedPrice >= minPrice && advancedPrice <= maxPrice ||
                 premiumPrice >= minPrice && premiumPrice <= maxPrice;
        });
      }

      // Apply active status filter
      if (isActive !== null) {
        services = services.filter((service: any) => service.isActive === isActive);
      }

      // Sort services
      services.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case 'serviceTitle':
            aValue = a.overview.serviceTitle.toLowerCase();
            bValue = b.overview.serviceTitle.toLowerCase();
            break;
          case 'price':
            aValue = parseFloat(a.projectTiers.Basic.price);
            bValue = parseFloat(b.projectTiers.Basic.price);
            break;
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const totalCount = services.length;
      const paginatedServices = services.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        services: paginatedServices,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: Math.floor(offset / limit) + 1
        },
        filters: {
          dateRanges,
          categories,
          subCategories,
          priceRange,
          isActive,
          sortBy,
          sortOrder
        },
        message: `Found ${totalCount} services matching filter criteria`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles from canister',
        details: result.err
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Error fetching services with complex filters:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
