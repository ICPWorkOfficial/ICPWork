# ICP Canisters API Testing Guide

This guide provides comprehensive examples for testing 3 ICP canisters: **User Management**, **Project Store**, and **Hackathon Store**.

## 📁 Files Overview

### 1. `test-hackathon-api.js`
- **Purpose**: Dedicated testing script for the Hackathon Store canister
- **Features**: Tests all 16 major functions including CRUD operations, participant management, and statistics
- **Usage**: `node test-hackathon-api.js`

### 2. `test-multiple-canisters-api.js`
- **Purpose**: Comprehensive testing script for all 3 canisters
- **Features**: Tests User Management, Project Store, and Hackathon Store with cross-canister integration
- **Usage**: `node test-multiple-canisters-api.js`

### 3. `test-api-curl-examples.sh`
- **Purpose**: Bash script demonstrating cURL requests for canister testing
- **Features**: HTTP-based testing using cURL commands
- **Usage**: `chmod +x test-api-curl-examples.sh && ./test-api-curl-examples.sh`

### 4. `test-api-postman-collection.json`
- **Purpose**: Postman collection for GUI-based API testing
- **Features**: Pre-configured requests for all 3 canisters
- **Usage**: Import into Postman and run tests

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js dependencies
npm install @dfinity/agent

# Make scripts executable
chmod +x test-api-curl-examples.sh
```

### Configuration
Update the canister IDs in the test files:

```javascript
// In test files, replace these with your actual canister IDs:
const CANISTER_IDS = {
  userManagement: 'vg3po-ix777-77774-qaafa-cai',  // Your User Management canister ID
  projectStore: 'vu5yx-eh777-77774-qaaga-cai',    // Your Project Store canister ID
  hackathonStore: 'hackathon_store_canister_id'   // Your Hackathon Store canister ID
};
```

## 🧪 Test Coverage

### User Management Canister Tests
- ✅ User Registration (Freelancer & Client)
- ✅ User Login
- ✅ Get User by Email
- ✅ Update User Profile
- ✅ Get All Users
- ✅ Get Users by Type
- ✅ Change Password
- ✅ Delete User

### Project Store Canister Tests
- ✅ Create Project
- ✅ Get Project by ID
- ✅ Get All Projects
- ✅ Get Projects by Client
- ✅ Get Open Projects
- ✅ Apply to Project
- ✅ Get Project Applications
- ✅ Get Freelancer Applications
- ✅ Update Project Status
- ✅ Update Application Status
- ✅ Get Project Statistics
- ✅ Delete Project

### Hackathon Store Canister Tests
- ✅ Create Hackathon
- ✅ Update Hackathon
- ✅ Delete Hackathon
- ✅ Register for Hackathon
- ✅ Submit to Hackathon
- ✅ Withdraw from Hackathon
- ✅ Get Hackathon by ID
- ✅ Get All Hackathons
- ✅ Get Hackathons by Status
- ✅ Get Hackathons by Category
- ✅ Get Featured Hackathons
- ✅ Get Hackathons by Organizer
- ✅ Get User Hackathons
- ✅ Search Hackathons
- ✅ Get Hackathon Statistics
- ✅ Update Participant Status
- ✅ Set Winners

## 📊 Test Data Examples

### User Registration
```javascript
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  userType: 'freelancer'
};
```

### Project Creation
```javascript
const projectData = {
  title: 'Build DeFi Dashboard',
  description: 'Create a comprehensive DeFi analytics dashboard',
  requirements: 'Must use React, TypeScript, and Web3 libraries',
  budget: '$5000',
  timeline: '4 weeks',
  category: 'Web Development',
  skills: ['React', 'TypeScript', 'Web3', 'Chart.js'],
  clientEmail: 'client@example.com'
};
```

### Hackathon Creation
```javascript
const hackathonData = {
  title: 'ICP DeFi Hackathon 2024',
  description: 'Build innovative DeFi applications on ICP',
  organizer: 'ICP Foundation',
  mode: { Virtual: null },
  prizePool: '$50,000',
  prizes: [
    { position: '1st', amount: '$20,000', description: 'First place winner', token: 'ICP' }
  ],
  timeline: '48 hours of intense coding',
  startDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
  endDate: Date.now() + (9 * 24 * 60 * 60 * 1000),
  registrationDeadline: Date.now() + (6 * 24 * 60 * 60 * 1000),
  submissionDeadline: Date.now() + (9 * 24 * 60 * 60 * 1000),
  tags: ['DeFi', 'ICP', 'Web3', 'Blockchain'],
  category: { DeFi: null },
  featured: true,
  requirements: ['Must use Internet Computer Protocol'],
  deliverables: ['Source code on GitHub', 'Live demo URL'],
  judgingCriteria: ['Innovation and creativity', 'Technical implementation'],
  maxParticipants: 100,
  maxTeamSize: 5
};
```

## 🔧 Running Tests

### 1. Node.js Scripts
```bash
# Test only hackathon store
node test-hackathon-api.js

