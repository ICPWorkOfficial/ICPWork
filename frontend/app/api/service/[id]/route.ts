import { NextRequest, NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '@/declarations/main';

async function getMainCanisterActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    verifyUpdateSignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'vg3po-ix777-77774-qaafa-cai'; // Main canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// GET - Get service by ID (email)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get session from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'No session found. Please login first.'
      }, { status: 401 });
    }

    // Get user email from session store
    const { sessionStore } = await import('@/lib/session-store');
    const session = sessionStore.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Invalid session. Please login again.'
      }, { status: 401 });
    }

    const actor = await getFreelancerDashboardActor();
    const result = await actor.getProfile(id);

    if (result.ok) {
      const profile = result.ok;
      
      // Transform the profile data to match the frontend's expected format
      const service = {
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
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
      
      const serializedService = JSON.parse(JSON.stringify(service, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        service: serializedService
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Get service error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update service by ID (email)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { overview, projectTiers, additionalCharges, portfolioImages, questions } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Find additional charges
    const fastDeliveryCharge = additionalCharges?.find((c: any) => 
      c.name && c.name.toLowerCase().includes('fast')
    );
    const additionalChangesCharge = additionalCharges?.find((c: any) => 
      c.name && c.name.toLowerCase().includes('change')
    );

    // Build additionalCharges object with proper DFinity optional format
    const additionalChargesObj: any = {};
    
    // DFinity optional fields are represented as [] | [value]
    if (fastDeliveryCharge) {
      additionalChargesObj.fastDelivery = [{
        price: fastDeliveryCharge.price || '0',
        description: 'Fast delivery option',
        isEnabled: true
      }];
    } else {
      additionalChargesObj.fastDelivery = [];
    }
    
    if (additionalChangesCharge) {
      additionalChargesObj.additionalChanges = [{
        price: additionalChangesCharge.price || '0',
        description: 'Additional changes',
        isEnabled: true
      }];
    } else {
      additionalChargesObj.additionalChanges = [];
    }
    
    additionalChargesObj.perExtraChange = [];

    // Transform the data to match the canister's expected format
    const freelancerProfile = {
      email: id,
      serviceTitle: overview.serviceTitle,
      mainCategory: overview.mainCategory,
      subCategory: overview.subCategory,
      description: overview.description || overview.serviceTitle,
      requirementPlans: {
        basic: {
          price: projectTiers.Basic?.price || '0',
          description: projectTiers.Basic?.description || 'Basic package',
          features: ['Basic feature'],
          deliveryTime: '3 days'
        },
        advanced: {
          price: projectTiers.Advanced?.price || '0',
          description: projectTiers.Advanced?.description || 'Advanced package',
          features: ['Advanced feature'],
          deliveryTime: '1 week'
        },
        premium: {
          price: projectTiers.Premium?.price || '0',
          description: projectTiers.Premium?.description || 'Premium package',
          features: ['Premium feature'],
          deliveryTime: '2 weeks'
        }
      },
      additionalCharges: additionalChargesObj,
      portfolioImages: portfolioImages || [],
      additionalQuestions: questions?.map((q: any) => q.question) || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    };

    // Get session from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'No session found. Please login first.'
      }, { status: 401 });
    }

    // Get user email from session store
    const { sessionStore } = await import('@/lib/session-store');
    const session = sessionStore.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Invalid session. Please login again.'
      }, { status: 401 });
    }

    const userEmail = session.email;
    
    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email not found in session.'
      }, { status: 400 });
    }

    // Update the profile with the correct email
    freelancerProfile.email = userEmail;

    const actor = await getFreelancerDashboardActor();
    const result = await actor.updateProfile(userEmail, freelancerProfile);

    if (result.ok) {
      const serializedProfile = JSON.parse(JSON.stringify(result.ok, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      return NextResponse.json({ 
        success: true,
        profile: serializedProfile,
        message: 'Service updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete service by ID (email)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const actor = await getFreelancerDashboardActor();
    const result = await actor.deleteProfile(id);

    if (result.ok) {
      return NextResponse.json({ 
        success: true,
        message: 'Service deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.err },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}