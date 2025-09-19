import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/freelancer_dashboard';

async function getFreelancerDashboardActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'umunu-kh777-77774-qaaca-cai'; // Freelancer dashboard canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

export async function GET(request: NextRequest) {
  try {
    console.log('Testing service fetch from canister...');
    
    const actor = await getFreelancerDashboardActor();
    
    // Call the canister directly to get all active profiles
    const result = await actor.getActiveProfiles();
    
    console.log('Canister result:', result);
    
    if ('ok' in result) {
      const profiles = result.ok;
      console.log(`Found ${profiles.length} profiles in canister`);
      
      // Serialize BigInt values
      const serializedProfiles = JSON.parse(JSON.stringify(profiles, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      // Transform the data to a more readable format
      const transformedServices = serializedProfiles.map(([email, profile]: [string, any]) => ({
        email,
        serviceTitle: profile.serviceTitle,
        description: profile.description,
        mainCategory: profile.mainCategory,
        subCategory: profile.subCategory,
        isActive: profile.isActive,
        createdAt: new Date(Number(profile.createdAt) / 1000000).toISOString(),
        updatedAt: new Date(Number(profile.updatedAt) / 1000000).toISOString(),
        requirementPlans: {
          basic: {
            title: profile.requirementPlans.basic.description,
            price: profile.requirementPlans.basic.price,
            deliveryTime: profile.requirementPlans.basic.deliveryTime,
            features: profile.requirementPlans.basic.features
          },
          advanced: {
            title: profile.requirementPlans.advanced.description,
            price: profile.requirementPlans.advanced.price,
            deliveryTime: profile.requirementPlans.advanced.deliveryTime,
            features: profile.requirementPlans.advanced.features
          },
          premium: {
            title: profile.requirementPlans.premium.description,
            price: profile.requirementPlans.premium.price,
            deliveryTime: profile.requirementPlans.premium.deliveryTime,
            features: profile.requirementPlans.premium.features
          }
        },
        additionalCharges: profile.additionalCharges,
        additionalQuestions: profile.additionalQuestions,
        portfolioImages: profile.portfolioImages
      }));
      
      return NextResponse.json({
        success: true,
        message: 'Successfully fetched services from canister',
        count: transformedServices.length,
        services: transformedServices,
        rawData: serializedProfiles // Include raw data for debugging
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles from canister',
        details: result
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error fetching services from canister:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services from canister',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST method to test service creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Testing service creation with data:', body);
    
    const actor = await getFreelancerDashboardActor();
    
    // Test the service creation flow
    const email = body.email || 'test@example.com';
    const profile = {
      subCategory: body.subCategory || 'Web Development',
      additionalQuestions: body.additionalQuestions || ['What type of service do you need?'],
      additionalCharges: body.additionalCharges || {
        additionalChanges: [],
        fastDelivery: [],
        perExtraChange: []
      },
      createdAt: BigInt(Date.now()),
      description: body.description || 'Test description',
      isActive: true,
      email: email,
      requirementPlans: body.requirementPlans || {
        basic: {
          description: 'Basic package',
          price: '100',
          deliveryTime: '3 days',
          features: ['Basic feature']
        },
        advanced: {
          description: 'Advanced package',
          price: '250',
          deliveryTime: '1 week',
          features: ['Advanced feature']
        },
        premium: {
          description: 'Premium package',
          price: '500',
          deliveryTime: '2 weeks',
          features: ['Premium feature']
        }
      },
      updatedAt: BigInt(Date.now()),
      serviceTitle: body.serviceTitle || 'Test Service',
      portfolioImages: body.portfolioImages || [],
      mainCategory: body.mainCategory || 'Development'
    };
    
    const result = await actor.createProfile(email, profile);
    
    console.log('Service creation result:', result);
    
    if ('ok' in result) {
      // Serialize BigInt values in the result
      const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({
        success: true,
        message: 'Service created successfully',
        result: serializedResult.ok
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create service',
        details: result
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create service',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
