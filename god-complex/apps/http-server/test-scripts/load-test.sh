#!/bin/bash

echo "=== LOAD TEST: Concurrent Goal Submissions ==="

source ./api-test-helpers.sh

# Configuration
CONCURRENT_USERS=10
API_BASE="http://localhost:4000/api"

# Simulate 10 users submitting goals simultaneously
for i in $(seq 1 $CONCURRENT_USERS); do
    (
        echo "Starting user $i..."
        USER_EMAIL="load-test-user-$i-$(date +%s)@test.com"
        
        # Create user
        SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/auth/sign-up/email" \
            -H "Content-Type: application/json" \
            -d '{
                "email": "'$USER_EMAIL'",
                "password": "SecurePass123!",
                "name": "Load Test User '$i'"
            }')
        
        TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.token')
        USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.user.id')
        
        if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
            echo "User $i: Failed to create user"
            exit 1
        fi
        
        # Create group
        GROUP_RESPONSE=$(curl -s -X POST "$API_BASE/groups" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{
                "name": "Load Test Group '$i'",
                "monthlyPledge": 100,
                "cutoffHour": 22,
                "timezone": "UTC"
            }')
        
        GROUP_ID=$(echo $GROUP_RESPONSE | jq -r '.id')
        
        if [ "$GROUP_ID" == "null" ] || [ -z "$GROUP_ID" ]; then
            echo "User $i: Failed to create group"
            exit 1
        fi
        
        # Submit goals
        TODAY=$(date +%Y-%m-%d)
        GOALS_RESPONSE=$(curl -s -X POST "$API_BASE/daily-goals/submit" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{
                "groupId": "'$GROUP_ID'",
                "date": "'$TODAY'",
                "goals": [
                    {
                        "title": "Load test goal '$i'",
                        "category": "HEALTH",
                        "finishCondition": "Complete task",
                        "minEffort": "Start task",
                        "isUncomfortable": true
                    }
                ]
            }')
        
        echo "User $i: Completed (Group: $GROUP_ID)"
    ) &
done

# Wait for all background jobs
wait
echo -e "\nAll concurrent requests completed"

# Check database for race conditions
echo -e "\n=== Database Verification ==="
echo "Run this query to check for race conditions:"
echo "SELECT \"groupId\", date, COUNT(*) as goal_count"
echo "FROM \"Goal\""
echo "WHERE date = CURRENT_DATE"
echo "GROUP BY \"groupId\", date"
echo "HAVING COUNT(*) > 100;"
