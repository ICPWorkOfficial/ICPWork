#!/usr/bin/env node

/**
 * Test script for ICPSwap canister functionality
 * This script tests the basic ICPSwap operations
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    canisterId: 'icpswap', // Will be set after deployment
    testUser: 'test@example.com',
    testAmount: '100',
    testFrom: 'ICP',
    testTo: 'ETH'
};

console.log('🚀 Starting ICPSwap Canister Tests...\n');

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
    const canisterInfo = runDfxCommand('canister id icpswap');
    if (canisterInfo) {
        console.log(`✅ ICPSwap canister deployed with ID: ${canisterInfo}`);
        TEST_CONFIG.canisterId = canisterInfo;
        return true;
    } else {
        console.log('❌ ICPSwap canister not found. Deploying...');
        const deployResult = runDfxCommand('deploy icpswap');
        if (deployResult) {
            console.log('✅ ICPSwap canister deployed successfully');
            return true;
        } else {
            console.log('❌ Failed to deploy ICPSwap canister');
            return false;
        }
    }
}

async function testTokenInfo() {
    console.log('\n🪙 Testing token information...');
    
    const result = runDfxCommand(`canister call icpswap getAllTokens`);
    if (result && result.includes('ICP')) {
        console.log('✅ Token information retrieved successfully');
        console.log('📋 Available tokens:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve token information');
        return false;
    }
}

async function testConversionRate() {
    console.log('\n💱 Testing conversion rate...');
    
    const result = runDfxCommand(`canister call icpswap getConversionRate '(variant {ICP}, variant {ETH})'`);
    if (result && result.includes('Float')) {
        console.log('✅ Conversion rate retrieved successfully');
        console.log('📊 ICP to ETH rate:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve conversion rate');
        return false;
    }
}

async function testCurrencyConversion() {
    console.log('\n🔄 Testing currency conversion...');
    
    const conversionRequest = `record {
        from = variant {ICP};
        to = variant {ETH};
        amount = "${TEST_CONFIG.testAmount}";
    }`;
    
    const result = runDfxCommand(`canister call icpswap convertCurrency '(${conversionRequest})'`);
    if (result && result.includes('converted')) {
        console.log('✅ Currency conversion successful');
        console.log('💰 Conversion result:', result);
        return true;
    } else {
        console.log('❌ Failed to convert currency');
        return false;
    }
}

async function testTransactionCreation() {
    console.log('\n📝 Testing transaction creation...');
    
    const createTxRequest = `(
        variant {ICP},
        variant {ETH},
        "${TEST_CONFIG.testAmount}",
        "0.04",
        0.0004,
        "${TEST_CONFIG.testUser}"
    )`;
    
    const result = runDfxCommand(`canister call icpswap createTransaction '${createTxRequest}'`);
    if (result && result.includes('id')) {
        console.log('✅ Transaction created successfully');
        console.log('📄 Transaction:', result);
        return true;
    } else {
        console.log('❌ Failed to create transaction');
        return false;
    }
}

async function testSwapStats() {
    console.log('\n📊 Testing swap statistics...');
    
    const result = runDfxCommand(`canister call icpswap getSwapStats`);
    if (result && result.includes('totalTransactions')) {
        console.log('✅ Swap statistics retrieved successfully');
        console.log('📈 Statistics:', result);
        return true;
    } else {
        console.log('❌ Failed to retrieve swap statistics');
        return false;
    }
}

// Main test runner
async function runTests() {
    const tests = [
        { name: 'Canister Deployment', fn: testCanisterDeployment },
        { name: 'Token Information', fn: testTokenInfo },
        { name: 'Conversion Rate', fn: testConversionRate },
        { name: 'Currency Conversion', fn: testCurrencyConversion },
        { name: 'Transaction Creation', fn: testTransactionCreation },
        { name: 'Swap Statistics', fn: testSwapStats }
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
        console.log('\n🎉 All tests passed! ICPSwap canister is working correctly.');
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
    testTokenInfo,
    testConversionRate,
    testCurrencyConversion,
    testTransactionCreation,
    testSwapStats
};
