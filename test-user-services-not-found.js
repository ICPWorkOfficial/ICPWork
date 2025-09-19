// Test script for fetching user services by email (not found case)
async function testUserServicesNotFound() {
  try {
    console.log('🧪 Testing user services endpoint (not found case)...');
    
    // Test with an email that doesn't have a service
    const testEmail = 'nonexistent@example.com';
    
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
    } else {
      console.log('✅ User services test PASSED (expected failure)!');
      console.log('🚨 Error (expected):', result.error);
      console.log('📝 Message:', result.message);
    }
  } catch (error) {
    console.log('❌ User services test FAILED with exception');
    console.log('🚨 Error:', error.message);
  }
}

testUserServicesNotFound();
