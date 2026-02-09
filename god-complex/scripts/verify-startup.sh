#!/bin/bash

# God Complex - Startup Verification Script
# Verifies all services are running and ready for development

set -e

echo "🔍 God Complex Startup Verification"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Check PostgreSQL
echo "1️⃣  Checking PostgreSQL..."
if docker ps | grep -q "godcomplex-postgres"; then
    echo -e "   ${GREEN}✓ PostgreSQL container is running${NC}"
    
    # Check database connectivity
    if docker exec godcomplex-postgres pg_isready -U godcomplex -d godcomplex &>/dev/null; then
        echo -e "   ${GREEN}✓ Database is accepting connections${NC}"
    else
        echo -e "   ${RED}✗ Database is not accepting connections${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}✗ PostgreSQL container is not running${NC}"
    echo -e "   ${YELLOW}→ Run: docker-compose up -d postgres${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Check Backend Server
echo "2️⃣  Checking Backend Server (port 4000)..."
if lsof -i :4000 &>/dev/null; then
    echo -e "   ${GREEN}✓ Backend server is listening on port 4000${NC}"
    
    # Check health endpoint
    HEALTH_RESPONSE=$(curl -s http://localhost:4000/api/health 2>/dev/null || echo "FAILED")
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        echo -e "   ${GREEN}✓ Health endpoint responding${NC}"
        
        # Check database connectivity from health endpoint
        if echo "$HEALTH_RESPONSE" | grep -q '"connected":true'; then
            echo -e "   ${GREEN}✓ Backend connected to database${NC}"
        else
            echo -e "   ${RED}✗ Backend cannot connect to database${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "   ${RED}✗ Health endpoint not responding${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}✗ Backend server is not running${NC}"
    echo -e "   ${YELLOW}→ Run: cd apps/http-server && pnpm dev${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Check Frontend Server
echo "3️⃣  Checking Frontend Server (port 3000)..."
if lsof -i :3000 &>/dev/null; then
    echo -e "   ${GREEN}✓ Frontend server is listening on port 3000${NC}"
else
    echo -e "   ${YELLOW}⚠ Frontend server is not running (optional for API testing)${NC}"
    echo -e "   ${YELLOW}→ Run: cd apps/web && pnpm dev${NC}"
fi
echo ""

# 4. Check Auth Endpoint
echo "4️⃣  Checking Auth System..."
AUTH_RESPONSE=$(curl -s http://localhost:4000/api/auth/get-session 2>/dev/null || echo "FAILED")
if [ "$AUTH_RESPONSE" != "FAILED" ]; then
    echo -e "   ${GREEN}✓ Auth endpoint is responding${NC}"
else
    echo -e "   ${RED}✗ Auth endpoint not responding${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Check Environment Files
echo "5️⃣  Checking Environment Configuration..."

if [ -f "apps/http-server/.env" ]; then
    echo -e "   ${GREEN}✓ Backend .env exists${NC}"
    
    if grep -q "DATABASE_URL" apps/http-server/.env; then
        echo -e "   ${GREEN}✓ DATABASE_URL configured${NC}"
    else
        echo -e "   ${RED}✗ DATABASE_URL missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "BETTER_AUTH_SECRET" apps/http-server/.env; then
        echo -e "   ${GREEN}✓ BETTER_AUTH_SECRET configured${NC}"
    else
        echo -e "   ${RED}✗ BETTER_AUTH_SECRET missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}✗ Backend .env not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "apps/web/.env.local" ]; then
    echo -e "   ${GREEN}✓ Frontend .env.local exists${NC}"
else
    echo -e "   ${YELLOW}⚠ Frontend .env.local not found (using defaults)${NC}"
fi
echo ""

# 6. Check Prisma Migrations
echo "6️⃣  Checking Database Migrations..."
cd packages/prisma 2>/dev/null || cd ../packages/prisma 2>/dev/null || true
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || echo "FAILED")
if echo "$MIGRATION_STATUS" | grep -q "applied"; then
    echo -e "   ${GREEN}✓ Migrations are up to date${NC}"
elif echo "$MIGRATION_STATUS" | grep -q "FAILED"; then
    echo -e "   ${YELLOW}⚠ Could not check migration status${NC}"
else
    echo -e "   ${YELLOW}⚠ Some migrations may be pending${NC}"
    echo -e "   ${YELLOW}→ Run: cd packages/prisma && npx prisma migrate deploy${NC}"
fi
cd - > /dev/null 2>&1 || true
echo ""

# Summary
echo "===================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! System is ready for development.${NC}"
    echo ""
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:4000"
    echo "API Docs: http://localhost:4000/api/health"
else
    echo -e "${RED}❌ $ERRORS error(s) found. Please fix the issues above.${NC}"
    exit 1
fi
