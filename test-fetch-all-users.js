#!/usr/bin/env node

/**
 * Test script to fetch all users from the user_management canister
 * Usage: node test-fetch-all-users.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function fetchAllUsers() {
  try {
    console.log('🔍 Fetching all users from user_management canister...\n');
    
    const response = await fetch(`${BASE_URL}/api/users/all`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Successfully retrieved ${result.count} users\n`);
      
      if (result.users && result.users.length > 0) {
        console.log('📋 User Details:');
        console.log('================\n');
        
        result.users.forEach((userEntry, index) => {
          const [email, userData] = userEntry;
          console.log(`${index + 1}. User: ${email}`);
          console.log(`   - Name: ${userData.firstName || 'N/A'} ${userData.lastName || 'N/A'}`);
          console.log(`   - Type: ${userData.userType}`);
          console.log(`   - Phone: ${userData.phoneNumber || 'N/A'}`);
          console.log(`   - Company: ${userData.companyName || 'N/A'}`);
          console.log(`   - Industry: ${userData.industry || 'N/A'}`);
          console.log(`   - Skills: ${userData.skills ? userData.skills.join(', ') : 'N/A'}`);
          console.log(`   - Location: ${userData.city || 'N/A'}, ${userData.state || 'N/A'}, ${userData.country || 'N/A'}`);
          console.log(`   - Created: ${userData.createdAt}`);
          console.log(`   - Updated: ${userData.updatedAt}`);
          console.log('');
        });
        
        // Summary statistics
        const userTypes = result.users.reduce((acc, [email, userData]) => {
          acc[userData.userType] = (acc[userData.userType] || 0) + 1;
          return acc;
        }, {});
        
        console.log('📊 Summary Statistics:');
        console.log('======================');
        console.log(`Total Users: ${result.count}`);
        Object.entries(userTypes).forEach(([type, count]) => {
          console.log(`${type.charAt(0).toUpperCase() + type.slice(1)}s: ${count}`);
        });
        
      } else {
        console.log('📭 No users found in the system');
      }
      
    } else {
      console.error('❌ Failed to fetch users:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
    
  } catch (error) {
    console.error('💥 Error fetching users:', error.message);
    console.error('\nMake sure:');
    console.error('1. The frontend server is running on http://localhost:3000');
    console.error('2. The user_management canister is deployed and accessible');
    console.error('3. The canister ID is correct in the API route');
  }
}

// Run the test
fetchAllUsers();
