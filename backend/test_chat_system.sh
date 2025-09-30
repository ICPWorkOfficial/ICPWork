#!/bin/bash

# Chat System Integration Test Script
# This script tests the Motoko Chat System canister functionality

echo "🚀 Starting Chat System Integration Tests..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_result="$3"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "Command: $command"
    
    result=$(eval "$command" 2>&1)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        echo "Result: $result"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Error: $result"
        ((TESTS_FAILED++))
    fi
}

# Function to check if result contains expected text
run_test_with_validation() {
    local test_name="$1"
    local command="$2"
    local expected_text="$3"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "Command: $command"
    echo "Expected: $expected_text"
    
    result=$(eval "$command" 2>&1)
    exit_code=$?
    
    if [ $exit_code -eq 0 ] && [[ "$result" == *"$expected_text"* ]]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        echo "Result: $result"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Result: $result"
        echo "Expected to contain: $expected_text"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${YELLOW}📋 Test Plan:${NC}"
echo "1. Deploy Chat System canister"
echo "2. Test user management (create, get, update)"
echo "3. Test connection management (connect, disconnect, online status)"
echo "4. Test private messaging (send, receive, mark as read)"
echo "5. Test chat room management (create, add participants)"
echo "6. Test system statistics and health check"
echo "7. Test cleanup functions"

# Deploy the chat system canister
echo -e "\n${YELLOW}🚀 Deploying Chat System Canister...${NC}"
run_test "Deploy Chat System" "dfx deploy chat_system" "Deployed chat_system"

# Get the canister ID
CHAT_CANISTER_ID=$(dfx canister id chat_system)
echo -e "\n${BLUE}Chat System Canister ID: $CHAT_CANISTER_ID${NC}"

# Test 1: User Management
echo -e "\n${YELLOW}👥 Testing User Management...${NC}"

run_test "Create User 1" "dfx canister call chat_system createUser '(\"user1\", \"Alice\", null)'" "ok"
run_test "Create User 2" "dfx canister call chat_system createUser '(\"user2\", \"Bob\", null)'" "ok"
run_test "Create User 3" "dfx canister call chat_system createUser '(\"user3\", \"Charlie\", null)'" "ok"

run_test "Get User 1" "dfx canister call chat_system getUser '(\"user1\")'" "ok"
run_test "Get All Users" "dfx canister call chat_system getAllUsers" "record"

# Test duplicate user creation (should fail)
run_test_with_validation "Duplicate User Creation (should fail)" "dfx canister call chat_system createUser '(\"user1\", \"Alice2\", null)'" "err"

# Test 2: Connection Management
echo -e "\n${YELLOW}🔗 Testing Connection Management...${NC}"

run_test "Connect User 1" "dfx canister call chat_system connectUser '(\"user1\")'" "ok"
run_test "Connect User 2" "dfx canister call chat_system connectUser '(\"user2\")'" "ok"

run_test "Check User 1 Online Status" "dfx canister call chat_system isUserOnline '(\"user1\")'" "true"
run_test "Check User 3 Online Status" "dfx canister call chat_system isUserOnline '(\"user3\")'" "false"

run_test "Get Online Users" "dfx canister call chat_system getOnlineUsers" "record"
run_test "Get Active Connections" "dfx canister call chat_system getActiveConnections" "record"

run_test "Update Last Seen" "dfx canister call chat_system updateLastSeen '(\"user1\")'" "ok"

# Test 3: Private Messaging
echo -e "\n${YELLOW}💬 Testing Private Messaging...${NC}"

run_test "Send Message User1 to User2" "dfx canister call chat_system sendPrivateMessage '(\"user1\", \"user2\", \"Hello Bob!\")'" "ok"
run_test "Send Message User2 to User1" "dfx canister call chat_system sendPrivateMessage '(\"user2\", \"user1\", \"Hi Alice!\")'" "ok"
run_test "Send Message User1 to User2 (2nd)" "dfx canister call chat_system sendPrivateMessage '(\"user1\", \"user2\", \"How are you?\")'" "ok"

# Test sending to offline user (should fail)
run_test_with_validation "Send Message to Offline User (should fail)" "dfx canister call chat_system sendPrivateMessage '(\"user1\", \"user3\", \"Hello Charlie!\")'" "err"

run_test "Get User1 Messages" "dfx canister call chat_system getUserMessages '(\"user1\", null)'" "record"
run_test "Get User2 Messages" "dfx canister call chat_system getUserMessages '(\"user2\", null)'" "record"

run_test "Get Conversation User1-User2" "dfx canister call chat_system getConversation '(\"user1\", \"user2\", null)'" "record"

# Test message operations
run_test "Mark Message as Delivered" "dfx canister call chat_system markMessageDelivered '(1)'" "ok"
run_test "Mark Message as Read" "dfx canister call chat_system markMessageRead '(1)'" "ok"

run_test "Get Message by ID" "dfx canister call chat_system getMessage '(1)'" "ok"

# Test 4: Chat Room Management
echo -e "\n${YELLOW}🏠 Testing Chat Room Management...${NC}"

run_test "Create Chat Room" "dfx canister call chat_system createChatRoom '(\"room1\", \"General Chat\", vec {\"user1\"; \"user2\"}, true)'" "ok"
run_test "Create Public Chat Room" "dfx canister call chat_system createChatRoom '(\"room2\", \"Public Room\", vec {\"user1\"}, false)'" "ok"

run_test "Get Chat Room" "dfx canister call chat_system getChatRoom '(\"room1\")'" "ok"
run_test "Get All Chat Rooms" "dfx canister call chat_system getAllChatRooms" "record"

run_test "Add Participant to Room" "dfx canister call chat_system addParticipantToRoom '(\"room1\", \"user3\")'" "ok"
run_test "Get User Chat Rooms" "dfx canister call chat_system getUserChatRooms '(\"user1\")'" "record"

run_test "Remove Participant from Room" "dfx canister call chat_system removeParticipantFromRoom '(\"room1\", \"user3\")'" "ok"

# Test duplicate room creation (should fail)
run_test_with_validation "Duplicate Room Creation (should fail)" "dfx canister call chat_system createChatRoom '(\"room1\", \"Duplicate Room\", vec {\"user1\"}, false)'" "err"

# Test 5: System Statistics and Health Check
echo -e "\n${YELLOW}📊 Testing System Statistics...${NC}"

run_test "Get System Stats" "dfx canister call chat_system getSystemStats" "record"
run_test "Get System Info" "dfx canister call chat_system getSystemInfo" "record"
run_test "Health Check" "dfx canister call chat_system healthCheck" "record"

# Test 6: Cleanup Functions
echo -e "\n${YELLOW}🧹 Testing Cleanup Functions...${NC}"

run_test "Disconnect User 1" "dfx canister call chat_system disconnectUser '(\"user1\")'" "ok"
run_test "Disconnect User 2" "dfx canister call chat_system disconnectUser '(\"user2\")'" "ok"

run_test "Check User 1 Online Status After Disconnect" "dfx canister call chat_system isUserOnline '(\"user1\")'" "false"

run_test "Cleanup Inactive Connections" "dfx canister call chat_system cleanupInactiveConnections '(60)'" "0"

# Test 7: Edge Cases and Error Handling
echo -e "\n${YELLOW}⚠️ Testing Edge Cases and Error Handling...${NC}"

run_test_with_validation "Get Non-existent User (should fail)" "dfx canister call chat_system getUser '(\"nonexistent\")'" "err"
run_test_with_validation "Get Non-existent Message (should fail)" "dfx canister call chat_system getMessage '(999)'" "err"
run_test_with_validation "Get Non-existent Chat Room (should fail)" "dfx canister call chat_system getChatRoom '(\"nonexistent\")'" "err"

# Test with limits
run_test "Get User Messages with Limit" "dfx canister call chat_system getUserMessages '(\"user1\", opt 2)'" "record"
run_test "Get Conversation with Limit" "dfx canister call chat_system getConversation '(\"user1\", \"user2\", opt 1)'" "record"

# Final Statistics
echo -e "\n${YELLOW}📈 Final System Statistics:${NC}"
dfx canister call chat_system getSystemStats

echo -e "\n${YELLOW}🏥 Final Health Check:${NC}"
dfx canister call chat_system healthCheck

# Test Summary
echo -e "\n${YELLOW}📋 Test Summary:${NC}"
echo "=============================================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Chat System is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ Some tests failed. Please check the output above.${NC}"
    exit 1
fi


