import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') || '';
    const userId = searchParams.get('userId');

    // If userId is provided, filter by user folder
    const searchPrefix = userId ? `user-${userId}/${prefix}` : prefix;

    const images = await S3Service.listImages(searchPrefix);

    return NextResponse.json({
      success: true,
      data: {
        images,
        count: images.length,
        prefix: searchPrefix,
      },
    });
  } catch (error) {
    console.error('Image listing error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
