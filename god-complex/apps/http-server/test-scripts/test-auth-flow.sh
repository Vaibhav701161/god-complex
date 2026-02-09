#!/bin/bash

# =============================================================================
# AUTH FLOW TEST SCRIPT
# Tests the complete authentication flow
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:4000}"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Test User"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           AUTH FLOW TEST SUITE                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "API URL: ${YELLOW}${API_URL}${NC}"
echo -e "Test Email: ${YELLOW}${TEST_EMAIL}${NC}"
echo ""

# Track test results
PASSED=0
FAILED=0

test_result() {
    local name=$1
    local status=$2
    
    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $name"
        FAILED=$((FAILED + 1))
    fi
}

# -----------------------------------------------------------------------------
# Test 1: Health Check
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 1: Health Check${NC}"
HEALTH=$(curl -s -w "%{http_code}" -o /tmp/health.json "${API_URL}/api/health")
if [ "$HEALTH" = "200" ]; then
    test_result "Health endpoint" "pass"
else
    test_result "Health endpoint (got $HEALTH)" "fail"
fi

# -----------------------------------------------------------------------------
# Test 2: Signup
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 2: User Signup${NC}"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "${API_URL}/api/auth/sign-up/email" \
    -H "Content-Type: application/json" \
    -c /tmp/cookies.txt \
    -d "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"${TEST_PASSWORD}\",
        \"name\": \"${TEST_NAME}\"
    }")

SIGNUP_STATUS=$(echo "$SIGNUP_RESPONSE" | tail -1)
SIGNUP_BODY=$(echo "$SIGNUP_RESPONSE" | head -n -1)

if [ "$SIGNUP_STATUS" = "200" ] || [ "$SIGNUP_STATUS" = "201" ]; then
    test_result "User signup" "pass"
    echo "  Response: $SIGNUP_BODY"
else
    test_result "User signup (status: $SIGNUP_STATUS)" "fail"
    echo "  Response: $SIGNUP_BODY"
fi

# -----------------------------------------------------------------------------
# Test 3: Get Session After Signup
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 3: Get Session${NC}"
SESSION_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X GET "${API_URL}/api/auth/session" \
    -b /tmp/cookies.txt)

SESSION_STATUS=$(echo "$SESSION_RESPONSE" | tail -1)
SESSION_BODY=$(echo "$SESSION_RESPONSE" | head -n -1)

if [ "$SESSION_STATUS" = "200" ]; then
    # Check if we got user data
    if echo "$SESSION_BODY" | grep -q "user"; then
        test_result "Session after signup" "pass"
    else
        test_result "Session after signup (no user in response)" "fail"
    fi
else
    test_result "Session after signup (status: $SESSION_STATUS)" "fail"
fi

# -----------------------------------------------------------------------------
# Test 4: Protected Route Without Auth
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 4: Protected Route (No Auth)${NC}"
PROTECTED_NOAUTH=$(curl -s -w "\n%{http_code}" \
    -X GET "${API_URL}/api/users/me")

PROTECTED_NOAUTH_STATUS=$(echo "$PROTECTED_NOAUTH" | tail -1)

if [ "$PROTECTED_NOAUTH_STATUS" = "401" ]; then
    test_result "Protected route blocks unauthenticated" "pass"
else
    test_result "Protected route blocks unauthenticated (got $PROTECTED_NOAUTH_STATUS)" "fail"
fi

# -----------------------------------------------------------------------------
# Test 5: Protected Route With Auth
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 5: Protected Route (With Auth)${NC}"
PROTECTED_AUTH=$(curl -s -w "\n%{http_code}" \
    -X GET "${API_URL}/api/users/me" \
    -b /tmp/cookies.txt)

PROTECTED_AUTH_STATUS=$(echo "$PROTECTED_AUTH" | tail -1)
PROTECTED_AUTH_BODY=$(echo "$PROTECTED_AUTH" | head -n -1)

