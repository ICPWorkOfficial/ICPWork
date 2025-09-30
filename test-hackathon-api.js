#!/usr/bin/env node

/**
 * Hackathon Store API Testing Script
 * Tests all major functions of the hackathon_store canister
 */

import { HttpAgent, Actor } from '@dfinity/agent';
// Note: hackathon_store declarations not available, commenting out for now
// import { idlFactory } from './frontend/declarations/hackathon_store/index.js';

// Configuration
const CANISTER_ID = 'hackathon_store_canister_id_here'; // Replace with actual canister ID
const HOST = 'http://127.0.0.1:4943';

// Initialize agent
const agent = new HttpAgent({ 
  host: HOST,
  verifyQuerySignatures: false,
  verifyUpdateSignatures: false,
  fetchRootKey: true
});

await agent.fetchRootKey();

// Note: Actor creation commented out due to missing declarations
// const hackathonActor = Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });

// Test data
const testOrganizerEmail = 'organizer@example.com';
const testUserEmail = 'participant@example.com';

console.log('🚀 Starting Hackathon Store API Tests...\n');

// Helper function to handle results
function handleResult(operation, result) {
  if ('ok' in result) {
    console.log(`✅ ${operation}: SUCCESS`);
    console.log('Result:', JSON.stringify(result.ok, null, 2));
    return result.ok;
  } else {
    console.log(`❌ ${operation}: FAILED`);
    console.log('Error:', result.err);
    return null;
  }
}

// Helper function to handle query results
function handleQueryResult(operation, result) {
  if (result) {
    console.log(`✅ ${operation}: SUCCESS`);
    console.log('Result:', JSON.stringify(result, null, 2));
    return result;
  } else {
    console.log(`❌ ${operation}: FAILED - No data returned`);
    return null;
  }
}

