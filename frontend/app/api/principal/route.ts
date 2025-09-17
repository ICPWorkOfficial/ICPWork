import { NextResponse } from 'next/server';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export async function GET() {
  try {
    // Create an agent to get the anonymous principal
    const agent = new HttpAgent({ 
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      verifyUpdateSignatures: false,
      fetchRootKey: true
    });
    
    await agent.fetchRootKey();
    
    // Get the anonymous principal (for development)
    const anonymousPrincipal = Principal.anonymous();
    
    return NextResponse.json({ 
      success: true,
      principalId: anonymousPrincipal.toText(),
      canisterIds: {
        main: 'ulvla-h7777-77774-qaacq-cai',
        userManagement: 'vizcg-th777-77774-qaaea-cai',
        clientData: 'u6s2n-gx777-77774-qaaba-cai',
        freelancerData: 'umunu-kh777-77774-qaaca-cai',
        escrow: 'uzt4z-lp777-77774-qaabq-cai'
      }
    });
  } catch (error) {
    console.error('Get principal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
