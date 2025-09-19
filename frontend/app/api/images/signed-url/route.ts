import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, contentType, expiresIn = 3600 } = body;

    if (!key || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Key and contentType are required' },
        { status: 400 }
      );
    }

    // Generate signed URL for direct client upload
    const signedUrl = await S3Service.getSignedUploadUrl(key, contentType, expiresIn);

    return NextResponse.json({
      success: true,
      data: {
        signedUrl,
        key,
        expiresIn,
      },
    });
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
