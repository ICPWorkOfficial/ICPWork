import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { HttpAgent, Actor } from '@dfinity/agent'
import { idlFactory } from '@/declarations/freelancer_dashboard'
import { generateSlug } from '@/lib/slug-utils'

async function getFreelancerDashboardActor() {
  const agent = new HttpAgent({ 
    host: 'http://127.0.0.1:4943',
    verifyQuerySignatures: false
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
      console.log('Attempting to publish to canister with userEmail:', userEmail);
      const actor = await getFreelancerDashboardActor();
      
      // Transform the service data to match the canister's expected format
      const profileData = {
        subCategory: body.meta?.overview?.subCategory || 'General',
        additionalQuestions: body.meta?.questions?.map((q: any) => q.question) || [],
        additionalCharges: {
          fastDelivery: body.meta?.additionalCharges?.find((c: any) => c.name === 'fastDelivery') ? [{
            price: body.meta.additionalCharges.find((c: any) => c.name === 'fastDelivery').price,
            description: 'Fast delivery option',
            isEnabled: true
          }] : [],
          additionalChanges: body.meta?.additionalCharges?.find((c: any) => c.name === 'additionalChanges') ? [{
            price: body.meta.additionalCharges.find((c: any) => c.name === 'additionalChanges').price,
            description: 'Additional changes',
            isEnabled: true
          }] : [],
          perExtraChange: []
        },
        createdAt: BigInt(Date.now()),
        description: body.description || 'No description available',
        isActive: true,
        email: userEmail,
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
        updatedAt: BigInt(Date.now()),
        serviceTitle: body.title || 'Untitled Service',
        portfolioImages: body.meta?.portfolioImages || [],
        mainCategory: body.category || 'General'
      };

      console.log('Profile data to be sent to canister:', JSON.stringify(profileData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2));
      const result = await actor.createProfile(userEmail, profileData);
      console.log('Canister result:', JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2));
      
      if ('ok' in result) {
        console.log('Service published to canister successfully');
        // Serialize BigInt values in the result
        const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ));
        
        return NextResponse.json({ 
          success: true, 
          id: slug, // Return slug as the service ID
          slug: slug,
          canisterResult: serializedResult.ok 
        });
      } else {
        console.error('Failed to publish to canister:', (result as any).err);
        // Continue with local storage fallback
      }
    } catch (canisterError) {
      console.error('Canister publish error:', canisterError);
      console.error('Error details:', JSON.stringify(canisterError, null, 2));
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
      meta: {
        ...body.meta,
        overview: {
          ...body.meta?.overview,
          email: userEmail
        }
      },
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
