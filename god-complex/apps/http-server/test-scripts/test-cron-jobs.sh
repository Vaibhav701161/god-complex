#!/bin/bash
source ./api-test-helpers.sh

echo "=== TEST: Cron Job Behavior ==="

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

# Test 1: Daily Finalization
echo -e "\n1. Testing daily finalization..."
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)

# Check current finalization status
echo "Current finalization status:"
admin_request GET "/admin/health/daily-finalization" ""

# Manually trigger finalization for yesterday
echo -e "\nTriggering finalization for $YESTERDAY..."
admin_request POST "/admin/daily/reconcile" '{
    "groupId": "'$GROUP_ID'",
    "date": "'$YESTERDAY'",
    "reason": "Manual test of daily finalization"
}'

# Verify finalization record created
echo -e "\nVerifying finalization record..."
admin_request GET "/admin/health/daily-finalization" ""

# Test 2: Monthly Close
echo -e "\n2. Testing monthly close..."
LAST_MONTH=$(date -d "last month" +%Y-%m 2>/dev/null || date -v-1m +%Y-%m)

echo "Triggering monthly close for $LAST_MONTH..."
admin_request POST "/admin/monthly/close" '{
    "groupId": "'$GROUP_ID'",
    "month": "'$LAST_MONTH'",
    "reason": "Manual test of monthly close"
}'

# Verify monthly outcome created
echo -e "\nFetching monthly outcome..."
auth_request GET "/monthly/$GROUP_ID/$LAST_MONTH"

echo -e "\n=== Database Verification ==="
echo "1. SELECT * FROM \"daily_finalization\" WHERE \"groupId\" = '$GROUP_ID' ORDER BY date DESC;"
echo "2. SELECT * FROM \"MonthlyOutcome\" WHERE \"groupId\" = '$GROUP_ID' AND month = '$LAST_MONTH';"
echo "3. SELECT * FROM \"audit_log\" WHERE source = 'CRON' OR source = 'ADMIN' ORDER BY \"createdAt\" DESC LIMIT 10;"
