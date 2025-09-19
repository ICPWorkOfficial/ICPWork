/**
 * Test script for S3 API integration with Tebi.io
 * Run with: node test-s3-api.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_IMAGE_PATH = path.join(__dirname, 'public', 'logo.svg'); // Using existing logo as test

async function testS3API() {
  console.log('🧪 Testing S3 API Integration with Tebi.io...\n');

  try {
    // Test 1: Upload an image
    console.log('1️⃣ Testing image upload...');
    await testImageUpload();

    // Test 2: Get signed URL
    console.log('\n2️⃣ Testing signed URL generation...');
    await testSignedURL();

    // Test 3: List images
    console.log('\n3️⃣ Testing image listing...');
    await testImageListing();

    // Test 4: Get image metadata
    console.log('\n4️⃣ Testing image metadata retrieval...');
    await testImageMetadata();

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testImageUpload() {
  try {
    // Create a simple test image file if it doesn't exist
    const testImagePath = path.join(__dirname, 'test-image.txt');
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, 'This is a test image content');
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.txt',
      contentType: 'text/plain'
    });
    formData.append('userId', 'test-user-123');
    formData.append('folder', 'test-uploads');

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Image upload successful');
      console.log('   Key:', result.data.key);
      console.log('   URL:', result.data.url);
      return result.data.key;
    } else {
      console.log('❌ Image upload failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Image upload error:', error.message);
    return null;
  }
}

async function testSignedURL() {
  try {
    const response = await fetch(`${API_BASE_URL}/images/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'test-signed-url.txt',
        contentType: 'text/plain',
        expiresIn: 3600,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Signed URL generation successful');
      console.log('   URL:', result.data.signedUrl);
    } else {
      console.log('❌ Signed URL generation failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Signed URL error:', error.message);
  }
}

async function testImageListing() {
  try {
    const response = await fetch(`${API_BASE_URL}/images/list?prefix=test-uploads&userId=test-user-123`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Image listing successful');
      console.log('   Count:', result.data.count);
      console.log('   Images:', result.data.images.map(img => img.key));
    } else {
      console.log('❌ Image listing failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Image listing error:', error.message);
  }
}

async function testImageMetadata() {
  try {
    const testKey = 'test-uploads/user-test-user-123/test-image.txt';
    const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(testKey)}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Image metadata retrieval successful');
      console.log('   Key:', result.data.key);
      console.log('   Size:', result.data.size);
      console.log('   Content Type:', result.data.contentType);
    } else {
      console.log('❌ Image metadata retrieval failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Image metadata error:', error.message);
  }
}

// Run the tests
testS3API();
