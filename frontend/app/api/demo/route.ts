import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Demo API route is working!',
    timestamp: new Date().toISOString(),
    data: {
      canisters: {
        user_management: 'vt46d-j7777-77774-qaagq-cai',
        message_store: 'vizcg-th777-77774-qaaea-cai',
        onboarding_store: 'vpyes-67777-77774-qaaeq-cai',
        bounties_store: 'uxrrr-q7777-77774-qaaaq-cai',
        freelancer_dashboard: 'umunu-kh777-77774-qaaca-cai',
        client_data: 'u6s2n-gx777-77774-qaaba-cai',
        freelancer_data: 'ulvla-h7777-77774-qaacq-cai',
        escrow: 'uzt4z-lp777-77774-qaabq-cai',
        job_posting: 'ucwa4-rx777-77774-qaada-cai'
      }
    }
  });
}
