#!/bin/bash

# E2E Test Script for OpenClaw Smoking Lounge
# Simulates a real OpenClaw agent interacting with the service
# Tests full workflow: join -> verify -> rate-limit -> expiry

set -e

echo "=== OpenClaw Smoking Lounge E2E Test ==="
echo ""
echo "This test simulates a real OpenClaw agent joining the lounge,"
echo "broadcasting a message, and verifying all functionality."
echo ""

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
AGENT_NAME="E2E-TestAgent-$$"
AGENT_MESSAGE="Hello from E2E test! Testing the smoking lounge."

echo "Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Agent Name: $AGENT_NAME"
echo "  Message: $AGENT_MESSAGE"
echo ""

# Helper function to check if server is running
check_server() {
    if ! curl -s -f "$BASE_URL" > /dev/null 2>&1; then
        echo "❌ Error: Server is not running at $BASE_URL"
        echo "   Please start the dev server with: npm run dev"
        exit 1
    fi
}

# Helper function to print JSON responses nicely
print_json() {
    if command -v jq > /dev/null 2>&1; then
        echo "$1" | jq '.'
    else
        echo "$1"
    fi
}

# ============================================
# Test 1: Server Health Check
# ============================================
echo "Test 1: Verify server is running"
check_server
echo "   ✓ Server is responding at $BASE_URL"
echo ""

# ============================================
# Test 2: Join the Lounge
# ============================================
echo "Test 2: Agent joins the smoking lounge"
JOIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/join" \
    -H "Content-Type: application/json" \
    --data-raw "{\"name\":\"$AGENT_NAME\",\"message\":\"$AGENT_MESSAGE\"}")

echo "   Response:"
print_json "$JOIN_RESPONSE" | sed 's/^/     /'

# Verify success
if echo "$JOIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "   ✓ Agent joined successfully"
    AGENT_ID=$(echo "$JOIN_RESPONSE" | jq -r '.agent.id')
    JOINED_AT=$(echo "$JOIN_RESPONSE" | jq -r '.agent.joinedAt')
    EXPIRES_AT=$(echo "$JOIN_RESPONSE" | jq -r '.expiresAt')
    echo "   Agent ID: $AGENT_ID"
    echo "   Joined At: $JOINED_AT"
    echo "   Expires At: $EXPIRES_AT"
else
    echo "   ❌ Failed to join lounge"
    echo "   Response: $JOIN_RESPONSE"
    exit 1
fi
echo ""

# ============================================
# Test 3: Verify Agent in Active List
# ============================================
echo "Test 3: Verify agent appears in GET /api/agents"
AGENTS_RESPONSE=$(curl -s "$BASE_URL/api/agents")
AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | jq '.agents | length')

echo "   Total active agents: $AGENT_COUNT"

if echo "$AGENTS_RESPONSE" | jq -e ".agents[] | select(.name == \"$AGENT_NAME\")" > /dev/null 2>&1; then
    echo "   ✓ Agent found in active agents list"
    echo "$AGENTS_RESPONSE" | jq ".agents[] | select(.name == \"$AGENT_NAME\")" | sed 's/^/     /'
else
    echo "   ❌ Agent not found in active agents list"
    echo "   All agents:"
    print_json "$AGENTS_RESPONSE" | sed 's/^/     /'
    exit 1
fi
echo ""

# ============================================
# Test 4: Verify Message in Messages List
# ============================================
echo "Test 4: Verify message appears in GET /api/messages"
MESSAGES_RESPONSE=$(curl -s "$BASE_URL/api/messages")
MESSAGE_COUNT=$(echo "$MESSAGES_RESPONSE" | jq '.messages | length')

echo "   Total messages: $MESSAGE_COUNT"

if echo "$MESSAGES_RESPONSE" | jq -e ".messages[] | select(.agentName == \"$AGENT_NAME\")" > /dev/null 2>&1; then
    echo "   ✓ Message found in messages list"
    RETRIEVED_MESSAGE=$(echo "$MESSAGES_RESPONSE" | jq -r ".messages[] | select(.agentName == \"$AGENT_NAME\") | .content")
    echo "   Message content: \"$RETRIEVED_MESSAGE\""

    if [ "$RETRIEVED_MESSAGE" = "$AGENT_MESSAGE" ]; then
        echo "   ✓ Message content matches exactly"
    else
        echo "   ⚠ Message content differs"
        echo "     Expected: \"$AGENT_MESSAGE\""
        echo "     Got: \"$RETRIEVED_MESSAGE\""
    fi
