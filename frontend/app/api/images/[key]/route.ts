import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

// GET - Retrieve image metadata or signed URL
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Image key is required' },
        { status: 400 }
      );
    }

    // Decode the key (it might be URL encoded)
    const decodedKey = decodeURIComponent(key);

    if (action === 'signed-url') {
      // Return signed URL for private access
      const signedUrl = await S3Service.getSignedDownloadUrl(decodedKey, expiresIn);
      return NextResponse.json({
        success: true,
        data: {
          signedUrl,
          key: decodedKey,
          expiresIn,
        },
      });
    } else {
      // Return image metadata
      const metadata = await S3Service.getImageMetadata(decodedKey);
      
      if (!metadata) {
        return NextResponse.json(
          { success: false, error: 'Image not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: metadata,
      });
    }
  } catch (error) {
    console.error('Image retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an image
export async function DELETE(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Image key is required' },
        { status: 400 }
      );
    }

    // Decode the key
    const decodedKey = decodeURIComponent(key);

    const success = await S3Service.deleteImage(decodedKey);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Image deletion error:', error);
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
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
