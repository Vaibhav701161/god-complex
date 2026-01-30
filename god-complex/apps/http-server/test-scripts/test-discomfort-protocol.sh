#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: Discomfort Protocol (Weekly Validation) ==="

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

# Get current week range
WEEK_START=$(date -d "monday" +%Y-%m-%d 2>/dev/null || date -v-monday +%Y-%m-%d)

# Test 1: Submit goals without uncomfortable goal (should fail if no uncomfortable goals this week)
echo -e "\n1. Testing submission without uncomfortable goal..."
NO_DISCOMFORT=$(auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$(date +%Y-%m-%d)'",
    "goals": [
        {
            "title": "Easy task",
            "category": "CAREER",
            "finishCondition": "Complete task",
            "minEffort": "Start task",
            "isUncomfortable": false
        }
    ]
}')
echo $NO_DISCOMFORT
# Should return: "You must set at least one uncomfortable goal this week"

# Test 2: Submit with uncomfortable goal (should succeed)
echo -e "\n2. Testing submission with uncomfortable goal..."
WITH_DISCOMFORT=$(auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$(date +%Y-%m-%d)'",
    "goals": [
        {
            "title": "Challenging task",
            "category": "HEALTH",
            "finishCondition": "Complete workout",
            "minEffort": "Light exercise",
            "isUncomfortable": true
        }
    ]
}')
echo $WITH_DISCOMFORT
# Should succeed

# Test 3: Now submit without uncomfortable goal (should succeed since we have one this week)
echo -e "\n3. Testing second submission without uncomfortable goal..."
TOMORROW=$(date -d "tomorrow" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
SECOND_SUBMIT=$(auth_request POST "/daily-goals/submit" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$TOMORROW'",
    "goals": [
        {
            "title": "Regular task",
            "category": "STUDY",
            "finishCondition": "Study 1 hour",
            "minEffort": "Study 30 min",
            "isUncomfortable": false
        }
    ]
}')
echo $SECOND_SUBMIT
# Should succeed because we already have an uncomfortable goal this week

echo -e "\n=== Database Verification ==="
echo "Check uncomfortable goals for current week:"
echo "SELECT * FROM \"Goal\" WHERE \"userId\" = '$USER_ID' AND \"isUncomfortable\" = true"
echo "AND date >= '$WEEK_START' AND date < '$WEEK_START'::date + INTERVAL '7 days';"
