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

// Transform service data to match expected format
function transformServiceData(service: any) {
  // If service already has the expected format (older services), return as is
  if (service.overview && service.projectTiers) {
    return service;
  }
  
  // If service has meta object (newer services), transform it
  if (service.meta && service.meta.overview) {
    return {
      id: service.id,
      slug: service.slug,
      overview: {
        serviceTitle: service.meta.overview.serviceTitle || service.title || 'Untitled Service',
        mainCategory: service.meta.overview.mainCategory || service.category || 'General',
        subCategory: service.meta.overview.subCategory || 'General',
        description: service.meta.overview.description || service.description || 'No description available',
        email: service.meta.overview.email || 'anonymous@example.com'
      },
      projectTiers: {
        Basic: {
          title: service.meta.projectTiers?.Basic?.title || 'Basic',
          description: service.meta.projectTiers?.Basic?.description || 'Basic service',
          price: service.meta.projectTiers?.Basic?.price || '50'
        },
        Advanced: {
          title: service.meta.projectTiers?.Advanced?.title || 'Advanced',
          description: service.meta.projectTiers?.Advanced?.description || 'Advanced service',
          price: service.meta.projectTiers?.Advanced?.price || '100'
        },
        Premium: {
          title: service.meta.projectTiers?.Premium?.title || 'Premium',
          description: service.meta.projectTiers?.Premium?.description || 'Premium service',
          price: service.meta.projectTiers?.Premium?.price || '200'
        }
      },
      additionalCharges: service.meta.additionalCharges || [],
      portfolioImages: service.meta.portfolioImages || [],
      questions: service.meta.questions || [],
      isActive: true,
      createdAt: service.createdAt || new Date().toISOString()
    };
  }
  
  // Fallback: create minimal service structure
  return {
    id: service.id || `svc_${Date.now()}`,
    slug: service.slug,
    overview: {
      serviceTitle: service.title || 'Untitled Service',
      mainCategory: service.category || 'General',
      subCategory: 'General',
      description: service.description || 'No description available',
      email: 'anonymous@example.com'
    },
    projectTiers: {
      Basic: {
        title: 'Basic',
        description: 'Basic service',
        price: service.price ? service.price.replace('$', '') : '50'
      },
      Advanced: {
        title: 'Advanced',
        description: 'Advanced service',
        price: '100'
      },
      Premium: {
        title: 'Premium',
        description: 'Premium service',
        price: '200'
      }
    },
    additionalCharges: [],
    portfolioImages: [],
    questions: [],
    isActive: true,
    createdAt: service.createdAt || new Date().toISOString()
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
      
      // Transform all services to ensure consistent format
      const transformedServices = servicesData.services.map(transformServiceData);
      
      return NextResponse.json({
        success: true,
        services: transformedServices,
        count: transformedServices.length,
        note: 'Services loaded from local data file and transformed'
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
