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

// POST - Test simple profile creation
export async function POST(request: NextRequest) {
  try {
    // Create a minimal test profile
    const testProfile = {
      email: 'test@example.com',
      serviceTitle: 'Test Service',
      mainCategory: 'Web Development',
      subCategory: 'Frontend Development',
      description: 'Test description',
      requirementPlans: {
        basic: {
          price: '100',
          description: 'Basic package',
          features: ['Basic feature'],
          deliveryTime: '3 days'
        },
        advanced: {
          price: '200',
          description: 'Advanced package',
          features: ['Advanced feature'],
          deliveryTime: '1 week'
        },
        premium: {
          price: '300',
          description: 'Premium package',
          features: ['Premium feature'],
          deliveryTime: '2 weeks'
        }
      },
      additionalCharges: {
        fastDelivery: null,
        additionalChanges: null,
        perExtraChange: null
      },
      portfolioImages: [],
      additionalQuestions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    };

    const actor = await getFreelancerDashboardActor();
    
    // Try to call a simple method first
    const statsResult = await actor.getTotalProfiles();
    
    return NextResponse.json({ 
      success: true,
      message: 'Test successful',
      statsResult: statsResult,
      canisterId: 'umunu-kh777-77774-qaaca-cai'
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
