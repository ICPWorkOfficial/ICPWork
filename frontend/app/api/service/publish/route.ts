import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { HttpAgent, Actor } from '@dfinity/agent'
import { idlFactory } from '@/declarations/freelancer_dashboard'
import { generateSlug } from '@/lib/slug-utils'

async function getFreelancerDashboardActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false,
    fetchRootKey: true
  });
  
  await agent.fetchRootKey();
  
  const canisterId = 'umunu-kh777-77774-qaaca-cai'; // Freelancer dashboard canister ID
  return Actor.createActor(idlFactory, { agent, canisterId });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = `svc_${Date.now()}`

    // Extract user email from session or request
    const userEmail = body.email || 'anonymous@example.com'; // You might want to get this from session
    
    // Generate slug from title
    const slug = generateSlug(body.title || 'untitled-service', userEmail);

    // Try to publish to freelancer dashboard canister first
    try {
      const actor = await getFreelancerDashboardActor();
      
      // Transform the service data to match the canister's expected format
      const profileData = {
        email: userEmail,
        slug: slug,
        serviceTitle: body.title || 'Untitled Service',
        mainCategory: body.category || 'General',
        subCategory: body.meta?.overview?.subCategory || 'General',
        description: body.description || 'No description available',
        requirementPlans: {
          basic: {
            price: body.meta?.projectTiers?.Basic?.price || '50',
            description: body.meta?.projectTiers?.Basic?.description || 'Basic service',
            features: ['Basic feature'],
            deliveryTime: '3 days'
          },
          advanced: {
            price: body.meta?.projectTiers?.Advanced?.price || '100',
            description: body.meta?.projectTiers?.Advanced?.description || 'Advanced service',
            features: ['Advanced feature'],
            deliveryTime: '1 week'
          },
          premium: {
            price: body.meta?.projectTiers?.Premium?.price || '200',
            description: body.meta?.projectTiers?.Premium?.description || 'Premium service',
            features: ['Premium feature'],
            deliveryTime: '2 weeks'
          }
        },
        additionalCharges: {
          fastDelivery: body.meta?.additionalCharges?.fastDelivery ? {
            price: body.meta.additionalCharges.fastDelivery.price,
            description: 'Fast delivery option',
            isEnabled: true
          } : null,
          additionalChanges: body.meta?.additionalCharges?.additionalChanges ? {
            price: body.meta.additionalCharges.additionalChanges.price,
            description: 'Additional changes',
            isEnabled: true
          } : null,
          perExtraChange: null
        },
        portfolioImages: body.meta?.portfolioImages || [],
        additionalQuestions: body.meta?.questions || [],
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
        isActive: true
      };

      const result = await actor.createProfile(userEmail, profileData);
      
      if ('ok' in result) {
        console.log('Service published to canister successfully');
        return NextResponse.json({ 
          success: true, 
          id: slug, // Return slug as the service ID
          slug: slug,
          canisterResult: result.ok 
        });
      } else {
        console.error('Failed to publish to canister:', result.err);
        // Continue with local storage fallback
      }
    } catch (canisterError) {
      console.error('Canister publish error:', canisterError);
      // Continue with local storage fallback
    }

    // Fallback: Store in local JSON file
    const filePath = path.join(process.cwd(), 'data', 'services.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const servicesData = JSON.parse(fileContent)

    const newService = { 
      id, 
      slug: slug,
      ...body, 
      createdAt: new Date().toISOString() 
    }
    servicesData.services.push(newService)

    await fs.writeFile(filePath, JSON.stringify(servicesData, null, 2))

    return NextResponse.json({ 
      success: true, 
      id: slug, // Return slug as the service ID
      slug: slug 
    })
  } catch (err) {
    console.error('Failed to publish service:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
