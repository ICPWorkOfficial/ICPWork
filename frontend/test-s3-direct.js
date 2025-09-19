/**
 * Direct S3 service test without Next.js API
 * This tests the S3 service configuration directly
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
    console.log('✅ Environment variables loaded from .env');
  }
} catch (error) {
  console.log('❌ Could not load environment variables:', error.message);
  process.exit(1);
}

// Tebi.io S3 Configuration
const s3Client = new S3Client({
  endpoint: 'https://s3.tebi.io',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY_ID,
    secretAccessKey: process.env.TEBI_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.TEBI_BUCKET_NAME;

async function testS3Direct() {
  console.log('🧪 Testing Tebi.io S3 Connection Directly...\n');

  console.log('📋 Configuration:');
  console.log(`   Endpoint: https://s3.tebi.io`);
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Access Key: ${process.env.TEBI_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log(`   Region: us-east-1`);

  // Test 1: List objects in bucket
  console.log('\n1️⃣ Testing bucket access (list objects)...');
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 5,
    });

    const listResponse = await s3Client.send(listCommand);
    console.log('✅ Bucket access successful!');
    console.log(`   Objects found: ${listResponse.Contents?.length || 0}`);
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log('   Recent objects:');
      listResponse.Contents.slice(0, 3).forEach((obj, index) => {
        console.log(`     ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    }
  } catch (error) {
    console.log('❌ Bucket access failed:', error.message);
    console.log('   Error code:', error.name);
    console.log('   This might indicate:');
    console.log('   - Invalid credentials');
    console.log('   - Bucket does not exist');
    console.log('   - Network connectivity issues');
    return;
  }

  // Test 2: Upload a test file
  console.log('\n2️⃣ Testing file upload...');
  try {
    const testContent = `Test file uploaded at ${new Date().toISOString()}`;
    const testKey = `test-uploads/direct-test-${Date.now()}.txt`;

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        uploadedBy: 'direct-test',
        uploadedAt: new Date().toISOString(),
      },
    });

    const putResponse = await s3Client.send(putCommand);
    console.log('✅ File upload successful!');
    console.log(`   Key: ${testKey}`);
    console.log(`   ETag: ${putResponse.ETag}`);
    console.log(`   URL: https://${BUCKET_NAME}.s3.tebi.io/${testKey}`);

    // Test 3: Verify the uploaded file
    console.log('\n3️⃣ Verifying uploaded file...');
    try {
      const verifyUrl = `https://${BUCKET_NAME}.s3.tebi.io/${testKey}`;
      const response = await fetch(verifyUrl);
      
      if (response.ok) {
        const content = await response.text();
        if (content === testContent) {
          console.log('✅ File verification successful!');
          console.log('   Content matches uploaded data');
        } else {
          console.log('⚠️  File accessible but content differs');
        }
      } else {
        console.log('❌ File not accessible:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Error verifying file:', error.message);
    }

  } catch (error) {
    console.log('❌ File upload failed:', error.message);
    console.log('   Error code:', error.name);
    console.log('   This might indicate:');
    console.log('   - Insufficient permissions');
    console.log('   - Bucket policy restrictions');
    console.log('   - Network connectivity issues');
  }

  console.log('\n🏁 Direct S3 test completed!');
}

// Run the test
testS3Direct().catch(console.error);
