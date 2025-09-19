// Test script for the project system
async function testProjectSystem() {
  try {
    console.log('🧪 Testing project system...');
    
    // Test 1: Create a new project
    console.log('\n📝 Test 1: Creating a new project...');
    const createResponse = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Build a React E-commerce Website',
        description: 'I need a professional e-commerce website built with React, Node.js, and MongoDB. The website should include user authentication, product catalog, shopping cart, and payment integration.',
        requirements: 'Must have experience with React, Node.js, MongoDB, and payment gateways. Portfolio of similar projects required.',
        budget: '$2000 - $5000',
        timeline: '4-6 weeks',
        category: 'Web Development',
        skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
        clientEmail: 'client@example.com'
      }),
    });
    
    const createResult = await createResponse.json();
    console.log('📊 Create project response:', createResult);
    
    if (createResult.success) {
      console.log('✅ Project created successfully!');
      const projectId = createResult.project.id;
      
      // Test 2: Get all projects
      console.log('\n📋 Test 2: Getting all projects...');
      const getAllResponse = await fetch('http://localhost:3000/api/projects');
      const getAllResult = await getAllResponse.json();
      console.log('📊 Get all projects response:', getAllResult);
      
      if (getAllResult.success) {
        console.log('✅ Retrieved all projects successfully!');
        console.log('📈 Total projects:', getAllResult.count);
      }
      
      // Test 3: Get open projects
      console.log('\n🔍 Test 3: Getting open projects...');
      const getOpenResponse = await fetch('http://localhost:3000/api/projects?status=open');
      const getOpenResult = await getOpenResponse.json();
      console.log('📊 Get open projects response:', getOpenResult);
      
      if (getOpenResult.success) {
        console.log('✅ Retrieved open projects successfully!');
        console.log('📈 Open projects:', getOpenResult.count);
      }
      
      // Test 4: Get project by ID
      console.log('\n🔍 Test 4: Getting project by ID...');
      const getByIdResponse = await fetch(`http://localhost:3000/api/projects/${projectId}`);
      const getByIdResult = await getByIdResponse.json();
      console.log('📊 Get project by ID response:', getByIdResult);
      
      if (getByIdResult.success) {
        console.log('✅ Retrieved project by ID successfully!');
        console.log('📝 Project title:', getByIdResult.project.title);
      }
      
      // Test 5: Apply to project
      console.log('\n📝 Test 5: Applying to project...');
      const applyResponse = await fetch(`http://localhost:3000/api/projects/${projectId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freelancerEmail: 'freelancer@example.com',
          proposal: 'I have 5+ years of experience building e-commerce websites with React and Node.js. I can deliver a high-quality, scalable solution within your timeline.',
          whyFit: 'I have successfully completed 20+ e-commerce projects and have expertise in payment integration, user authentication, and database design.',
          estimatedTime: '4 weeks',
          bidAmount: '$3500'
        }),
      });
      
      const applyResult = await applyResponse.json();
      console.log('📊 Apply to project response:', applyResult);
      
      if (applyResult.success) {
        console.log('✅ Application submitted successfully!');
        const applicationId = applyResult.application.id;
        
        // Test 6: Get project applications
        console.log('\n📋 Test 6: Getting project applications...');
        const getApplicationsResponse = await fetch(`http://localhost:3000/api/projects/${projectId}/applications`);
        const getApplicationsResult = await getApplicationsResponse.json();
        console.log('📊 Get applications response:', getApplicationsResult);
        
        if (getApplicationsResult.success) {
          console.log('✅ Retrieved applications successfully!');
          console.log('📈 Applications count:', getApplicationsResult.count);
        }
        
        // Test 7: Accept application
        console.log('\n✅ Test 7: Accepting application...');
        const acceptResponse = await fetch(`http://localhost:3000/api/applications/${applicationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'Accepted'
          }),
        });
        
        const acceptResult = await acceptResponse.json();
        console.log('📊 Accept application response:', acceptResult);
        
        if (acceptResult.success) {
          console.log('✅ Application accepted successfully!');
        }
      }
      
      // Test 8: Get freelancer applications
      console.log('\n👤 Test 8: Getting freelancer applications...');
      const getFreelancerAppsResponse = await fetch('http://localhost:3000/api/freelancer/applications?email=freelancer@example.com');
      const getFreelancerAppsResult = await getFreelancerAppsResponse.json();
      console.log('📊 Get freelancer applications response:', getFreelancerAppsResult);
      
      if (getFreelancerAppsResult.success) {
        console.log('✅ Retrieved freelancer applications successfully!');
        console.log('📈 Applications count:', getFreelancerAppsResult.count);
      }
    } else {
      console.log('❌ Project creation failed');
      console.log('🚨 Error:', createResult.error);
    }
    
  } catch (error) {
    console.log('❌ Project system test FAILED with exception');
    console.log('🚨 Error:', error.message);
  }
}

testProjectSystem();
