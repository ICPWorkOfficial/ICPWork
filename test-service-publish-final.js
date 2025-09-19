// Test script for service publish endpoint with proper session handling
const testData = {
  overview: {
    serviceTitle: "Test Web Development Service",
    mainCategory: "Development",
    subCategory: "Web Development",
    description: "Professional web development services",
    email: "gursagar2003@gmail.com" // This will be overridden by session email
  },
  projectTiers: {
    Basic: {
      title: "Basic Website",
      description: "Simple website with basic features",
      price: "100"
    },
    Advanced: {
      title: "Advanced Website",
      description: "Website with advanced features and database",
      price: "250"
    },
    Premium: {
      title: "Premium Website",
      description: "Full-featured website with custom design",
      price: "500"
    }
  },
  additionalCharges: [
    {
      name: "Fast Delivery",
      price: "50"
    },
    {
      name: "Additional Changes",
      price: "25"
    }
  ],
  portfolioImages: [],
  questions: [
    {
      question: "What type of website do you need?",
      type: "text",
      options: []
    }
  ]
};

async function testServicePublishWithSession() {
  try {
    console.log('🧪 Testing service publish endpoint with proper session handling...');
    
    // First, login to get a session
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'gursagar2003@gmail.com',
        password: 'Sagar2003@'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('🔐 Login result:', loginResult);
    
    if (!loginResult.success) {
      console.log('❌ Login failed, cannot test service publish');
      return;
    }
    
    // Extract session cookie from login response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('🍪 Session cookie:', setCookieHeader);
    
    // Test service publish with session
    console.log('📤 Testing service publish with session...');
    const response = await fetch('http://localhost:3000/api/service/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader || ''
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Service publish test PASSED!');
      console.log('🎉 Service created successfully with ID:', result.id);
      console.log('📧 User email used:', result.profile?.email);
    } else {
      console.log('❌ Service publish test FAILED');
      console.log('🚨 Error:', result.error);
      if (result.details) {
        console.log('🔍 Details:', result.details);
      }
    }
  } catch (error) {
    console.log('❌ Service publish test FAILED with exception');
    console.log('🚨 Error:', error.message);
  }
}

testServicePublishWithSession();
