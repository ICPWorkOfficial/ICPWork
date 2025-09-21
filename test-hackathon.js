#!/usr/bin/env node

/**
 * Test script for Hackathon canister functionality
 * This script tests the basic hackathon operations
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    canisterId: 'hackathon_store', // Will be set after deployment
    testUser: 'test@example.com',
    testOrganizer: 'organizer@example.com'
};

console.log('🚀 Starting Hackathon Canister Tests...\n');

// Helper function to run dfx commands
function runDfxCommand(command) {
    try {
        console.log(`Running: dfx ${command}`);
        const result = execSync(`dfx ${command}`, { 
            cwd: './backend',
            encoding: 'utf8',
            stdio: 'pipe'
        });
        return result.trim();
    } catch (error) {
        console.error(`Error running dfx ${command}:`, error.message);
        return null;
    }
}

// Test functions
async function testCanisterDeployment() {
    console.log('📦 Testing canister deployment...');
    
    // Check if canister is deployed
    const canisterInfo = runDfxCommand('canister id hackathon_store');
    if (canisterInfo) {
        console.log(`✅ Hackathon canister deployed with ID: ${canisterInfo}`);
        TEST_CONFIG.canisterId = canisterInfo;
        return true;
    } else {
        console.log('❌ Hackathon canister not found. Deploying...');
        const deployResult = runDfxCommand('deploy hackathon_store');
        if (deployResult) {
            console.log('✅ Hackathon canister deployed successfully');
            return true;
        } else {
            console.log('❌ Failed to deploy hackathon canister');
            return false;
        }
    }
}

async function testHackathonCreation() {
    console.log('\n🏗️ Testing hackathon creation...');
    
    const hackathonInput = `record {
        title = "Web3 Security Challenge";
        description = "Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.";
        organizer = "Security First";
        mode = variant {Virtual};
        prizePool = "$75,000";
        prizes = vec {
            record {
                position = "1st";
                amount = "$30,000";
                description = null;
                token = null;
            };
            record {
                position = "2nd";
                amount = "$20,000";
                description = null;
                token = null;
            };
            record {
                position = "3rd";
                amount = "$15,000";
                description = null;
                token = null;
            };
        };
        timeline = "537 days";
        startDate = ${Date.now() + 86400000}; // Tomorrow
        endDate = ${Date.now() + (86400000 * 7)}; // Next week
        registrationDeadline = ${Date.now() + 43200000}; // 12 hours from now
        submissionDeadline = ${Date.now() + (86400000 * 6)}; // 6 days from now
        tags = vec {"Smart"; "Contracts"};
        category = variant {Security};
        featured = true;
        requirements = vec {"Build a secure smart contract"; "Identify vulnerabilities"};
        deliverables = vec {"Working smart contract"; "Security audit report"};
        judgingCriteria = vec {"Security"; "Innovation"; "Code quality"};
        maxParticipants = opt 100;
        maxTeamSize = opt 5;
        location = opt "Virtual";
        website = opt "https://securityfirst.com";
        discord = opt "https://discord.gg/securityfirst";
        twitter = opt "https://twitter.com/securityfirst";
        imageUrl = opt "https://example.com/hackathon.jpg";
        bannerUrl = opt "https://example.com/banner.jpg";
    }`;
    
    const result = runDfxCommand(`canister call hackathon_store createHackathon '("${TEST_CONFIG.testOrganizer}", ${hackathonInput})'`);
    if (result && result.includes('id')) {
        console.log('✅ Hackathon created successfully');
        console.log('📄 Hackathon:', result);
        return true;
    } else {
        console.log('❌ Failed to create hackathon');
        return false;
    }
}

async function testGetAllHackathons() {
    console.log('\n📋 Testing get all hackathons...');
    
    const result = runDfxCommand(`canister call hackathon_store getAllHackathons`);
    if (result && result.includes('title')) {
        console.log('✅ Hackathons retrieved successfully');
        console.log('📊 Hackathons:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve hackathons');
        return false;
    }
}

async function testGetHackathonsByStatus() {
    console.log('\n🔍 Testing get hackathons by status...');
    
    const result = runDfxCommand(`canister call hackathon_store getHackathonsByStatus '(variant {RegistrationOpen})'`);
    if (result) {
        console.log('✅ Hackathons by status retrieved successfully');
        console.log('📊 Registration Open Hackathons:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve hackathons by status');
        return false;
    }
}

async function testGetFeaturedHackathons() {
    console.log('\n⭐ Testing get featured hackathons...');
    
    const result = runDfxCommand(`canister call hackathon_store getFeaturedHackathons`);
    if (result) {
        console.log('✅ Featured hackathons retrieved successfully');
        console.log('⭐ Featured Hackathons:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve featured hackathons');
        return false;
    }
}

async function testHackathonRegistration() {
    console.log('\n📝 Testing hackathon registration...');
    
    // First get a hackathon ID
    const hackathonsResult = runDfxCommand(`canister call hackathon_store getAllHackathons`);
    if (!hackathonsResult || !hackathonsResult.includes('id')) {
        console.log('❌ No hackathons available for registration test');
        return false;
    }
    
    // Extract hackathon ID (simplified - in real implementation you'd parse the result)
    const hackathonId = 'hack_1234567890_123456'; // This would be extracted from the result
    
    const teamMembers = `vec {"teammate1@example.com"; "teammate2@example.com"}`;
    const result = runDfxCommand(`canister call hackathon_store registerForHackathon '("${hackathonId}", "${TEST_CONFIG.testUser}", ${teamMembers})'`);
    if (result && result.includes('ok')) {
        console.log('✅ Hackathon registration successful');
        console.log('📝 Registration result:', result);
        return true;
    } else {
        console.log('❌ Failed to register for hackathon');
        return false;
    }
}

async function testHackathonStats() {
    console.log('\n📊 Testing hackathon statistics...');
    
    const result = runDfxCommand(`canister call hackathon_store getHackathonStats`);
    if (result && result.includes('totalHackathons')) {
        console.log('✅ Hackathon statistics retrieved successfully');
        console.log('📈 Statistics:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve hackathon statistics');
        return false;
    }
}

async function testSearchHackathons() {
    console.log('\n🔍 Testing hackathon search...');
    
    const searchFilters = `record {
        status = opt variant {RegistrationOpen};
        category = opt variant {Security};
        mode = opt variant {Virtual};
        featured = opt true;
        organizer = null;
        tags = null;
        minPrizePool = null;
        maxParticipants = null;
    }`;
    
    const result = runDfxCommand(`canister call hackathon_store searchHackathons '(${searchFilters})'`);
    if (result) {
        console.log('✅ Hackathon search successful');
        console.log('🔍 Search results:', result);
        return true;
    } else {
        console.log('❌ Failed to search hackathons');
        return false;
    }
}

// Main test runner
async function runTests() {
    const tests = [
        { name: 'Canister Deployment', fn: testCanisterDeployment },
        { name: 'Hackathon Creation', fn: testHackathonCreation },
        { name: 'Get All Hackathons', fn: testGetAllHackathons },
        { name: 'Get Hackathons by Status', fn: testGetHackathonsByStatus },
        { name: 'Get Featured Hackathons', fn: testGetFeaturedHackathons },
        { name: 'Hackathon Registration', fn: testHackathonRegistration },
        { name: 'Hackathon Statistics', fn: testHackathonStats },
        { name: 'Hackathon Search', fn: testSearchHackathons }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ Test "${test.name}" failed with error:`, error.message);
            failed++;
        }
    }
    
    console.log('\n📋 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Hackathon canister is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the canister implementation.');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testCanisterDeployment,
    testHackathonCreation,
    testGetAllHackathons,
    testGetHackathonsByStatus,
    testGetFeaturedHackathons,
    testHackathonRegistration,
    testHackathonStats,
    testSearchHackathons
};
