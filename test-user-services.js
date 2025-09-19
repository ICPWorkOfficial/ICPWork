// Test script for fetching user services by email
async function testUserServices() {
  try {
    console.log('🧪 Testing user services endpoint...');
    
    // Test with the email that we know has a service
    const testEmail = 'user@example.com';
    
    const response = await fetch(`http://localhost:3000/api/services/user/${testEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ User services test PASSED!');
      console.log('🎉 Service retrieved successfully for:', testEmail);
      console.log('📧 Service title:', result.service?.overview?.serviceTitle);
      console.log('🏷️ Category:', result.service?.overview?.mainCategory);
    } else {
      console.log('❌ User services test FAILED');
      console.log('🚨 Error:', result.error);
      if (result.details) {
        console.log('🔍 Details:', result.details);
      }
    }
  } catch (error) {
    console.log('❌ User services test FAILED with exception');
    console.log('🚨 Error:', error.message);
  }
}

testUserServices();
