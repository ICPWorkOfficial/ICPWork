#!/usr/bin/env node

/**
 * All-in-One ICP Canisters Testing Script (Simplified)
 * Tests available canisters: User Management and Project Store
 * Run with: node test-all-canisters-simple.js
 */

import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory as userManagementIdl } from './frontend/declarations/user_management/user_management.did.js';
import { idlFactory as projectStoreIdl } from './frontend/declarations/project_store/project_store.did.js';

// Configuration
const CANISTER_IDS = {
  userManagement: 'vg3po-ix777-77774-qaafa-cai', // Replace with actual canister ID
  projectStore: 'vu5yx-eh777-77774-qaaga-cai'   // Replace with actual canister ID
};

const HOST = 'http://127.0.0.1:4943';

// Test data
const testData = {
  freelancer: {
    email: 'freelancer@example.com',
    password: 'FreelancerPass123!',
    userType: 'freelancer'
  },
  client: {
    email: 'client@example.com',
    password: 'ClientPass123!',
    userType: 'client'
  }
};

// Initialize agent
const agent = new HttpAgent({ 
  host: HOST,
  verifyQuerySignatures: false,
  verifyUpdateSignatures: false,
  fetchRootKey: true
});

await agent.fetchRootKey();

// Create actors for available canisters
const userManagementActor = Actor.createActor(userManagementIdl, { 
  agent, 
  canisterId: CANISTER_IDS.userManagement 
});

const projectStoreActor = Actor.createActor(projectStoreIdl, { 
  agent, 
  canisterId: CANISTER_IDS.projectStore 
});

// Test results tracking
const testResults = {
  userManagement: { passed: 0, failed: 0, tests: [] },
  projectStore: { passed: 0, failed: 0, tests: [] }
};

// Helper functions
function logTest(operation, result, canister) {
  const testResult = {
    operation,
    success: 'ok' in result,
    error: 'ok' in result ? null : result.err,
    timestamp: new Date().toISOString()
  };
  
  testResults[canister].tests.push(testResult);
  
  if (testResult.success) {
    testResults[canister].passed++;
    console.log(`✅ ${operation}: SUCCESS`);
    if (result.ok) {
      console.log('Result:', JSON.stringify(result.ok, null, 2));
    }
  } else {
    testResults[canister].failed++;
    console.log(`❌ ${operation}: FAILED`);
    console.log('Error:', result.err);
  }
}

function logQueryTest(operation, result, canister) {
  const testResult = {
    operation,
    success: result !== null && result !== undefined,
    error: result === null || result === undefined ? 'No data returned' : null,
    timestamp: new Date().toISOString()
  };
  
  testResults[canister].tests.push(testResult);
  
  if (testResult.success) {
    testResults[canister].passed++;
    console.log(`✅ ${operation}: SUCCESS`);
    console.log('Result:', JSON.stringify(result, null, 2));
  } else {
    testResults[canister].failed++;
    console.log(`❌ ${operation}: FAILED - No data returned`);
  }
}

async function testUserManagement() {
  console.log('\n👤 ===== USER MANAGEMENT CANISTER TESTS =====\n');

  try {
    // Test 1: Register Freelancer
    console.log('📝 Test 1: Registering freelancer...');
    const registerFreelancerResult = await userManagementActor.registerUser(
      testData.freelancer.email,
      testData.freelancer.password,
      testData.freelancer.userType
    );
    logTest('Register Freelancer', registerFreelancerResult, 'userManagement');

    // Test 2: Register Client
    console.log('\n📝 Test 2: Registering client...');
    const registerClientResult = await userManagementActor.registerUser(
      testData.client.email,
      testData.client.password,
      testData.client.userType
    );
    logTest('Register Client', registerClientResult, 'userManagement');

    // Test 3: Login Freelancer
    console.log('\n🔐 Test 3: Logging in freelancer...');
    const loginFreelancerResult = await userManagementActor.loginUser(
      testData.freelancer.email,
      testData.freelancer.password
    );
    logTest('Login Freelancer', loginFreelancerResult, 'userManagement');

    // Test 4: Get User by Email
    console.log('\n🔍 Test 4: Getting user by email...');
    const getUserResult = await userManagementActor.getUser(testData.freelancer.email);
    logQueryTest('Get User by Email', getUserResult, 'userManagement');

    // Test 5: Update User Profile
    console.log('\n✏️ Test 5: Updating user profile...');
    const profileData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      companyName: null,
      companyWebsite: null,
      industry: null,
      businessType: null,
      numberOfEmployees: null,
      description: 'Experienced blockchain developer with 5+ years in Web3',
      skills: ['React', 'TypeScript', 'Motoko', 'ICP', 'Web3', 'DeFi'],
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      zipCode: '94105',
      streetAddress: '123 Main St',
      photo: 'https://example.com/photo.jpg',
      linkedinProfile: 'https://linkedin.com/in/johndoe'
    };
    const updateResult = await userManagementActor.updateUserProfile(testData.freelancer.email, profileData);
    logTest('Update User Profile', updateResult, 'userManagement');

    // Test 6: Get All Users
    console.log('\n📋 Test 6: Getting all users...');
    const allUsers = await userManagementActor.getAllUsers();
    logQueryTest('Get All Users', allUsers, 'userManagement');

    // Test 7: Get Users by Type
    console.log('\n👥 Test 7: Getting users by type...');
    const freelancers = await userManagementActor.getUsersByType('freelancer');
    logQueryTest('Get Freelancers', freelancers, 'userManagement');

    const clients = await userManagementActor.getUsersByType('client');
    logQueryTest('Get Clients', clients, 'userManagement');

    console.log('\n✅ User Management tests completed!\n');

  } catch (error) {
    console.error('❌ User Management test failed:', error);
    testResults.userManagement.failed++;
  }
}

