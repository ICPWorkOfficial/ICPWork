# S3 API Documentation - Tebi.io Integration

This document describes the S3 API implementation for storing images using Tebi.io as the backend storage service.

## Overview

The S3 API provides a complete solution for image storage and management using Tebi.io's S3-compatible object storage. It includes:

- Image upload functionality
- Signed URL generation for direct client uploads
- Image metadata retrieval
- Image listing and management
- Image deletion
- React components for easy integration

## Setup

### 1. Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Tebi.io S3 Configuration
TEBI_ACCESS_KEY_ID=your_tebi_access_key_id
TEBI_SECRET_ACCESS_KEY=your_tebi_secret_access_key
TEBI_BUCKET_NAME=icpwork-images
```

### 2. Tebi.io Account Setup

1. Create an account on [Tebi.io](https://tebi.io)
2. Navigate to the "Keys" section to generate access keys
3. Create a bucket for storing images
4. Configure the environment variables with your credentials

## API Endpoints

### 1. Upload Image

**POST** `/api/images/upload`

Upload an image file to Tebi.io S3 storage.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Image file (required)
  - `userId`: User ID for organization (optional)
  - `folder`: Folder name for organization (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "test-uploads/user-123/1703123456789-abc123.jpg",
    "url": "https://icpwork-images.s3.tebi.io/test-uploads/user-123/1703123456789-abc123.jpg",
    "originalName": "profile.jpg",
    "size": 1024000,
    "contentType": "image/jpeg"
  }
}
```

### 2. Get Signed Upload URL

**POST** `/api/images/signed-url`

Generate a signed URL for direct client upload to S3.

**Request:**
```json
{
  "key": "test-uploads/user-123/image.jpg",
  "contentType": "image/jpeg",
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://icpwork-images.s3.tebi.io/test-uploads/user-123/image.jpg?...",
    "key": "test-uploads/user-123/image.jpg",
    "expiresIn": 3600
  }
}
```

### 3. Get Image Metadata

**GET** `/api/images/{key}`

Retrieve metadata for a specific image.

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "test-uploads/user-123/image.jpg",
    "url": "https://icpwork-images.s3.tebi.io/test-uploads/user-123/image.jpg",
    "size": 1024000,
    "contentType": "image/jpeg",
    "lastModified": "2023-12-21T10:30:00.000Z"
  }
}
```

### 4. Get Signed Download URL

**GET** `/api/images/{key}?action=signed-url&expiresIn=3600`

Get a signed URL for downloading private images.

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://icpwork-images.s3.tebi.io/test-uploads/user-123/image.jpg?...",
    "key": "test-uploads/user-123/image.jpg",
    "expiresIn": 3600
  }
}
```

### 5. List Images

**GET** `/api/images/list?prefix=test-uploads&userId=123`

List images with optional filtering.

**Query Parameters:**
- `prefix`: Folder prefix to filter by
- `userId`: User ID to filter by

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "key": "test-uploads/user-123/image1.jpg",
        "url": "https://icpwork-images.s3.tebi.io/test-uploads/user-123/image1.jpg",
        "size": 1024000,
        "contentType": "image/*",
        "lastModified": "2023-12-21T10:30:00.000Z"
      }
    ],
    "count": 1,
    "prefix": "test-uploads/user-123"
  }
}
```

### 6. Delete Image

**DELETE** `/api/images/{key}`

Delete an image from S3 storage.

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Client-Side Usage

### React Hook

```typescript
import { useImageUpload } from '@/lib/image-upload-utils';

function MyComponent() {
  const { uploadImage, uploadWithSignedUrl } = useImageUpload();

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadImage(file, {
        userId: 'user-123',
        folder: 'profile-images',
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress.percentage}%`);
        },
        onSuccess: (result) => {
          console.log('Upload successful:', result.url);
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      }}
    />
  );
}
```

### React Component

```typescript
import { ImageUploader } from '@/components/ImageUploader';

function MyPage() {
  return (
    <ImageUploader
      userId="user-123"
      folder="profile-images"
      maxFiles={5}
      onUploadSuccess={(result) => {
        console.log('Upload successful:', result);
      }}
      onUploadError={(error) => {
        console.error('Upload failed:', error);
      }}
    />
  );
}
```

## File Organization

Images are organized in the following structure:

```
bucket-name/
├── profile-images/
│   └── user-123/
│       ├── 1703123456789-abc123.jpg
│       └── 1703123456790-def456.png
├── portfolio-images/
│   └── user-456/
│       └── 1703123456791-ghi789.jpg
└── temp-uploads/
    └── 1703123456792-jkl012.jpg
```

## File Validation

The API validates uploaded files with the following rules:

- **Allowed formats**: JPEG, PNG, GIF, WebP
- **Maximum file size**: 10MB
- **File type validation**: Based on MIME type
- **Unique naming**: Timestamp + random ID to prevent conflicts

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:
- Invalid file type
- File size too large
- Missing credentials
- Network errors
- S3 service errors

## Testing

Run the test script to verify the S3 integration:

```bash
cd frontend
node test-s3-api.js
```

Make sure to:
1. Set up your Tebi.io credentials in `.env.local`
2. Start the Next.js development server
3. Run the test script

## Security Considerations

1. **Access Keys**: Store Tebi.io credentials securely in environment variables
2. **File Validation**: Always validate file types and sizes on both client and server
3. **Signed URLs**: Use signed URLs for private content with appropriate expiration times
4. **User Isolation**: Organize files by user ID to prevent unauthorized access
5. **CORS**: Configure CORS headers appropriately for your domain

## Performance Tips

1. **Direct Upload**: Use signed URLs for large files to reduce server load
2. **Image Optimization**: Consider implementing image resizing/compression
3. **CDN**: Use a CDN for faster image delivery
4. **Caching**: Implement appropriate caching headers
5. **Batch Operations**: Use batch operations for multiple file uploads

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check Tebi.io credentials and bucket permissions
2. **CORS Errors**: Ensure CORS is configured correctly
3. **File Upload Fails**: Verify file size and type restrictions
4. **Signed URL Expired**: Check expiration time settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed error messages and request/response logging.
