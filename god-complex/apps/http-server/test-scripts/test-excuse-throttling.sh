#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: Excuse Throttling (3 same excuses in 7 days) ==="

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

# Submit and fail with same excuse 3 times
for i in 1 2 3; do
    echo -e "\n=== Day $i ==="
    
    # Calculate date (today - (3-i) days to simulate past submissions)
    TEST_DATE=$(date -d "-$((3-i)) days" +%Y-%m-%d 2>/dev/null || date -v-$((3-i))d +%Y-%m-%d)
    
    echo "1. Submitting goals for $TEST_DATE..."
    auth_request POST "/daily-goals/submit" '{
        "groupId": "'$GROUP_ID'",
        "date": "'$TEST_DATE'",
        "goals": [
            {
                "title": "Daily task '$i'",
                "category": "CAREER",
                "finishCondition": "Complete task",
                "minEffort": "Start task",
                "isUncomfortable": false
            }
        ]
    }'
    
    # Get goal ID
    GOAL_ID=$(auth_request GET "/daily-goals/$GROUP_ID/$TEST_DATE" | jq -r '.goals[0].id')
    
    echo "2. Checking in with POOR_PLANNING excuse..."
    CHECKIN=$(auth_request POST "/daily-checkin" '{
        "groupId": "'$GROUP_ID'",
        "date": "'$TEST_DATE'",
        "results": [
            {
                "goalId": "'$GOAL_ID'",
                "status": "FAILED",
                "failureReason": "POOR_PLANNING"
            }
        ]
    }')
    echo $CHECKIN
    
    # On 3rd attempt, check if excuse was rejected
    if [ $i -eq 3 ]; then
        echo -e "\n3. Verifying excuse throttling..."
        RESULT=$(auth_request GET "/daily-goals/$GROUP_ID/$TEST_DATE")
        ACTUAL_REASON=$(echo $RESULT | jq -r '.goals[0].result.failureReason')
        
        if [ "$ACTUAL_REASON" == "SYSTEM_ASSIGNED" ]; then
            echo "✓ Excuse throttling PASSED - System overrode to SYSTEM_ASSIGNED"
        else
            echo "✗ Excuse throttling FAILED - Expected SYSTEM_ASSIGNED, got $ACTUAL_REASON"
        fi
    fi
done

echo -e "\n=== Database Verification ==="
echo "Check audit log for excuse rejections:"
echo "SELECT * FROM \"audit_log\" WHERE action = 'EXCUSE_REJECTED' AND \"actorId\" = '$USER_ID';"
echo -e "\nCheck goal results:"
echo "SELECT gr.\"failureReason\", COUNT(*) FROM \"GoalResult\" gr"
echo "JOIN \"Goal\" g ON gr.\"goalId\" = g.id"
echo "WHERE g.\"userId\" = '$USER_ID' AND g.date >= NOW() - INTERVAL '7 days'"
echo "GROUP BY gr.\"failureReason\";"
