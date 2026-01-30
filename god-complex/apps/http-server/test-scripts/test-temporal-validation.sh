#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: Temporal Validation ==="

# Load persisted variables from previous test
VARS_FILE="/tmp/god-complex-test-vars.sh"
if [ -f "$VARS_FILE" ]; then
    source "$VARS_FILE"
fi

if [ -z "$USER_ID" ] || [ -z "$GROUP_ID" ]; then
    echo "Error: USER_ID or GROUP_ID not set. Run test-new-user-flow.sh first."
    exit 1
fi

# Re-authenticate user
if [ -n "$TEST_EMAIL" ] && [ -n "$TEST_PASSWORD" ]; then
    signin_user "$TEST_EMAIL" "$TEST_PASSWORD" > /dev/null
fi

# Test 1: Submit goals after cutoff (should fail)
echo -e "\n1. Testing goal submission after cutoff..."
# Manually set system time past cutoff or modify group cutoffHour to be in the past
PAST_CUTOFF_RESPONSE=$(auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$(date +%Y-%m-%d)'",
    "goals": [
        {
            "title": "Late submission",
            "category": "HEALTH",
            "finishCondition": "Exercise",
            "minEffort": "Stretch",
            "isUncomfortable": true
        }
    ]
}')
echo $PAST_CUTOFF_RESPONSE
# Should return: "Daily goal cutoff passed"

# Test 2: Check-in for past day (should fail)
echo -e "\n2. Testing check-in for past day..."
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)
PAST_CHECKIN=$(auth_request POST "/daily-checkin" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$YESTERDAY'",
    "results": []
}')
echo $PAST_CHECKIN
# Should return: "This day has passed. Check-in window closed."

# Test 3: Check-in for future day (should fail)
echo -e "\n3. Testing check-in for future day..."
TOMORROW=$(date -d "tomorrow" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
FUTURE_CHECKIN=$(auth_request POST "/daily-checkin" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$TOMORROW'",
    "results": []
}')
echo $FUTURE_CHECKIN
# Should return: "Cannot check in for future days."

echo -e "\n=== Verification ==="
echo "All temporal validation tests should return appropriate error messages."
