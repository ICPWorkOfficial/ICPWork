#!/usr/bin/env node

/**
 * All-in-One ICP Canisters Testing Script
 * Tests all 3 canisters: User Management, Project Store, and Hackathon Store
 * Run with: node test-all-canisters.js
 */

import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory as userManagementIdl } from './frontend/declarations/user_management/index.js';
import { idlFactory as projectStoreIdl } from './frontend/declarations/project_store/index.js';
import { idlFactory as hackathonStoreIdl } from './frontend/declarations/hackathon_store/index.js';

// Configuration
const CANISTER_IDS = {
  userManagement: 'vg3po-ix777-77774-qaafa-cai', // Replace with actual canister ID
  projectStore: 'vu5yx-eh777-77774-qaaga-cai',   // Replace with actual canister ID
  hackathonStore: 'hackathon_store_canister_id'  // Replace with actual canister ID
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
  },
  organizer: {
    email: 'organizer@example.com',
    password: 'OrganizerPass123!',
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

// Create actors for all canisters
const userManagementActor = Actor.createActor(userManagementIdl, { 
  agent, 
  canisterId: CANISTER_IDS.userManagement 
});

const projectStoreActor = Actor.createActor(projectStoreIdl, { 
  agent, 
  canisterId: CANISTER_IDS.projectStore 
});

const hackathonStoreActor = Actor.createActor(hackathonStoreIdl, { 
  agent, 
  canisterId: CANISTER_IDS.hackathonStore 
});

// Test results tracking
const testResults = {
  userManagement: { passed: 0, failed: 0, tests: [] },
  projectStore: { passed: 0, failed: 0, tests: [] },
  hackathonStore: { passed: 0, failed: 0, tests: [] },
  crossCanister: { passed: 0, failed: 0, tests: [] }
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

    // Test 3: Register Organizer
    console.log('\n📝 Test 3: Registering organizer...');
    const registerOrganizerResult = await userManagementActor.registerUser(
      testData.organizer.email,
      testData.organizer.password,
      testData.organizer.userType
    );
    logTest('Register Organizer', registerOrganizerResult, 'userManagement');

    // Test 4: Login Freelancer
    console.log('\n🔐 Test 4: Logging in freelancer...');
    const loginFreelancerResult = await userManagementActor.loginUser(
      testData.freelancer.email,
      testData.freelancer.password
    );
    logTest('Login Freelancer', loginFreelancerResult, 'userManagement');

    // Test 5: Get User by Email
    console.log('\n🔍 Test 5: Getting user by email...');
    const getUserResult = await userManagementActor.getUser(testData.freelancer.email);
    logQueryTest('Get User by Email', getUserResult, 'userManagement');

    // Test 6: Update User Profile
    console.log('\n✏️ Test 6: Updating user profile...');
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

    // Test 7: Get All Users
    console.log('\n📋 Test 7: Getting all users...');
    const allUsers = await userManagementActor.getAllUsers();
    logQueryTest('Get All Users', allUsers, 'userManagement');

    // Test 8: Get Users by Type
    console.log('\n👥 Test 8: Getting users by type...');
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

async function testHackathonStore() {
  console.log('🏆 ===== HACKATHON STORE CANISTER TESTS =====\n');

  try {
    // Test 1: Create Hackathon
    console.log('📝 Test 1: Creating a hackathon...');
    const hackathonInput = {
      title: "ICP Web3 Innovation Hackathon 2024",
      description: "Build the future of Web3 on Internet Computer Protocol. Create innovative dApps, DeFi protocols, NFT platforms, or any Web3 application that pushes the boundaries of what's possible on ICP. This hackathon focuses on real-world utility and user adoption.",
      organizer: "ICP Foundation",
      mode: { Virtual: null },
      prizePool: "$150,000",
      prizes: [
        { position: "1st", amount: "$60,000", description: "Grand prize winner", token: "ICP" },
        { position: "2nd", amount: "$35,000", description: "Second place", token: "ICP" },
        { position: "3rd", amount: "$25,000", description: "Third place", token: "ICP" },
        { position: "Participation", amount: "$30,000", description: "Participation rewards", token: "ICP" }
      ],
      timeline: "72 hours of intense coding",
      startDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: Date.now() + (17 * 24 * 60 * 60 * 1000), // 17 days from now
      registrationDeadline: Date.now() + (12 * 24 * 60 * 60 * 1000), // 12 days from now
      submissionDeadline: Date.now() + (17 * 24 * 60 * 60 * 1000), // 17 days from now
      tags: ["Web3", "ICP", "DeFi", "NFT", "Blockchain", "Innovation"],
      category: { Web3: null },
      featured: true,
      requirements: [
        "Must use Internet Computer Protocol",
        "Must be a Web3 application",
        "Must include smart contracts",
        "Must have a working demo",
        "Must demonstrate real-world utility"
      ],
      deliverables: [
        "Source code on GitHub",
        "Live demo URL",
        "Presentation slides",
        "Technical documentation",
        "User guide"
      ],
      judgingCriteria: [
        "Innovation and creativity",
        "Technical implementation",
        "User experience",
        "Potential impact",
        "Code quality",
        "Real-world utility"
      ],
      maxParticipants: 300,
      maxTeamSize: 4,
      location: null,
      website: "https://icp-web3-hackathon.com",
      discord: "https://discord.gg/icpweb3",
      twitter: "@ICPWeb3Hack",
      imageUrl: "https://example.com/web3-hackathon-banner.jpg",
      bannerUrl: "https://example.com/web3-hackathon-banner-wide.jpg"
    };

    const hackathonResult = await hackathonStoreActor.createHackathon(testData.organizer.email, hackathonInput);
    logTest('Create Hackathon', hackathonResult, 'hackathonStore');

    if (!hackathonResult.ok) {
      console.log('❌ Cannot continue hackathon tests without creating hackathon');
      return;
    }

    const hackathonId = hackathonResult.ok.id;
    console.log(`\n📋 Created hackathon with ID: ${hackathonId}\n`);

    // Test 2: Register for Hackathon
    console.log('👥 Test 2: Registering for hackathon...');
    const teamMembers = ['teammate1@example.com', 'teammate2@example.com'];
    const registerResult = await hackathonStoreActor.registerForHackathon(
      hackathonId,
      testData.freelancer.email,
      teamMembers
    );
    logTest('Register for Hackathon', registerResult, 'hackathonStore');

    // Test 3: Get Hackathon by ID
    console.log('\n🔍 Test 3: Getting hackathon by ID...');
    const getHackathonResult = await hackathonStoreActor.getHackathon(hackathonId);
    logQueryTest('Get Hackathon by ID', getHackathonResult, 'hackathonStore');

    // Test 4: Get All Hackathons
    console.log('\n📋 Test 4: Getting all hackathons...');
    const allHackathons = await hackathonStoreActor.getAllHackathons();
    logQueryTest('Get All Hackathons', allHackathons, 'hackathonStore');

    // Test 5: Get Featured Hackathons
    console.log('\n⭐ Test 5: Getting featured hackathons...');
    const featuredHackathons = await hackathonStoreActor.getFeaturedHackathons();
    logQueryTest('Get Featured Hackathons', featuredHackathons, 'hackathonStore');

    // Test 6: Get User Hackathons
    console.log('\n👤 Test 6: Getting user hackathons...');
    const userHackathons = await hackathonStoreActor.getUserHackathons(testData.freelancer.email);
    logQueryTest('Get User Hackathons', userHackathons, 'hackathonStore');

    // Test 7: Search Hackathons
    console.log('\n🔍 Test 7: Searching hackathons...');
    const searchFilters = {
      status: { RegistrationOpen: null },
      category: { Web3: null },
      mode: { Virtual: null },
      featured: true,
      organizer: null,
      tags: null,
      minPrizePool: null,
      maxParticipants: null
    };
    const searchResult = await hackathonStoreActor.searchHackathons(searchFilters);
    logQueryTest('Search Hackathons', searchResult, 'hackathonStore');

    // Test 8: Submit to Hackathon
    console.log('\n📤 Test 8: Submitting to hackathon...');
    const submissionResult = await hackathonStoreActor.submitToHackathon(
      hackathonId,
      testData.freelancer.email,
      'https://github.com/user/web3-innovation-project',
      'A revolutionary Web3 platform that combines DeFi, NFTs, and social features. Built on ICP with advanced smart contracts and real-time data processing.',
      'https://github.com/user/web3-innovation-project',
      'https://web3-innovation-demo.ic0.app',
      'https://slides.com/user/web3-innovation-presentation'
    );
    logTest('Submit to Hackathon', submissionResult, 'hackathonStore');

    // Test 9: Get Hackathon Statistics
    console.log('\n📈 Test 9: Getting hackathon statistics...');
    const stats = await hackathonStoreActor.getHackathonStats();
    logQueryTest('Get Hackathon Stats', stats, 'hackathonStore');

    // Test 10: Update Participant Status
    console.log('\n👑 Test 10: Updating participant status...');
    const statusUpdateResult = await hackathonStoreActor.updateParticipantStatus(
      hackathonId,
      testData.freelancer.email,
      { Winner: null },
      testData.organizer.email
    );
    logTest('Update Participant Status', statusUpdateResult, 'hackathonStore');

    console.log('\n✅ Hackathon Store tests completed!\n');

  } catch (error) {
    console.error('❌ Hackathon Store test failed:', error);
    testResults.hackathonStore.failed++;
  }
}

async function testCrossCanisterIntegration() {
  console.log('🔗 ===== CROSS-CANISTER INTEGRATION TESTS =====\n');

  try {
    // Test 1: User creates project, then applies to it
    console.log('🔄 Test 1: Cross-canister workflow - User creates project and applies...');
    
    const projectResult = await projectStoreActor.createProject(
      'Cross-Canister Integration Test',
      'Testing integration between user management and project store canisters',
      'This project demonstrates how different canisters work together seamlessly',
      '$2000',
      '1 week',
      'Integration Testing',
      ['Testing', 'Integration', 'Canisters'],
      testData.client.email
    );

    if (projectResult.ok) {
      const projectId = projectResult.ok.id;
      console.log(`✅ Created project: ${projectId}`);

      const applicationResult = await projectStoreActor.applyToProject(
        projectId,
        testData.freelancer.email,
        'I want to test the cross-canister integration',
        'I have experience with canister integration and testing',
        '5 days',
        '$1800'
      );

      if (applicationResult.ok) {
        console.log('✅ Applied to project successfully');
        testResults.crossCanister.passed++;
      } else {
        console.log('❌ Failed to apply to project:', applicationResult.err);
        testResults.crossCanister.failed++;
      }
    } else {
      console.log('❌ Failed to create project:', projectResult.err);
      testResults.crossCanister.failed++;
    }

    // Test 2: User participates in hackathon and creates project
    console.log('\n🔄 Test 2: Cross-canister workflow - User participates in hackathon...');
    
    const hackathonInput = {
      title: "Integration Test Hackathon",
      description: "Testing cross-canister integration between all three canisters",
      organizer: "Test Organizer",
      mode: { Virtual: null },
      prizePool: "$5000",
      prizes: [{ position: "1st", amount: "$5000", description: "Winner", token: "ICP" }],
      timeline: "24 hours",
      startDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      endDate: Date.now() + (8 * 24 * 60 * 60 * 1000),
      registrationDeadline: Date.now() + (6 * 24 * 60 * 60 * 1000),
      submissionDeadline: Date.now() + (8 * 24 * 60 * 60 * 1000),
      tags: ["Integration", "Testing", "Canisters"],
      category: { Other: "Integration Testing" },
      featured: false,
      requirements: ["Must test integration between canisters"],
      deliverables: ["Working demo", "Integration documentation"],
      judgingCriteria: ["Integration quality", "Code quality"],
      maxParticipants: 50,
      maxTeamSize: 3,
      location: null,
      website: null,
      discord: null,
      twitter: null,
      imageUrl: null,
      bannerUrl: null
    };

    const hackathonResult = await hackathonStoreActor.createHackathon(testData.organizer.email, hackathonInput);
    
    if (hackathonResult.ok) {
      const hackathonId = hackathonResult.ok.id;
      console.log(`✅ Created hackathon: ${hackathonId}`);

      const registerResult = await hackathonStoreActor.registerForHackathon(
        hackathonId,
        testData.freelancer.email,
        []
      );

      if (registerResult.ok) {
        console.log('✅ Registered for hackathon successfully');
        testResults.crossCanister.passed++;
      } else {
        console.log('❌ Failed to register for hackathon:', registerResult.err);
        testResults.crossCanister.failed++;
      }
    } else {
      console.log('❌ Failed to create hackathon:', hackathonResult.err);
      testResults.crossCanister.failed++;
    }

    console.log('\n✅ Cross-canister integration tests completed!\n');

  } catch (error) {
    console.error('❌ Cross-canister integration test failed:', error);
    testResults.crossCanister.failed++;
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
  console.log(`   Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`);
  
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
  console.log('🚀 Starting Comprehensive ICP Canisters Testing...');
  console.log('==================================================');
  console.log(`Testing ${Object.keys(CANISTER_IDS).length} canisters:`);
  console.log(`- User Management: ${CANISTER_IDS.userManagement}`);
  console.log(`- Project Store: ${CANISTER_IDS.projectStore}`);
  console.log(`- Hackathon Store: ${CANISTER_IDS.hackathonStore}`);
  console.log(`Host: ${HOST}\n`);

  const startTime = Date.now();

  try {
    await testUserManagement();
    await testProjectStore();
    await testHackathonStore();
    await testCrossCanisterIntegration();

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
