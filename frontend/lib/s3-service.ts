import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Tebi.io S3 Configuration
const s3Client = new S3Client({
  endpoint: 'https://s3.tebi.io',
  region: 'us-east-1', // Tebi.io uses global endpoint
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.TEBI_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for Tebi.io
});

const BUCKET_NAME = process.env.TEBI_BUCKET_NAME || 'icpwork-images';

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface ImageMetadata {
  key: string;
  url: string;
  size: number;
  contentType: string;
  lastModified: Date;
}

export class S3Service {
  /**
   * Upload an image to Tebi.io S3
   */
  static async uploadImage(
    file: Buffer | Uint8Array,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
      });

      await s3Client.send(command);

      // Generate a public URL for the uploaded image
      const url = `https://${BUCKET_NAME}.s3.tebi.io/${key}`;

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a signed URL for uploading (for direct client uploads)
   */
  static async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Get a signed URL for downloading (for private images)
   */
  static async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Get image metadata
   */
  static async getImageMetadata(key: string): Promise<ImageMetadata | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      if (!response.Metadata || !response.ContentLength || !response.LastModified) {
        return null;
      }

      return {
        key,
        url: `https://${BUCKET_NAME}.s3.tebi.io/${key}`,
        size: response.ContentLength,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified,
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }

  /**
   * List images in a folder/prefix
   */
  static async listImages(prefix: string = ''): Promise<ImageMetadata[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      });

      const response = await s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      return response.Contents.map(obj => ({
        key: obj.Key || '',
        url: `https://${BUCKET_NAME}.s3.tebi.io/${obj.Key}`,
        size: obj.Size || 0,
        contentType: 'image/*', // We'll need to get this separately if needed
        lastModified: obj.LastModified || new Date(),
      }));
    } catch (error) {
      console.error('Error listing images:', error);
      return [];
    }
  }

  /**
   * Delete an image
   */
  static async deleteImage(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Generate a unique key for an image
   */
  static generateImageKey(
    originalName: string,
    userId?: string,
    folder?: string
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    
    const prefix = folder ? `${folder}/` : '';
    const userPrefix = userId ? `user-${userId}/` : '';
    
    return `${prefix}${userPrefix}${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Validate image file type and size
   */
  static validateImage(file: File | { type: string; size: number }): {
    valid: boolean;
    error?: string;
  } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 10MB.',
      };
    }

    return { valid: true };
  }
}
