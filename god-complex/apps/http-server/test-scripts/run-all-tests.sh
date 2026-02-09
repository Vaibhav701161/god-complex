#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         GOD COMPLEX - END-TO-END TEST SUITE                ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name=$1
    local test_script=$2
    
    echo -e "\n${YELLOW}▶ Running: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if bash "$test_script"; then
        echo -e "${GREEN}✓ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Prerequisites check
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check database
if ! docker ps | grep -q "godcomplex-postgres"; then
    echo -e "${RED}✗ PostgreSQL container not running${NC}"
    echo "Start database with: pnpm db:start"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL container is running${NC}"

# Check backend server
if ! curl -s http://localhost:4000/api/health > /dev/null; then
    echo -e "${RED}✗ Backend server not running on port 4000${NC}"
    echo "Start server with: cd apps/http-server && pnpm dev"
    exit 1
fi
echo -e "${GREEN}✓ Backend server is running${NC}"

# Run test suite
echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}                    INFRASTRUCTURE TESTS                     ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"

run_test "0. Database Connection" "./test-db-connection.sh"

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}                    AUTHENTICATION TESTS                     ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"

run_test "0.5. Auth Flow" "./test-auth-flow.sh"

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}                    BUSINESS LOGIC TESTS                     ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"

run_test "1. New User Flow" "./test-new-user-flow.sh"
run_test "2. Multi-Group Context Resolution" "./test-multi-group-flow.sh"
run_test "3. Failure & Penalty Flow" "./test-failure-flow.sh"
run_test "4. Excuse Throttling" "./test-excuse-throttling.sh"
run_test "5. Temporal Validation" "./test-temporal-validation.sh"
run_test "6. Discomfort Protocol" "./test-discomfort-protocol.sh"
run_test "7. Cron Job Behavior" "./test-cron-jobs.sh"

# Summary
echo -e "\n╔════════════════════════════════════════════════════════════╗"
echo -e "║                    TEST SUMMARY                            ║"
echo -e "╚════════════════════════════════════════════════════════════╝"
echo -e "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
