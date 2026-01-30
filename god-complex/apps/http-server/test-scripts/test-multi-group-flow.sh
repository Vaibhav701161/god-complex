#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: Multi-Group Flow ==="

# Load persisted variables from previous test
VARS_FILE="/tmp/god-complex-test-vars.sh"
if [ -f "$VARS_FILE" ]; then
    source "$VARS_FILE"
fi

GROUP_ID_1="${GROUP_ID:-}"

if [ -z "$USER_ID" ] || [ -z "$GROUP_ID_1" ]; then
    echo "Error: USER_ID or GROUP_ID not set. Run test-new-user-flow.sh first."
    exit 1
fi

# Re-authenticate user
if [ -n "$TEST_EMAIL" ] && [ -n "$TEST_PASSWORD" ]; then
    signin_user "$TEST_EMAIL" "$TEST_PASSWORD" > /dev/null
fi

# Create second group
echo -e "\n1. Creating second group..."
GROUP_2_RESPONSE=$(auth_request POST "/groups" '{
    "name": "Second Accountability Group",
    "monthlyPledge": 150,
    "cutoffHour": 20,
    "timezone": "UTC"
}')
echo $GROUP_2_RESPONSE
GROUP_ID_2=$(echo $GROUP_2_RESPONSE | jq -r '.id')

echo "Group 2 ID: $GROUP_ID_2"

# Fetch user's groups
echo -e "\n2. Fetching user's active groups..."
USER_GROUPS=$(auth_request GET "/users/me")
echo $USER_GROUPS | jq '.memberships'

# Submit goals for Group 1
echo -e "\n3. Submitting goals for Group 1..."
TODAY=$(date +%Y-%m-%d)
auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID_1'",
    "date": "'$TODAY'",
    "goals": [
        {
            "title": "Group 1 - Morning run",
            "category": "HEALTH",
            "finishCondition": "5km run",
            "minEffort": "2km jog",
            "isUncomfortable": true
        }
    ]
}'

# Submit goals for Group 2
echo -e "\n4. Submitting goals for Group 2..."
auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID_2'",
    "date": "'$TODAY'",
    "goals": [
        {
            "title": "Group 2 - Study session",
            "category": "STUDY",
            "finishCondition": "2 hours deep work",
            "minEffort": "1 hour focused study",
            "isUncomfortable": true
        }
    ]
}'

# Verify independent evaluation
echo -e "\n5. Fetching metrics for both groups..."
echo "Group 1 Metrics:"
auth_request GET "/metrics/$GROUP_ID_1/$USER_ID"
echo -e "\nGroup 2 Metrics:"
auth_request GET "/metrics/$GROUP_ID_2/$USER_ID"

echo -e "\n=== Database Verification ==="
echo "Verify independent goal tracking:"
echo "SELECT g.id, gr.name, goal.title, goal.\"isUncomfortable\" FROM \"Goal\" goal"
echo "JOIN \"Group\" gr ON goal.\"groupId\" = gr.id"
echo "WHERE goal.\"userId\" = '$USER_ID' AND goal.date = '$TODAY';"

# Export for subsequent tests
export GROUP_ID_2
