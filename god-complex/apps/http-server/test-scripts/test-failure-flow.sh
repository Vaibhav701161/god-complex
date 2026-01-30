#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: Failure & Penalty Flow ==="

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

# Step 1: Submit goals but don't check in (simulate missed check-in)
echo -e "\n1. Submitting goals without check-in..."
TODAY=$(date +%Y-%m-%d)
auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$TODAY'",
    "goals": [
        {
            "title": "Missed goal",
            "category": "HEALTH",
            "finishCondition": "Exercise",
            "minEffort": "Stretch",
            "isUncomfortable": true
        }
    ]
}'

# Step 2: Manually trigger daily finalization (simulates cron)
echo -e "\n2. Triggering daily finalization..."
admin_request POST "/admin/daily/reconcile" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$TODAY'",
    "reason": "Manual test - simulating missed check-in"
}'

# Step 3: Check penalty assignment
echo -e "\n3. Checking penalty assignments..."
CURRENT_MONTH=$(date +%Y-%m)
PENALTIES=$(auth_request GET "/penalty/$GROUP_ID/$CURRENT_MONTH")
echo $PENALTIES

# Step 4: Attempt to join another group (should fail if penalties exist)
echo -e "\n4. Attempting to join new group with failed penalties..."
NEW_GROUP_RESPONSE=$(auth_request POST "/groups" '{
    "name": "New Group Test",
    "monthlyPledge": 100,
    "cutoffHour": 22,
    "timezone": "UTC"
}')
NEW_GROUP_ID=$(echo $NEW_GROUP_RESPONSE | jq -r '.id')

JOIN_RESPONSE=$(auth_request POST "/groups/$NEW_GROUP_ID/join" '{}')
echo $JOIN_RESPONSE
# Should return error if penalties are failed

# Step 5: Complete penalty
echo -e "\n5. Completing penalty..."
PENALTY_ID=$(echo $PENALTIES | jq -r '.penalties[0].id')
if [ "$PENALTY_ID" != "null" ] && [ -n "$PENALTY_ID" ]; then
    admin_request POST "/penalty/$PENALTY_ID/complete" '{}'
else
    echo "No penalties found to complete"
fi

echo -e "\n=== Database Verification ==="
echo "1. SELECT * FROM \"PenaltyAssignment\" WHERE \"userId\" = '$USER_ID';"
echo "2. SELECT * FROM \"daily_finalization\" WHERE \"groupId\" = '$GROUP_ID' AND date = '$TODAY';"
echo "3. SELECT * FROM \"audit_log\" WHERE \"targetType\" = 'PENALTY' ORDER BY \"createdAt\" DESC;"
