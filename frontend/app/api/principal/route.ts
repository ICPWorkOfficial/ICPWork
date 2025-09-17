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
        main: 'umunu-kh777-77774-qaaca-cai',
        clientData: 'uxrrr-q7777-77774-qaaaq-cai',
        freelancerData: 'uzt4z-lp777-77774-qaabq-cai',
        escrow: 'u6s2n-gx777-77774-qaaba-cai'
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
