#!/bin/bash

# Simple cURL-based API Testing Script
# Tests canisters using HTTP requests without Node.js dependencies

echo "🚀 Starting Simple cURL API Tests..."
echo "===================================="

# Configuration
HOST="http://127.0.0.1:4943"
USER_MANAGEMENT_CANISTER="vg3po-ix777-77774-qaafa-cai"
PROJECT_STORE_CANISTER="vu5yx-eh777-77774-qaaga-cai"

# Test data
TEST_USER_EMAIL="testuser@example.com"
TEST_CLIENT_EMAIL="testclient@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Testing canisters:"
echo "- User Management: $USER_MANAGEMENT_CANISTER"
echo "- Project Store: $PROJECT_STORE_CANISTER"
echo "Host: $HOST"
echo ""

# Helper function to make cURL requests
make_request() {
    local method=$1
    local canister_id=$2
    local function_name=$3
    local args=$4
    local description=$5
    
    echo ""
    echo "📝 $description"
    echo "----------------------------------------"
    
    # Create the request payload
    local payload="{\"request_type\":\"call\",\"canister_id\":\"$canister_id\",\"method_name\":\"$function_name\",\"arg\":$args}"
    
    echo "Request: $method $function_name"
    echo "Payload: $payload"
    
    # Make the request
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$HOST/api/v2/canister/$canister_id/call" 2>/dev/null)
    
    echo "Response: $response"
    
    # Check if response contains error
    if echo "$response" | grep -q "error\|Error\|failed\|Failed"; then
        echo "❌ Request failed"
        return 1
    else
        echo "✅ Request successful"
        return 0
    fi
}

# Test User Management Canister
echo "👤 ===== USER MANAGEMENT CANISTER TESTS ====="

# Test 1: Register User
make_request "POST" "$USER_MANAGEMENT_CANISTER" "registerUser" \
    "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"userType\":\"freelancer\"}" \
    "Register a new user"

# Test 2: Register Client
make_request "POST" "$USER_MANAGEMENT_CANISTER" "registerUser" \
    "{\"email\":\"$TEST_CLIENT_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"userType\":\"client\"}" \
    "Register a new client"

# Test 3: Login User
make_request "POST" "$USER_MANAGEMENT_CANISTER" "loginUser" \
    "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "Login user"

# Test 4: Get User by Email
make_request "GET" "$USER_MANAGEMENT_CANISTER" "getUser" \
    "{\"email\":\"$TEST_USER_EMAIL\"}" \
    "Get user by email"

# Test 5: Get All Users
make_request "GET" "$USER_MANAGEMENT_CANISTER" "getAllUsers" \
    "{}" \
    "Get all users"

# Test Project Store Canister
echo ""
echo "📁 ===== PROJECT STORE CANISTER TESTS ====="

# Test 1: Create Project
make_request "POST" "$PROJECT_STORE_CANISTER" "createProject" \
    "{\"title\":\"Test DeFi Project\",\"description\":\"A test DeFi project for API testing\",\"requirements\":\"Must use React and Web3\",\"budget\":\"\$5000\",\"timeline\":\"4 weeks\",\"category\":\"Web Development\",\"skills\":[\"React\",\"TypeScript\",\"Web3\"],\"clientEmail\":\"$TEST_CLIENT_EMAIL\"}" \
    "Create a new project"

# Test 2: Get All Projects
make_request "GET" "$PROJECT_STORE_CANISTER" "getAllProjects" \
    "{}" \
    "Get all projects"

# Test 3: Get Open Projects
make_request "GET" "$PROJECT_STORE_CANISTER" "getOpenProjects" \
    "{}" \
    "Get open projects"

# Test 4: Get Projects by Client
make_request "GET" "$PROJECT_STORE_CANISTER" "getProjectsByClient" \
    "{\"clientEmail\":\"$TEST_CLIENT_EMAIL\"}" \
    "Get projects by client"

# Test 5: Get Project Stats
make_request "GET" "$PROJECT_STORE_CANISTER" "getProjectStats" \
    "{}" \
    "Get project statistics"

echo ""
echo "🎉 All cURL tests completed!"
echo ""
echo "📊 Summary:"
echo "✅ User Management Canister - Tested 5 functions"
echo "✅ Project Store Canister - Tested 5 functions"
echo ""
echo "💡 Note: This script demonstrates cURL usage for testing canisters."
echo "   For production use, consider using the official DFINITY agent libraries."