async function runTests() {
  try {
    console.log('⚠️  Hackathon Store tests skipped - declarations not available');
    console.log('📝 To run these tests, you need to:');
    console.log('   1. Deploy the hackathon_store canister');
    console.log('   2. Generate the declarations using dfx generate');
    console.log('   3. Update the import path in this file');
    return;
    
    // Test 1: Create a new hackathon
    console.log('📝 Test 1: Creating a new hackathon...');
    const hackathonInput = {
      title: "ICP DeFi Hackathon 2024",
      description: "Build innovative DeFi applications on the Internet Computer Protocol. Create lending protocols, DEXs, yield farming, or other DeFi primitives.",
      organizer: "ICP Foundation",
      mode: { Virtual: null },
      prizePool: "$50,000",
      prizes: [
        { position: "1st", amount: "$20,000", description: "First place winner", token: "ICP" },
        { position: "2nd", amount: "$15,000", description: "Second place winner", token: "ICP" },
        { position: "3rd", amount: "$10,000", description: "Third place winner", token: "ICP" },
        { position: "Participation", amount: "$5,000", description: "Participation rewards", token: "ICP" }
      ],
      timeline: "48 hours of intense coding",
      startDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: Date.now() + (9 * 24 * 60 * 60 * 1000), // 9 days from now
      registrationDeadline: Date.now() + (6 * 24 * 60 * 60 * 1000), // 6 days from now
      submissionDeadline: Date.now() + (9 * 24 * 60 * 60 * 1000), // 9 days from now
      tags: ["DeFi", "ICP", "Web3", "Blockchain"],
      category: { DeFi: null },
      featured: true,
      requirements: [
        "Must use Internet Computer Protocol",
        "Must be a DeFi application",
        "Must include smart contracts",
        "Must have a working demo"
      ],
      deliverables: [
        "Source code on GitHub",
        "Live demo URL",
        "Presentation slides",
        "Technical documentation"
      ],
      judgingCriteria: [
        "Innovation and creativity",
        "Technical implementation",
        "User experience",
        "Potential impact"
      ],
      maxParticipants: 100,
      maxTeamSize: 5,
      location: null,
      website: "https://icp-defi-hackathon.com",
      discord: "https://discord.gg/icpdefi",
      twitter: "@ICPDeFiHack",
      imageUrl: "https://example.com/hackathon-banner.jpg",
      bannerUrl: "https://example.com/hackathon-banner-wide.jpg"
    };

    const createResult = await hackathonActor.createHackathon(testOrganizerEmail, hackathonInput);
    const hackathon = handleResult('Create Hackathon', createResult);
    
    if (!hackathon) {
      console.log('❌ Cannot continue tests without creating hackathon');
      return;
    }

    const hackathonId = hackathon.id;
    console.log(`\n📋 Created hackathon with ID: ${hackathonId}\n`);

    // Test 2: Get hackathon by ID
    console.log('🔍 Test 2: Getting hackathon by ID...');
    const getResult = await hackathonActor.getHackathon(hackathonId);
    handleQueryResult('Get Hackathon by ID', getResult);

    // Test 3: Register for hackathon
    console.log('\n👥 Test 3: Registering for hackathon...');
    const teamMembers = ['teammate1@example.com', 'teammate2@example.com'];
    const registerResult = await hackathonActor.registerForHackathon(hackathonId, testUserEmail, teamMembers);
    handleResult('Register for Hackathon', registerResult);

    // Test 4: Get all hackathons
    console.log('\n📋 Test 4: Getting all hackathons...');
    const allHackathons = await hackathonActor.getAllHackathons();
    handleQueryResult('Get All Hackathons', allHackathons);

    // Test 5: Get hackathons by status
    console.log('\n📊 Test 5: Getting hackathons by status...');
    const statusHackathons = await hackathonActor.getHackathonsByStatus({ RegistrationOpen: null });
    handleQueryResult('Get Hackathons by Status', statusHackathons);

    // Test 6: Get hackathons by category
    console.log('\n🏷️ Test 6: Getting hackathons by category...');
    const categoryHackathons = await hackathonActor.getHackathonsByCategory({ DeFi: null });
    handleQueryResult('Get Hackathons by Category', categoryHackathons);

    // Test 7: Get featured hackathons
    console.log('\n⭐ Test 7: Getting featured hackathons...');
    const featuredHackathons = await hackathonActor.getFeaturedHackathons();
    handleQueryResult('Get Featured Hackathons', featuredHackathons);

    // Test 8: Get hackathons by organizer
    console.log('\n👤 Test 8: Getting hackathons by organizer...');
    const organizerHackathons = await hackathonActor.getHackathonsByOrganizer(testOrganizerEmail);
    handleQueryResult('Get Hackathons by Organizer', organizerHackathons);

    // Test 9: Get user hackathons
    console.log('\n👤 Test 9: Getting user hackathons...');
    const userHackathons = await hackathonActor.getUserHackathons(testUserEmail);
    handleQueryResult('Get User Hackathons', userHackathons);

    // Test 10: Search hackathons with filters
    console.log('\n🔍 Test 10: Searching hackathons with filters...');
    const searchFilters = {
      status: { RegistrationOpen: null },
      category: { DeFi: null },
      mode: { Virtual: null },
      featured: true,
      organizer: null,
      tags: null,
      minPrizePool: null,
      maxParticipants: null
    };
    const searchResult = await hackathonActor.searchHackathons(searchFilters);
    handleQueryResult('Search Hackathons', searchResult);

    // Test 11: Submit to hackathon (simulate after hackathon starts)
    console.log('\n📤 Test 11: Submitting to hackathon...');
    const submissionResult = await hackathonActor.submitToHackathon(
      hackathonId,
      testUserEmail,
      'https://github.com/user/defi-project',
      'A revolutionary DeFi lending protocol built on ICP with automated yield optimization',
      'https://github.com/user/defi-project',
      'https://defi-demo.ic0.app',
      'https://slides.com/user/defi-presentation'
    );
    handleResult('Submit to Hackathon', submissionResult);

    // Test 12: Update hackathon
    console.log('\n✏️ Test 12: Updating hackathon...');
    const updateData = {
      title: "ICP DeFi Hackathon 2024 - Updated",
      description: "Updated description with more details about the hackathon",
      prizePool: "$60,000",
      featured: true,
      website: "https://updated-icp-defi-hackathon.com"
    };
    const updateResult = await hackathonActor.updateHackathon(hackathonId, testOrganizerEmail, updateData);
    handleResult('Update Hackathon', updateResult);

    // Test 13: Get hackathon statistics
    console.log('\n📈 Test 13: Getting hackathon statistics...');
    const stats = await hackathonActor.getHackathonStats();
    handleQueryResult('Get Hackathon Stats', stats);

    // Test 14: Update participant status (organizer only)
    console.log('\n👑 Test 14: Updating participant status...');
    const statusUpdateResult = await hackathonActor.updateParticipantStatus(
      hackathonId,
      testUserEmail,
      { Winner: null },
      testOrganizerEmail
    );
    handleResult('Update Participant Status', statusUpdateResult);

    // Test 15: Set winners
    console.log('\n🏆 Test 15: Setting winners...');
    const winnersResult = await hackathonActor.setWinners(
      hackathonId,
      [testUserEmail],
      testOrganizerEmail
    );
    handleResult('Set Winners', winnersResult);

    // Test 16: Withdraw from hackathon
    console.log('\n🚪 Test 16: Withdrawing from hackathon...');
    const withdrawResult = await hackathonActor.withdrawFromHackathon(hackathonId, testUserEmail);
    handleResult('Withdraw from Hackathon', withdrawResult);

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
runTests();