if [ "$PROTECTED_AUTH_STATUS" = "200" ]; then
    test_result "Protected route allows authenticated" "pass"
else
    test_result "Protected route allows authenticated (status: $PROTECTED_AUTH_STATUS)" "fail"
    echo "  Response: $PROTECTED_AUTH_BODY"
fi

# -----------------------------------------------------------------------------
# Test 6: Complete Application
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 6: Complete Application${NC}"
APP_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "${API_URL}/api/users/complete-application" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{
        "displayName": "TestUser",
        "motivation": "Testing the God Complex system for development purposes"
    }')

APP_STATUS=$(echo "$APP_RESPONSE" | tail -1)
APP_BODY=$(echo "$APP_RESPONSE" | head -n -1)

if [ "$APP_STATUS" = "200" ]; then
    if echo "$APP_BODY" | grep -q "applicationDone.*true"; then
        test_result "Complete application" "pass"
    else
        test_result "Complete application (applicationDone not true)" "fail"
    fi
else
    test_result "Complete application (status: $APP_STATUS)" "fail"
    echo "  Response: $APP_BODY"
fi

# -----------------------------------------------------------------------------
# Test 7: Signin
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 7: User Signin${NC}"

# First sign out
curl -s -X POST "${API_URL}/api/auth/sign-out" -b /tmp/cookies.txt > /dev/null

SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "${API_URL}/api/auth/sign-in/email" \
    -H "Content-Type: application/json" \
    -c /tmp/cookies2.txt \
    -d "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"${TEST_PASSWORD}\"
    }")

SIGNIN_STATUS=$(echo "$SIGNIN_RESPONSE" | tail -1)
SIGNIN_BODY=$(echo "$SIGNIN_RESPONSE" | head -n -1)

if [ "$SIGNIN_STATUS" = "200" ]; then
    test_result "User signin" "pass"
else
    test_result "User signin (status: $SIGNIN_STATUS)" "fail"
    echo "  Response: $SIGNIN_BODY"
fi

# -----------------------------------------------------------------------------
# Test 8: Invalid Credentials
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 8: Invalid Credentials${NC}"
INVALID_SIGNIN=$(curl -s -w "\n%{http_code}" \
    -X POST "${API_URL}/api/auth/sign-in/email" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"wrongpassword\"
    }")

INVALID_STATUS=$(echo "$INVALID_SIGNIN" | tail -1)

if [ "$INVALID_STATUS" = "401" ] || [ "$INVALID_STATUS" = "400" ]; then
    test_result "Invalid credentials rejected" "pass"
else
    test_result "Invalid credentials rejected (got $INVALID_STATUS)" "fail"
fi

# -----------------------------------------------------------------------------
# Test 9: Signout
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 9: User Signout${NC}"
SIGNOUT_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "${API_URL}/api/auth/sign-out" \
    -b /tmp/cookies2.txt)

SIGNOUT_STATUS=$(echo "$SIGNOUT_RESPONSE" | tail -1)

if [ "$SIGNOUT_STATUS" = "200" ]; then
    test_result "User signout" "pass"
else
    test_result "User signout (status: $SIGNOUT_STATUS)" "fail"
fi

# -----------------------------------------------------------------------------
# Test 10: Session After Signout
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 10: Session After Signout${NC}"
SESSION_AFTER=$(curl -s -w "\n%{http_code}" \
    -X GET "${API_URL}/api/users/me" \
    -b /tmp/cookies2.txt)

SESSION_AFTER_STATUS=$(echo "$SESSION_AFTER" | tail -1)

if [ "$SESSION_AFTER_STATUS" = "401" ]; then
    test_result "Session cleared after signout" "pass"
else
    test_result "Session cleared after signout (got $SESSION_AFTER_STATUS)" "fail"
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

# Cleanup
rm -f /tmp/health.json /tmp/cookies.txt /tmp/cookies2.txt

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
