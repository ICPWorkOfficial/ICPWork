#!/usr/bin/env node

/**
 * Frontend Integration Test for ICP Ledger
 * This script tests the REST API integration with the ICP Ledger Canister
 */

const baseUrl = 'http://localhost:3000';

// Test data
const testAccounts = {
  client: 'test_client@example.com',
  freelancer: 'test_freelancer@example.com'
};

const testEscrow = {
  id: 'test_project_001',
  amount: 1000000
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testGetStats() {
  console.log('📊 Testing: Get Ledger Statistics');
  const result = await apiCall('/api/ledger?action=stats');
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testCreateAccount(accountId) {
  console.log(`👤 Testing: Create Account (${accountId})`);
  const result = await apiCall('/api/ledger', 'POST', {
    action: 'create-account',
    accountId
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testMintTokens(accountId, amount) {
  console.log(`💰 Testing: Mint Tokens (${accountId}: ${amount})`);
  const result = await apiCall('/api/ledger', 'POST', {
    action: 'mint-tokens',
    accountId,
    amount
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testGetBalance(accountId) {
  console.log(`📈 Testing: Get Balance (${accountId})`);
  const result = await apiCall(`/api/ledger?action=balance&accountId=${accountId}`);
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testCreateEscrow(escrowId, depositor, beneficiary, amount) {
  console.log(`🔒 Testing: Create Escrow (${escrowId})`);
  const result = await apiCall('/api/ledger', 'POST', {
    action: 'escrow-deposit',
    escrowId,
    depositor,
    beneficiary,
    amount,
    memo: 'Test escrow creation'
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testGetEscrow(escrowId) {
  console.log(`📋 Testing: Get Escrow (${escrowId})`);
  const result = await apiCall(`/api/ledger?action=escrow&escrowId=${escrowId}`);
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testReleaseEscrow(escrowId, releaser, amount) {
  console.log(`🔓 Testing: Release Escrow (${escrowId}: ${amount})`);
  const result = await apiCall('/api/ledger', 'POST', {
    action: 'escrow-release',
    escrowId,
    releaser,
    amount
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

async function testGetTransactions(accountId) {
  console.log(`📜 Testing: Get Transactions (${accountId})`);
  const result = await apiCall(`/api/ledger?action=transactions&accountId=${accountId}&limit=5`);
  
  if (result.success && result.data.success) {
    console.log('✅ Success:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.error || result.error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting ICP Ledger Frontend Integration Tests');
  console.log('================================================');
  
  let passed = 0;
  let total = 0;

  // Test 1: Get initial stats
  total++;
  if (await testGetStats()) passed++;

  // Test 2: Create test accounts
  total++;
  if (await testCreateAccount(testAccounts.client)) passed++;

  total++;
  if (await testCreateAccount(testAccounts.freelancer)) passed++;

  // Test 3: Mint tokens to client
  total++;
  if (await testMintTokens(testAccounts.client, 5000000)) passed++;

  // Test 4: Check balances
  total++;
  if (await testGetBalance(testAccounts.client)) passed++;

  total++;
  if (await testGetBalance(testAccounts.freelancer)) passed++;

  // Test 5: Create escrow
  total++;
  if (await testCreateEscrow(
    testEscrow.id,
    testAccounts.client,
    testAccounts.freelancer,
    testEscrow.amount
  )) passed++;

  // Test 6: Get escrow details
  total++;
  if (await testGetEscrow(testEscrow.id)) passed++;

  // Test 7: Release partial escrow
  total++;
  if (await testReleaseEscrow(testEscrow.id, testAccounts.freelancer, 500000)) passed++;

  // Test 8: Get transaction history
  total++;
  if (await testGetTransactions(testAccounts.client)) passed++;

  total++;
  if (await testGetTransactions(testAccounts.freelancer)) passed++;

  // Test 9: Final stats check
  total++;
  if (await testGetStats()) passed++;

  // Results
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Frontend integration is working correctly.');
    console.log('\n🔗 Next Steps:');
    console.log('1. Visit http://localhost:3000/test-ledger for the test interface');
    console.log('2. Integrate the /api/ledger endpoints into your existing frontend');
    console.log('3. Update your escrow system to use the ledger for token management');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure the frontend server is running (npm run dev)');
    console.log('2. Ensure the ICP Ledger canister is deployed and running');
    console.log('3. Check the API endpoint responses for detailed error messages');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testGetStats,
  testCreateAccount,
  testMintTokens,
  testGetBalance,
  testCreateEscrow,
  testGetEscrow,
  testReleaseEscrow,
  testGetTransactions
};


