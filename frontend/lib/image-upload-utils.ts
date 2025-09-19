/**
 * Client-side utilities for image upload with S3 API
 */

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  userId?: string;
  folder?: string;
}

export class ImageUploader {
  /**
   * Upload image using the S3 API
   */
  static async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<any> {
    const { onProgress, onSuccess, onError, userId, folder } = options;

    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      if (userId) formData.append('userId', userId);
      if (folder) formData.append('folder', folder);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                onSuccess?.(result.data);
                resolve(result.data);
              } else {
                const error = result.error || 'Upload failed';
                onError?.(error);
                reject(new Error(error));
              }
            } catch (parseError) {
              const error = 'Failed to parse response';
              onError?.(error);
              reject(new Error(error));
            }
          } else {
            const error = `Upload failed with status ${xhr.status}`;
            onError?.(error);
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          const error = 'Network error during upload';
          onError?.(error);
          reject(new Error(error));
        });

        xhr.open('POST', '/api/images/upload');
        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Get signed URL for direct client upload
   */
  static async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const response = await fetch('/api/images/signed-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        contentType,
        expiresIn,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get signed URL');
    }

    return result.data.signedUrl;
  }

  /**
   * Upload directly to S3 using signed URL
   */
  static async uploadDirectToS3(
    file: File,
    signedUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
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
   * Get image URL from key
   */
  static getImageUrl(key: string, bucketName: string = 'icpwork-images'): string {
    return `https://${bucketName}.s3.tebi.io/${key}`;
  }

  /**
   * Get signed download URL for private images
   */
  static async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const response = await fetch(
      `/api/images/${encodeURIComponent(key)}?action=signed-url&expiresIn=${expiresIn}`
    );
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get signed download URL');
    }

    return result.data.signedUrl;
  }
}

/**
 * React hook for image upload
 */
export function useImageUpload() {
  const uploadImage = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<any> => {
    return ImageUploader.uploadImage(file, options);
  };

  const uploadWithSignedUrl = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<any> => {
    const { userId, folder } = options;
    
    // Generate key
    const key = ImageUploader.generateImageKey(file.name, userId, folder);
    
    // Get signed URL
    const signedUrl = await ImageUploader.getSignedUploadUrl(key, file.type);
    
    // Upload directly to S3
    await ImageUploader.uploadDirectToS3(file, signedUrl, options.onProgress);
    
    // Return the result
    const result = {
      key,
      url: ImageUploader.getImageUrl(key),
      originalName: file.name,
      size: file.size,
      contentType: file.type,
    };
    
    options.onSuccess?.(result);
    return result;
  };

  return {
    uploadImage,
    uploadWithSignedUrl,
    generateImageKey: ImageUploader.generateImageKey,
    getImageUrl: ImageUploader.getImageUrl,
    getSignedDownloadUrl: ImageUploader.getSignedDownloadUrl,
  };
}
