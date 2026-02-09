#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: New User Flow ==="

# Variables file to persist between tests
VARS_FILE="/tmp/god-complex-test-vars.sh"

# Step 1: Sign up via Better Auth
echo -e "\n1. Creating new user..."
TEST_EMAIL="test-user-$(date +%s)@test.com"
TEST_PASSWORD="SecurePass123!"

SIGNUP_RESPONSE=$(signup_user "$TEST_EMAIL" "$TEST_PASSWORD" "Test User")
echo "Signup response: $SIGNUP_RESPONSE"

# Check for error in response
if echo "$SIGNUP_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Signup failed: $SIGNUP_RESPONSE"
    exit 1
fi

# Check if response contains user object
if ! echo "$SIGNUP_RESPONSE" | jq -e '.user' > /dev/null 2>&1; then
    echo "❌ Invalid signup response (no user object): $SIGNUP_RESPONSE"
    exit 1
fi

# Extract user ID from response
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.user.id')

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo "❌ Failed to extract user ID from response"
    exit 1
fi

echo "✅ User ID: $USER_ID"
echo "Email: $TEST_EMAIL"

# Step 2: Verify email (simulate)
echo -e "\n2. Verifying email..."
# In production, this would be done via email link
# For testing, manually update database:
# UPDATE "user" SET "emailVerified" = true WHERE id = '$USER_ID';

# Step 3: Complete application
echo -e "\n3. Completing application..."
# This should be done via frontend, but verify the user record exists
auth_request GET "/users/me"

# Step 4: Create a group
echo -e "\n4. Creating group..."
GROUP_RESPONSE=$(auth_request POST "/groups" '{
    "name": "Test Accountability Group",
    "monthlyPledge": 100,
    "cutoffHour": 22,
    "timezone": "America/New_York"
}')
echo "Group response: $GROUP_RESPONSE"

# Check for error in response
if echo "$GROUP_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Group creation failed: $GROUP_RESPONSE"
    exit 1
fi

GROUP_ID=$(echo $GROUP_RESPONSE | jq -r '.id')
if [ -z "$GROUP_ID" ] || [ "$GROUP_ID" = "null" ]; then
    echo "❌ Failed to extract group ID from response"
    exit 1
fi
echo "✅ Group ID: $GROUP_ID"

# Step 5: Submit daily goals
echo -e "\n5. Submitting daily goals..."
TODAY=$(date +%Y-%m-%d)
GOALS_RESPONSE=$(auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$TODAY'",
    "goals": [
        {
            "title": "Morning workout",
            "category": "HEALTH",
            "finishCondition": "Complete 30 min cardio",
            "minEffort": "15 min walk",
            "isUncomfortable": true
        },
        {
            "title": "Code review",
            "category": "CAREER",
            "finishCondition": "Review 3 PRs",
            "minEffort": "Review 1 PR",
            "isUncomfortable": false
        }
    ]
}')
echo "Goals response: $GOALS_RESPONSE"

if echo "$GOALS_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Goals submission failed: $GOALS_RESPONSE"
    exit 1
fi
echo "✅ Daily goals submitted"

# Step 6: Check-in with results
echo -e "\n6. Submitting check-in..."
GOALS_DATA=$(auth_request GET "/daily-goals/$GROUP_ID/$TODAY")
echo "Goals data response: $GOALS_DATA"

if echo "$GOALS_DATA" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Failed to fetch goals: $GOALS_DATA"
    exit 1
fi

GOAL_ID_1=$(echo $GOALS_DATA | jq -r '.goals[0].id')
GOAL_ID_2=$(echo $GOALS_DATA | jq -r '.goals[1].id')

if [ -z "$GOAL_ID_1" ] || [ "$GOAL_ID_1" = "null" ]; then
    echo "❌ Failed to extract goal IDs from response"
    exit 1
fi
echo "✅ Goals fetched successfully"

CHECKIN_RESPONSE=$(auth_request POST "/daily-checkin" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$TODAY'",
    "results": [
        {
            "goalId": "'$GOAL_ID_1'",
            "status": "COMPLETED"
        },
        {
            "goalId": "'$GOAL_ID_2'",
            "status": "MIN_EFFORT"
        }
    ]
}')
echo "Check-in response: $CHECKIN_RESPONSE"

if echo "$CHECKIN_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Check-in failed: $CHECKIN_RESPONSE"
    exit 1
fi
echo "✅ Check-in submitted successfully"

# Step 7: View dashboard
echo -e "\n7. Fetching dashboard metrics..."
METRICS_RESPONSE=$(auth_request GET "/metrics/$GROUP_ID/$USER_ID")
echo "Metrics response: $METRICS_RESPONSE"

if echo "$METRICS_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Failed to fetch dashboard metrics: $METRICS_RESPONSE"
    exit 1
fi
echo "✅ Dashboard metrics fetched successfully"

# Save variables for subsequent tests
echo "export USER_ID='$USER_ID'" > "$VARS_FILE"
echo "export GROUP_ID='$GROUP_ID'" >> "$VARS_FILE"
echo "export TEST_EMAIL='$TEST_EMAIL'" >> "$VARS_FILE"
echo "export TEST_PASSWORD='$TEST_PASSWORD'" >> "$VARS_FILE"

echo -e "\n=== Database Verification ==="
echo "Run these SQL queries to verify:"
echo "1. SELECT * FROM \"user\" WHERE id = '$USER_ID';"
echo "2. SELECT * FROM \"Group\" WHERE id = '$GROUP_ID';"
echo "3. SELECT * FROM \"Membership\" WHERE \"userId\" = '$USER_ID' AND \"groupId\" = '$GROUP_ID';"
echo "4. SELECT * FROM \"Goal\" WHERE \"userId\" = '$USER_ID' AND date = '$TODAY';"
echo "5. SELECT * FROM \"GoalResult\" WHERE \"userId\" = '$USER_ID';"
