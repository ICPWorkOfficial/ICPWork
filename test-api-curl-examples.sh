#!/bin/bash

# API Testing Script using cURL
# Tests 3 canisters: User Management, Project Store, and Hackathon Store
# This script demonstrates how to test canisters using HTTP requests

echo "🚀 Starting API Tests with cURL..."
echo "=================================="

# Configuration
HOST="http://127.0.0.1:4943"
CANISTER_IDS=(
    "vg3po-ix777-77774-qaafa-cai"  # User Management
    "vu5yx-eh777-77774-qaaga-cai"  # Project Store  
    "hackathon_store_canister_id"  # Hackathon Store
)

# Test data
TEST_USER_EMAIL="testuser@example.com"
TEST_CLIENT_EMAIL="testclient@example.com"
TEST_PASSWORD="TestPassword123!"

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
    local payload="{\"request_type\":\"call\",\"canister_id\":\"$canister_id\",\"method_name\":\"$function_name\",\"arg\":\"$args\"}"
    
    # Make the request
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$HOST/api/v2/canister/$canister_id/call")
    
    echo "Request: $method $function_name"
    echo "Response: $response"
    
    # Check if response contains error
    if echo "$response" | grep -q "error"; then
        echo "❌ Request failed"
    else
        echo "✅ Request successful"
    fi
}

# Test User Management Canister
echo ""
echo "👤 ===== USER MANAGEMENT CANISTER TESTS ====="

# Test 1: Register User
make_request "POST" "${CANISTER_IDS[0]}" "registerUser" \
    "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"userType\":\"freelancer\"}" \
    "Register a new user"

# Test 2: Register Client
make_request "POST" "${CANISTER_IDS[0]}" "registerUser" \
    "{\"email\":\"$TEST_CLIENT_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"userType\":\"client\"}" \
    "Register a new client"

# Test 3: Login User
make_request "POST" "${CANISTER_IDS[0]}" "loginUser" \
    "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "Login user"

# Test 4: Get User by Email
make_request "GET" "${CANISTER_IDS[0]}" "getUser" \
    "{\"email\":\"$TEST_USER_EMAIL\"}" \
    "Get user by email"

# Test 5: Get All Users
make_request "GET" "${CANISTER_IDS[0]}" "getAllUsers" \
    "{}" \
    "Get all users"

# Test Project Store Canister
echo ""
echo "📁 ===== PROJECT STORE CANISTER TESTS ====="

# Test 1: Create Project
make_request "POST" "${CANISTER_IDS[1]}" "createProject" \
    "{\"title\":\"Test DeFi Project\",\"description\":\"A test DeFi project for API testing\",\"requirements\":\"Must use React and Web3\",\"budget\":\"\$5000\",\"timeline\":\"4 weeks\",\"category\":\"Web Development\",\"skills\":[\"React\",\"TypeScript\",\"Web3\"],\"clientEmail\":\"$TEST_CLIENT_EMAIL\"}" \
    "Create a new project"

# Test 2: Get All Projects
make_request "GET" "${CANISTER_IDS[1]}" "getAllProjects" \
    "{}" \
    "Get all projects"

# Test 3: Get Open Projects
make_request "GET" "${CANISTER_IDS[1]}" "getOpenProjects" \
    "{}" \
    "Get open projects"

# Test 4: Get Projects by Client
make_request "GET" "${CANISTER_IDS[1]}" "getProjectsByClient" \
    "{\"clientEmail\":\"$TEST_CLIENT_EMAIL\"}" \
    "Get projects by client"

# Test 5: Get Project Stats
make_request "GET" "${CANISTER_IDS[1]}" "getProjectStats" \
    "{}" \
    "Get project statistics"

# Test Hackathon Store Canister
echo ""
echo "🏆 ===== HACKATHON STORE CANISTER TESTS ====="

# Test 1: Create Hackathon
make_request "POST" "${CANISTER_IDS[2]}" "createHackathon" \
    "{\"organizerEmail\":\"$TEST_CLIENT_EMAIL\",\"input\":{\"title\":\"Test ICP Hackathon\",\"description\":\"A test hackathon for API testing\",\"organizer\":\"Test Organizer\",\"mode\":{\"Virtual\":null},\"prizePool\":\"\$10000\",\"prizes\":[{\"position\":\"1st\",\"amount\":\"\$5000\",\"description\":\"Winner\",\"token\":\"ICP\"}],\"timeline\":\"48 hours\",\"startDate\":$(date -d '+7 days' +%s)000000000,\"endDate\":$(date -d '+9 days' +%s)000000000,\"registrationDeadline\":$(date -d '+6 days' +%s)000000000,\"submissionDeadline\":$(date -d '+9 days' +%s)000000000,\"tags\":[\"ICP\",\"Web3\",\"DeFi\"],\"category\":{\"Web3\":null},\"featured\":true,\"requirements\":[\"Must use ICP\"],\"deliverables\":[\"Working demo\"],\"judgingCriteria\":[\"Innovation\"],\"maxParticipants\":100,\"maxTeamSize\":4,\"location\":null,\"website\":null,\"discord\":null,\"twitter\":null,\"imageUrl\":null,\"bannerUrl\":null}}}" \
    "Create a new hackathon"

# Test 2: Get All Hackathons
make_request "GET" "${CANISTER_IDS[2]}" "getAllHackathons" \
    "{}" \
    "Get all hackathons"

# Test 3: Get Featured Hackathons
make_request "GET" "${CANISTER_IDS[2]}" "getFeaturedHackathons" \
    "{}" \
    "Get featured hackathons"

# Test 4: Get Hackathons by Status
make_request "GET" "${CANISTER_IDS[2]}" "getHackathonsByStatus" \
    "{\"status\":{\"RegistrationOpen\":null}}" \
    "Get hackathons by status"

# Test 5: Get Hackathon Stats
make_request "GET" "${CANISTER_IDS[2]}" "getHackathonStats" \
    "{}" \
    "Get hackathon statistics"

echo ""
echo "🎉 All API tests completed!"
echo ""
echo "📊 Summary:"
echo "✅ User Management Canister - Tested 5 functions"
echo "✅ Project Store Canister - Tested 5 functions"  
echo "✅ Hackathon Store Canister - Tested 5 functions"
echo ""
echo "💡 Note: This script demonstrates cURL usage for testing canisters."
echo "   For production use, consider using the official DFINITY agent libraries."
