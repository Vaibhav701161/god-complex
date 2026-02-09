#!/bin/bash

# =============================================================================
# DATABASE CONNECTION TEST
# Tests database connectivity and basic operations
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           DATABASE CONNECTION TEST                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

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
# Test 1: Docker Container
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 1: Docker Container Status${NC}"
if docker ps | grep -q "godcomplex-postgres"; then
    test_result "PostgreSQL container running" "pass"
else
    test_result "PostgreSQL container running" "fail"
    echo -e "${YELLOW}  Hint: Run 'pnpm db:start' to start the database${NC}"
fi

# -----------------------------------------------------------------------------
# Test 2: PostgreSQL Connection
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 2: PostgreSQL Connection${NC}"
if docker exec godcomplex-postgres pg_isready -U godcomplex -d godcomplex > /dev/null 2>&1; then
    test_result "PostgreSQL accepting connections" "pass"
else
    test_result "PostgreSQL accepting connections" "fail"
fi

# -----------------------------------------------------------------------------
# Test 3: Environment Variables
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 3: Environment Variables${NC}"

# Check root .env
if [ -f ".env" ]; then
    test_result "Root .env exists" "pass"
else
    test_result "Root .env exists" "fail"
    echo -e "${YELLOW}  Hint: Copy .env.example to .env${NC}"
fi

# Check prisma .env
if [ -f "packages/prisma/.env" ]; then
    test_result "Prisma .env exists" "pass"
else
    test_result "Prisma .env exists" "fail"
    echo -e "${YELLOW}  Hint: Copy packages/prisma/.env.example to packages/prisma/.env${NC}"
fi

# Check http-server .env
if [ -f "apps/http-server/.env" ]; then
    test_result "HTTP Server .env exists" "pass"
else
    test_result "HTTP Server .env exists" "fail"
    echo -e "${YELLOW}  Hint: Copy apps/http-server/.env.example to apps/http-server/.env${NC}"
fi

# -----------------------------------------------------------------------------
# Test 4: Prisma Client
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 4: Prisma Client${NC}"
if [ -d "packages/prisma/generated/prisma" ]; then
    test_result "Prisma client generated" "pass"
else
    test_result "Prisma client generated" "fail"
    echo -e "${YELLOW}  Hint: Run 'pnpm --filter @god-complex/prisma exec prisma generate'${NC}"
fi

# -----------------------------------------------------------------------------
# Test 5: Database Tables (via psql)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 5: Database Tables${NC}"
TABLES=$(docker exec godcomplex-postgres psql -U godcomplex -d godcomplex -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ -n "$TABLES" ] && [ "$TABLES" -gt "0" ]; then
    test_result "Database has tables ($TABLES found)" "pass"
else
    test_result "Database has tables" "fail"
    echo -e "${YELLOW}  Hint: Run 'pnpm db:migrate' to apply migrations${NC}"
fi

# -----------------------------------------------------------------------------
# Test 6: Check for User table
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}▶ Test 6: User Table Exists${NC}"
USER_TABLE=$(docker exec godcomplex-postgres psql -U godcomplex -d godcomplex -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user');" 2>/dev/null | tr -d ' ')

if [ "$USER_TABLE" = "t" ]; then
    test_result "User table exists" "pass"
else
    test_result "User table exists" "fail"
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

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 DATABASE SETUP COMPLETE!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ DATABASE SETUP INCOMPLETE${NC}"
    echo -e "\nTo complete setup:"
    echo "  1. Start database: pnpm db:start"
    echo "  2. Copy env files: pnpm setup"
    echo "  3. Run migrations: pnpm db:migrate"
    exit 1
fi
