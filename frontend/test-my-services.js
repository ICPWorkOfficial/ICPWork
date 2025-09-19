/**
 * Test script to verify My Services dashboard functionality
 * Run with: node test-my-services.js
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testMyServices() {
  console.log('🧪 Testing My Services Dashboard Functionality...\n');

  // Test 1: Check if dashboard is accessible
  console.log('1️⃣ Testing dashboard accessibility...');
  try {
    const response = await fetch('http://localhost:3000/dashboard');
    if (response.ok) {
      console.log('✅ Dashboard is accessible');
    } else {
      console.log('❌ Dashboard returned status:', response.status);
    }
  } catch (error) {
    console.log('❌ Dashboard not accessible:', error.message);
    console.log('   Make sure the Next.js development server is running');
    return;
  }

  // Test 2: Test user services API
  console.log('\n2️⃣ Testing user services API...');
  const testEmail = 'test@example.com';
  try {
    const response = await fetch(`${API_BASE_URL}/services/user/${encodeURIComponent(testEmail)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User services API working');
      console.log('   Service Title:', data.service.overview.serviceTitle);
      console.log('   Category:', data.service.overview.mainCategory);
      console.log('   Basic Price:', data.service.projectTiers.Basic.price);
      console.log('   Is Active:', data.service.isActive);
    } else {
      console.log('❌ User services API failed:', data.error);
    }
  } catch (error) {
    console.log('❌ User services API error:', error.message);
  }

  // Test 3: Test general services API
  console.log('\n3️⃣ Testing general services API...');
  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ General services API working');
      console.log('   Services count:', data.count);
    } else {
      console.log('❌ General services API failed:', data.error);
    }
  } catch (error) {
    console.log('❌ General services API error:', error.message);
  }

  console.log('\n🏁 My Services dashboard test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Navigate to http://localhost:3000/dashboard');
  console.log('2. Click on "My Services" in the sidebar');
  console.log('3. You should see your services displayed');
  console.log('4. Test the edit, delete, and toggle active functionality');
}

// Run the test
testMyServices().catch(console.error);
