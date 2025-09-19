/**
 * Test script to verify Tebi.io S3 connection and upload functionality
 * Run with: node test-tebi-connection.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const API_BASE_URL = 'http://localhost:3000/api';

async function testTebiConnection() {
  console.log('🧪 Testing Tebi.io S3 Connection...\n');

  // Check if environment variables are set
  console.log('1️⃣ Checking environment variables...');
  const requiredEnvVars = [
    'TEBI_ACCESS_KEY_ID',
    'TEBI_SECRET_ACCESS_KEY', 
    'TEBI_BUCKET_NAME'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please set these in your .env.local file:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}=your_value_here`);
    });
    return;
  }
  
  console.log('✅ Environment variables are set');
  console.log(`   Bucket: ${process.env.TEBI_BUCKET_NAME}`);
  console.log(`   Access Key: ${process.env.TEBI_ACCESS_KEY_ID?.substring(0, 8)}...`);

  // Test 1: Create a test image file
  console.log('\n2️⃣ Creating test image file...');
  const testImagePath = path.join(__dirname, 'test-image.txt');
  const testContent = 'This is a test file for Tebi.io S3 upload verification.';
  fs.writeFileSync(testImagePath, testContent);
  console.log('✅ Test file created:', testImagePath);

  // Test 2: Test image upload API
  console.log('\n3️⃣ Testing image upload API...');
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-upload.txt',
      contentType: 'text/plain'
    });
    formData.append('userId', 'test-user-123');
    formData.append('folder', 'test-uploads');

    console.log('   Uploading test file...');
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log('   Key:', result.data.key);
      console.log('   URL:', result.data.url);
      console.log('   Size:', result.data.size, 'bytes');
      console.log('   Content Type:', result.data.contentType);
      
      // Test 3: Verify the uploaded file is accessible
      console.log('\n4️⃣ Testing file accessibility...');
      try {
        const urlResponse = await fetch(result.data.url);
        if (urlResponse.ok) {
          const content = await urlResponse.text();
          if (content === testContent) {
            console.log('✅ File is accessible and content matches!');
          } else {
            console.log('⚠️  File is accessible but content differs');
          }
        } else {
          console.log('❌ File is not accessible:', urlResponse.status, urlResponse.statusText);
        }
      } catch (error) {
        console.log('❌ Error accessing uploaded file:', error.message);
      }

      // Test 4: Test image metadata retrieval
      console.log('\n5️⃣ Testing metadata retrieval...');
      try {
        const metadataResponse = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(result.data.key)}`);
        const metadataResult = await metadataResponse.json();
        
        if (metadataResult.success) {
          console.log('✅ Metadata retrieval successful!');
          console.log('   Key:', metadataResult.data.key);
          console.log('   Size:', metadataResult.data.size);
          console.log('   Last Modified:', metadataResult.data.lastModified);
        } else {
          console.log('❌ Metadata retrieval failed:', metadataResult.error);
        }
      } catch (error) {
        console.log('❌ Error retrieving metadata:', error.message);
      }

      // Test 5: Test signed URL generation
      console.log('\n6️⃣ Testing signed URL generation...');
      try {
        const signedUrlResponse = await fetch(`${API_BASE_URL}/images/signed-url`, {
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

        const signedUrlResult = await signedUrlResponse.json();
        
        if (signedUrlResult.success) {
          console.log('✅ Signed URL generation successful!');
          console.log('   Key:', signedUrlResult.data.key);
          console.log('   Expires In:', signedUrlResult.data.expiresIn, 'seconds');
          console.log('   Signed URL:', signedUrlResult.data.signedUrl.substring(0, 100) + '...');
        } else {
          console.log('❌ Signed URL generation failed:', signedUrlResult.error);
        }
      } catch (error) {
        console.log('❌ Error generating signed URL:', error.message);
      }

    } else {
      console.log('❌ Upload failed:', result.error);
      console.log('   Response status:', response.status);
      console.log('   Full response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ Upload request failed:', error.message);
    console.log('   Make sure your Next.js development server is running on port 3000');
  }

  // Cleanup
  console.log('\n7️⃣ Cleaning up...');
  try {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('✅ Test file cleaned up');
    }
  } catch (error) {
    console.log('⚠️  Could not clean up test file:', error.message);
  }

  console.log('\n🏁 Tebi.io connection test completed!');
}

// Check if we're running this script directly
if (require.main === module) {
  // Load environment variables from .env.local or .env
  try {
    const envLocalPath = path.join(__dirname, '.env.local');
    const envPath = path.join(__dirname, '.env');
    
    let envFile = null;
    if (fs.existsSync(envLocalPath)) {
      envFile = envLocalPath;
      console.log('📁 Loading environment variables from .env.local');
    } else if (fs.existsSync(envPath)) {
      envFile = envPath;
      console.log('📁 Loading environment variables from .env');
    }
    
    if (envFile) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
      console.log('✅ Environment variables loaded successfully');
    } else {
      console.log('⚠️  No .env.local or .env file found, using system environment variables');
    }
  } catch (error) {
    console.log('⚠️  Could not load environment file:', error.message);
  }

  testTebiConnection().catch(console.error);
}

module.exports = { testTebiConnection };