async function testProjectStore() {
  console.log('📁 ===== PROJECT STORE CANISTER TESTS =====\n');

  try {
    // Test 1: Create Project
    console.log('📝 Test 1: Creating a new project...');
    const projectResult = await projectStoreActor.createProject(
      'Build DeFi Analytics Dashboard',
      'Create a comprehensive DeFi analytics dashboard with real-time data visualization, portfolio tracking, and yield farming analytics. The dashboard should integrate with multiple DeFi protocols and provide insights for both retail and institutional users.',
      'Must use React, TypeScript, and Web3 libraries. Include interactive charts, real-time data feeds, portfolio tracking, yield farming calculators, and risk assessment tools. Should be responsive and work on both desktop and mobile.',
      '$8000',
      '6 weeks',
      'Web Development',
      ['React', 'TypeScript', 'Web3', 'Chart.js', 'D3.js', 'Ethers.js'],
      testData.client.email
    );
    logTest('Create Project', projectResult, 'projectStore');

    if (!projectResult.ok) {
      console.log('❌ Cannot continue project tests without creating project');
      return;
    }

    const projectId = projectResult.ok.id;
    console.log(`\n📋 Created project with ID: ${projectId}\n`);

    // Test 2: Get Project by ID
    console.log('🔍 Test 2: Getting project by ID...');
    const getProjectResult = await projectStoreActor.getProject(projectId);
    logQueryTest('Get Project by ID', getProjectResult, 'projectStore');

    // Test 3: Apply to Project
    console.log('\n👥 Test 3: Applying to project...');
    const applicationResult = await projectStoreActor.applyToProject(
      projectId,
      testData.freelancer.email,
      'I have 5+ years of experience in React and DeFi development. I\'ve built similar dashboards for major DeFi protocols and understand the technical requirements. My portfolio includes real-time data visualization projects and Web3 integrations.',
      'I\'m the perfect fit because I have extensive experience with Web3 libraries, real-time data visualization, and DeFi protocols. I\'ve worked on similar projects and understand the complexity of integrating multiple data sources.',
      '5 weeks',
      '$7500'
    );
    logTest('Apply to Project', applicationResult, 'projectStore');

    // Test 4: Get All Projects
    console.log('\n📋 Test 4: Getting all projects...');
    const allProjects = await projectStoreActor.getAllProjects();
    logQueryTest('Get All Projects', allProjects, 'projectStore');

    // Test 5: Get Projects by Client
    console.log('\n👤 Test 5: Getting projects by client...');
    const clientProjects = await projectStoreActor.getProjectsByClient(testData.client.email);
    logQueryTest('Get Projects by Client', clientProjects, 'projectStore');

    // Test 6: Get Open Projects
    console.log('\n🔓 Test 6: Getting open projects...');
    const openProjects = await projectStoreActor.getOpenProjects();
    logQueryTest('Get Open Projects', openProjects, 'projectStore');

    // Test 7: Get Project Applications
    console.log('\n📝 Test 7: Getting project applications...');
    const applications = await projectStoreActor.getProjectApplications(projectId);
    logQueryTest('Get Project Applications', applications, 'projectStore');

    // Test 8: Get Freelancer Applications
    console.log('\n👤 Test 8: Getting freelancer applications...');
    const freelancerApplications = await projectStoreActor.getFreelancerApplications(testData.freelancer.email);
    logQueryTest('Get Freelancer Applications', freelancerApplications, 'projectStore');

    // Test 9: Update Project Status
    console.log('\n✏️ Test 9: Updating project status...');
    const statusUpdateResult = await projectStoreActor.updateProjectStatus(projectId, { InProgress: null });
    logTest('Update Project Status', statusUpdateResult, 'projectStore');

    // Test 10: Get Project Statistics
    console.log('\n📈 Test 10: Getting project statistics...');
    const stats = await projectStoreActor.getProjectStats();
    logQueryTest('Get Project Stats', stats, 'projectStore');

    console.log('\n✅ Project Store tests completed!\n');

  } catch (error) {
    console.error('❌ Project Store test failed:', error);
    testResults.projectStore.failed++;
  }
}

function printTestSummary() {
  console.log('\n🎉 ===== TEST SUMMARY =====\n');
  
  const totalTests = Object.values(testResults).reduce((sum, canister) => sum + canister.passed + canister.failed, 0);
  const totalPassed = Object.values(testResults).reduce((sum, canister) => sum + canister.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, canister) => sum + canister.failed, 0);
  
  console.log(`📊 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%\n`);
  
  Object.entries(testResults).forEach(([canister, results]) => {
    const successRate = results.passed + results.failed > 0 ? 
      ((results.passed / (results.passed + results.failed)) * 100).toFixed(1) : 0;
    
    console.log(`📋 ${canister.toUpperCase()}:`);
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   Success Rate: ${successRate}%\n`);
  });
  
  if (totalFailed === 0) {
    console.log('🎉 All tests passed successfully! Your canisters are working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above for details.');
  }
}

async function runAllTests() {
  console.log('🚀 Starting ICP Canisters Testing...');
  console.log('=====================================');
  console.log(`Testing ${Object.keys(CANISTER_IDS).length} canisters:`);
  console.log(`- User Management: ${CANISTER_IDS.userManagement}`);
  console.log(`- Project Store: ${CANISTER_IDS.projectStore}`);
  console.log(`Host: ${HOST}\n`);

  const startTime = Date.now();

  try {
    await testUserManagement();
    await testProjectStore();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    printTestSummary();
    
    console.log(`\n⏱️  Total execution time: ${duration} seconds`);
    console.log('🏁 Testing completed!');

  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
    printTestSummary();
  }
}

// Run all tests
runAllTests();