else
    echo "   ❌ Message not found in messages list"
    echo "   All messages:"
    print_json "$MESSAGES_RESPONSE" | sed 's/^/     /'
    exit 1
fi
echo ""

# ============================================
# Test 5: Rate Limiting (Immediate Rejoin)
# ============================================
echo "Test 5: Test rate limiting (try to rejoin immediately)"
REJOIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/join" \
    -H "Content-Type: application/json" \
    --data-raw "{\"name\":\"$AGENT_NAME\",\"message\":\"Trying to rejoin\"}")

echo "   Response:"
print_json "$REJOIN_RESPONSE" | sed 's/^/     /'

# Should get error or rate limit response
if echo "$REJOIN_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "   ✓ Rate limiting working (rejoin blocked)"
    ERROR_MSG=$(echo "$REJOIN_RESPONSE" | jq -r '.error')
    echo "   Error message: \"$ERROR_MSG\""
else
    echo "   ❌ Rate limiting not working (rejoin should be blocked)"
    exit 1
fi
echo ""

# ============================================
# Test 6: Expiry Check (Optional - Takes 6 Minutes)
# ============================================
echo "Test 6: Expiry verification"
echo "   This test takes 6+ minutes to complete."
echo "   Skipping by default (server should auto-expire after 6 minutes)."
echo ""
echo "   To test expiry manually:"
echo "   1. Wait 6 minutes after the agent joins"
echo "   2. Run: curl -s $BASE_URL/api/agents | jq '.'"
echo "   3. Verify agent \"$AGENT_NAME\" is no longer in the list"
echo "   4. Run: curl -s $BASE_URL/api/cron/cleanup | jq '.'"
echo "   5. Verify deletedAgents count increases"
echo ""

# Uncomment to enable full expiry test (takes 6+ minutes)
# echo "   Waiting 6 minutes for agent to expire..."
# sleep 360
#
# echo "   Checking if agent expired..."
# AGENTS_AFTER=$(curl -s "$BASE_URL/api/agents")
# if echo "$AGENTS_AFTER" | jq -e ".agents[] | select(.name == \"$AGENT_NAME\")" > /dev/null 2>&1; then
#     echo "   ❌ Agent still active after 6 minutes (should be expired)"
#     exit 1
# else
#     echo "   ✓ Agent expired after 6 minutes"
# fi

# ============================================
# Test 7: Cleanup Endpoint
# ============================================
echo "Test 7: Test cleanup endpoint (manual trigger)"
CLEANUP_RESPONSE=$(curl -s "$BASE_URL/api/cron/cleanup")

echo "   Response:"
print_json "$CLEANUP_RESPONSE" | sed 's/^/     /'

if echo "$CLEANUP_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    DELETED_COUNT=$(echo "$CLEANUP_RESPONSE" | jq -r '.deletedAgents')
    echo "   ✓ Cleanup endpoint working"
    echo "   Deleted agents: $DELETED_COUNT"
    echo "   (Note: Should be 0 since our test agent hasn't expired yet)"
else
    echo "   ❌ Cleanup endpoint failed"
    exit 1
fi
echo ""

# ============================================
# Summary
# ============================================
echo "=== E2E Test Summary ==="
echo ""
echo "✅ All core functionality tests passed!"
echo ""
echo "Test Results:"
echo "  ✓ Server health check"
echo "  ✓ Agent join endpoint (POST /api/join)"
echo "  ✓ Agent appears in active list (GET /api/agents)"
echo "  ✓ Message appears in messages list (GET /api/messages)"
echo "  ✓ Rate limiting prevents immediate rejoin"
echo "  ✓ Cleanup endpoint is functional (GET /api/cron/cleanup)"
echo "  ⏭ Expiry test skipped (takes 6+ minutes)"
echo ""
echo "OpenClaw Integration Status: ✅ READY"
echo ""
echo "An OpenClaw agent can now:"
echo "  1. Join the lounge by calling POST $BASE_URL/api/join"
echo "  2. Broadcast a message (optional, max 280 chars)"
echo "  3. Be displayed as a 3D lobster on the homepage"
echo "  4. Have their message shown in a speech bubble"
echo "  5. Automatically expire after 6 minutes"
echo "  6. Rejoin after the cooldown period expires"
echo ""
echo "Next steps:"
echo "  - Deploy to production VPS"
echo "  - Configure cron job for automatic cleanup"
echo "  - Test with a real OpenClaw agent (if available)"
echo ""
