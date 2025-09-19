// Test script for service publish endpoint
const testData = {
  overview: {
    serviceTitle: "Test Web Development Service",
    mainCategory: "Development",
    subCategory: "Web Development",
    description: "Professional web development services",
    email: "test@example.com"
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

async function testServicePublish() {
  try {
    console.log('Testing service publish endpoint...');
    
    const response = await fetch('http://localhost:3000/api/service/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Service publish test PASSED');
    } else {
      console.log('❌ Service publish test FAILED');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Service publish test FAILED with exception');
    console.log('Error:', error.message);
  }
}

testServicePublish();
