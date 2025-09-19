import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}

// GET - Get all services
export async function GET(request: NextRequest) {
  try {
    // Get session from cookie (optional for now)
    const sessionId = request.cookies.get('sessionId')?.value;
    
    // For now, return the existing services data from the JSON file
    // This can be enhanced later to fetch from canisters
    const servicesPath = path.join(process.cwd(), 'data', 'services.json');
    
    if (fs.existsSync(servicesPath)) {
      const servicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
      
      return NextResponse.json({
        success: true,
        services: servicesData.services,
        count: servicesData.services.length,
        note: 'Services loaded from local data file'
      });
    } else {
      // Fallback: return empty services array
      return NextResponse.json({
        success: true,
        services: [],
        count: 0,
        note: 'No services data found'
      });
    }
  } catch (error: any) {
    console.error('Get services error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
