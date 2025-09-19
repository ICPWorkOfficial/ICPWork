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

// GET - Get all services offered by a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { email } = params;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }

    const actor = await getFreelancerDashboardActor();
    const result = await actor.getProfile(email);

    if (result.ok) {
      const profile = result.ok;
      
      // Transform the profile data to match the frontend's expected format
      const serviceData = {
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
            title: "Basic Package",
            description: profile.requirementPlans.basic.description,
            price: profile.requirementPlans.basic.price,
            features: profile.requirementPlans.basic.features,
            deliveryTime: profile.requirementPlans.basic.deliveryTime
          },
          Advanced: {
            title: "Advanced Package", 
            description: profile.requirementPlans.advanced.description,
            price: profile.requirementPlans.advanced.price,
            features: profile.requirementPlans.advanced.features,
            deliveryTime: profile.requirementPlans.advanced.deliveryTime
          },
          Premium: {
            title: "Premium Package",
            description: profile.requirementPlans.premium.description,
            price: profile.requirementPlans.premium.price,
            features: profile.requirementPlans.premium.features,
            deliveryTime: profile.requirementPlans.premium.deliveryTime
          }
        },
        additionalCharges: [
          ...(profile.additionalCharges.fastDelivery.length > 0 ? [{
            name: "Fast Delivery",
            price: profile.additionalCharges.fastDelivery[0].price,
            description: profile.additionalCharges.fastDelivery[0].description
          }] : []),
          ...(profile.additionalCharges.additionalChanges.length > 0 ? [{
            name: "Additional Changes", 
            price: profile.additionalCharges.additionalChanges[0].price,
            description: profile.additionalCharges.additionalChanges[0].description
          }] : []),
          ...(profile.additionalCharges.perExtraChange.length > 0 ? [{
            name: "Per Extra Change",
            price: profile.additionalCharges.perExtraChange[0].price,
            description: profile.additionalCharges.perExtraChange[0].description
          }] : [])
        ],
        portfolioImages: profile.portfolioImages,
        questions: profile.additionalQuestions.map(question => ({
          question: question,
          type: "text",
          options: []
        })),
        createdAt: profile.createdAt.toString(),
        updatedAt: profile.updatedAt.toString(),
        isActive: profile.isActive
      };

      return NextResponse.json({
        success: true,
        service: serviceData,
        message: 'Service retrieved successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err,
        message: 'Service not found for this user'
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Get user service error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
