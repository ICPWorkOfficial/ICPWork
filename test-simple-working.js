#!/usr/bin/env node

/**
 * Simple Working ICP Canisters Testing Script
 * Tests canisters using basic HTTP requests
 * Run with: node test-simple-working.js
 */

import { HttpAgent, AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Configuration
const CANISTER_IDS = {
  userManagement: Principal.fromText('vg3po-ix777-77774-qaafa-cai'),
  projectStore: Principal.fromText('vu5yx-eh777-77774-qaaga-cai')
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
const identity = new AnonymousIdentity();
const agent = new HttpAgent({ 
  host: HOST,
  identity,
  verifyQuerySignatures: false,
  verifyUpdateSignatures: false,
  fetchRootKey: true
});

await agent.fetchRootKey();

// Test results tracking
const testResults = {
  userManagement: { passed: 0, failed: 0, tests: [] },
  projectStore: { passed: 0, failed: 0, tests: [] }
};

// Helper functions
function logTest(operation, result, canister) {
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
    console.log(`❌ ${operation}: FAILED`);
    console.log('Error:', testResult.error);
  }
}

async function testUserManagement() {
  console.log('\n👤 ===== USER MANAGEMENT CANISTER TESTS =====\n');

  try {
    // Test 1: Register Freelancer
    console.log('📝 Test 1: Registering freelancer...');
    try {
      const registerFreelancerResult = await agent.call(
        CANISTER_IDS.userManagement,
        'registerUser',
        {
          email: testData.freelancer.email,
          password: testData.freelancer.password,
          userType: testData.freelancer.userType
        }
      );
      logTest('Register Freelancer', registerFreelancerResult, 'userManagement');
    } catch (error) {
      console.log(`❌ Register Freelancer: FAILED - ${error.message}`);
      testResults.userManagement.failed++;
    }

    // Test 2: Register Client
    console.log('\n📝 Test 2: Registering client...');
    try {
      const registerClientResult = await agent.call(
        CANISTER_IDS.userManagement,
        'registerUser',
        {
          email: testData.client.email,
          password: testData.client.password,
          userType: testData.client.userType
        }
      );
      logTest('Register Client', registerClientResult, 'userManagement');
    } catch (error) {
      console.log(`❌ Register Client: FAILED - ${error.message}`);
      testResults.userManagement.failed++;
    }

    // Test 3: Login Freelancer
    console.log('\n🔐 Test 3: Logging in freelancer...');
    try {
      const loginFreelancerResult = await agent.call(
        CANISTER_IDS.userManagement,
        'loginUser',
        {
          email: testData.freelancer.email,
          password: testData.freelancer.password
        }
      );
      logTest('Login Freelancer', loginFreelancerResult, 'userManagement');
    } catch (error) {
      console.log(`❌ Login Freelancer: FAILED - ${error.message}`);
      testResults.userManagement.failed++;
    }

    // Test 4: Get User by Email
    console.log('\n🔍 Test 4: Getting user by email...');
    try {
      const getUserResult = await agent.query(
        CANISTER_IDS.userManagement,
        'getUser',
        { email: testData.freelancer.email }
      );
      logTest('Get User by Email', getUserResult, 'userManagement');
    } catch (error) {
      console.log(`❌ Get User by Email: FAILED - ${error.message}`);
      testResults.userManagement.failed++;
    }

    // Test 5: Get All Users
    console.log('\n📋 Test 5: Getting all users...');
    try {
      const allUsers = await agent.query(
        CANISTER_IDS.userManagement,
        'getAllUsers',
        {}
      );
      logTest('Get All Users', allUsers, 'userManagement');
    } catch (error) {
      console.log(`❌ Get All Users: FAILED - ${error.message}`);
      testResults.userManagement.failed++;
    }

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
    try {
      const projectResult = await agent.call(
        CANISTER_IDS.projectStore,
        'createProject',
        {
          title: 'Build DeFi Analytics Dashboard',
          description: 'Create a comprehensive DeFi analytics dashboard with real-time data visualization, portfolio tracking, and yield farming analytics.',
          requirements: 'Must use React, TypeScript, and Web3 libraries. Include interactive charts, real-time data feeds, portfolio tracking, yield farming calculators, and risk assessment tools.',
          budget: '$8000',
          timeline: '6 weeks',
          category: 'Web Development',
          skills: ['React', 'TypeScript', 'Web3', 'Chart.js', 'D3.js', 'Ethers.js'],
          clientEmail: testData.client.email
        }
      );
      logTest('Create Project', projectResult, 'projectStore');
    } catch (error) {
      console.log(`❌ Create Project: FAILED - ${error.message}`);
      testResults.projectStore.failed++;
    }

    // Test 2: Get All Projects
    console.log('\n📋 Test 2: Getting all projects...');
    try {
      const allProjects = await agent.query(
        CANISTER_IDS.projectStore,
        'getAllProjects',
        {}
      );
      logTest('Get All Projects', allProjects, 'projectStore');
    } catch (error) {
      console.log(`❌ Get All Projects: FAILED - ${error.message}`);
      testResults.projectStore.failed++;
    }

    // Test 3: Get Open Projects
    console.log('\n🔓 Test 3: Getting open projects...');
    try {
      const openProjects = await agent.query(
        CANISTER_IDS.projectStore,
        'getOpenProjects',
        {}
      );
      logTest('Get Open Projects', openProjects, 'projectStore');
    } catch (error) {
      console.log(`❌ Get Open Projects: FAILED - ${error.message}`);
      testResults.projectStore.failed++;
    }

    // Test 4: Get Projects by Client
    console.log('\n👤 Test 4: Getting projects by client...');
    try {
      const clientProjects = await agent.query(
        CANISTER_IDS.projectStore,
        'getProjectsByClient',
        { clientEmail: testData.client.email }
      );
      logTest('Get Projects by Client', clientProjects, 'projectStore');
    } catch (error) {
      console.log(`❌ Get Projects by Client: FAILED - ${error.message}`);
      testResults.projectStore.failed++;
    }

    // Test 5: Get Project Statistics
    console.log('\n📈 Test 5: Getting project statistics...');
    try {
      const stats = await agent.query(
        CANISTER_IDS.projectStore,
        'getProjectStats',
        {}
      );
      logTest('Get Project Stats', stats, 'projectStore');
    } catch (error) {
      console.log(`❌ Get Project Stats: FAILED - ${error.message}`);
      testResults.projectStore.failed++;
    }

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