# Test all 3 canisters
node test-multiple-canisters-api.js
```

### 2. cURL Script
```bash
# Run bash script with cURL commands
./test-api-curl-examples.sh
```

### 3. Postman Collection
1. Import `test-api-postman-collection.json` into Postman
2. Update environment variables with your canister IDs
3. Run the collection or individual requests

## 📈 Expected Output

### Successful Test Run
```
🚀 Starting Multi-Canister API Tests...

👤 ===== USER MANAGEMENT CANISTER TESTS =====

📝 Test 1: Registering a new user...
✅ Register User: SUCCESS
Result: {
  "email": "testuser@example.com",
  "userType": "freelancer",
  "userId": "user_testuser@example.com"
}

📝 Test 2: Registering a client...
✅ Register Client: SUCCESS
Result: {
  "email": "testclient@example.com", 
  "userType": "client",
  "userId": "user_testclient@example.com"
}

... (more test results)

🎉 All multi-canister tests completed successfully!

📊 Summary:
✅ User Management Canister - All tests passed
✅ Project Store Canister - All tests passed
✅ Hackathon Store Canister - All tests passed
✅ Cross-Canister Integration - All tests passed
```

## 🐛 Troubleshooting

### Common Issues

1. **Canister ID Not Found**
   ```
   Error: Canister not found
   ```
   **Solution**: Update canister IDs in test files with your actual deployed canister IDs.

2. **Agent Connection Failed**
   ```
   Error: Failed to fetch root key
   ```
   **Solution**: Ensure your local ICP replica is running on `http://127.0.0.1:4943`.

3. **Authentication Failed**
   ```
   Error: Unauthorized
   ```
   **Solution**: Check that user credentials are correct and user exists in the canister.

4. **Invalid Input Data**
   ```
   Error: Validation failed
   ```
   **Solution**: Ensure all required fields are provided and data types are correct.

### Debug Mode
Add debug logging to see detailed request/response data:

```javascript
// Enable debug mode
const agent = new HttpAgent({ 
  host: HOST,
  verifyQuerySignatures: false,
  verifyUpdateSignatures: false,
  fetchRootKey: true
});

// Add logging
console.log('Request payload:', JSON.stringify(payload, null, 2));
console.log('Response:', JSON.stringify(response, null, 2));
```

## 🔄 Cross-Canister Integration Tests

The test suite includes cross-canister integration scenarios:

1. **User → Project Flow**: User registers, creates project, applies to it
2. **User → Hackathon Flow**: User registers, creates hackathon, participates
3. **Multi-Canister Workflow**: Complex scenarios involving all 3 canisters

## 📝 Customization

### Adding New Tests
1. Create new test function following the existing pattern
2. Add helper functions for result handling
3. Include in the main test runner

### Modifying Test Data
Update the test data objects at the top of each script to match your requirements.

### Environment Configuration
Create environment-specific configurations for different networks (local, testnet, mainnet).

## 🎯 Best Practices

1. **Always validate responses** before proceeding to next tests
2. **Use unique test data** to avoid conflicts between test runs
3. **Clean up test data** after tests complete
4. **Handle errors gracefully** with proper error messages
5. **Test edge cases** like invalid inputs and boundary conditions
6. **Verify cross-canister consistency** in integration tests

## 📚 Additional Resources

- [DFINITY Agent Documentation](https://agent-js.icp.xyz/)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/)
- [ICP Canister Development](https://internetcomputer.org/docs/current/developer-docs/backend/motoko/)

---

**Happy Testing! 🚀**
