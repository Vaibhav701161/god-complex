#!/bin/bash

# =============================================================================
# SETUP VALIDATION SCRIPT
# Validates that the development environment is correctly configured
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           GOD COMPLEX - SETUP VALIDATION                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

ERRORS=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# =============================================================================
# Prerequisites
# =============================================================================
echo -e "${BLUE}▶ Checking Prerequisites${NC}\n"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed ($NODE_VERSION)"
else
    check_fail "Node.js not installed"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    check_pass "pnpm installed ($PNPM_VERSION)"
else
    check_fail "pnpm not installed"
fi

# Check Docker
if command -v docker &> /dev/null; then
    check_pass "Docker installed"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        check_pass "Docker daemon running"
    else
        check_fail "Docker daemon not running"
    fi
else
    check_fail "Docker not installed"
fi

# =============================================================================
# Environment Files
# =============================================================================
echo -e "\n${BLUE}▶ Checking Environment Files${NC}\n"

# Root .env
if [ -f ".env" ]; then
    check_pass "Root .env exists"
    
    # Check for placeholder values
    if grep -q 'change-me\|your-secret' ".env" 2>/dev/null; then
        check_warn "Root .env has placeholder values"
    fi
else
    check_fail "Root .env missing (run: pnpm setup)"
fi

# Prisma .env
if [ -f "packages/prisma/.env" ]; then
    check_pass "packages/prisma/.env exists"
else
    check_fail "packages/prisma/.env missing"
fi

# HTTP Server .env
if [ -f "apps/http-server/.env" ]; then
    check_pass "apps/http-server/.env exists"
else
    check_fail "apps/http-server/.env missing"
fi

# Web .env.local
if [ -f "apps/web/.env.local" ]; then
    check_pass "apps/web/.env.local exists"
else
    check_warn "apps/web/.env.local missing (optional)"
fi

# =============================================================================
# Database
# =============================================================================
echo -e "\n${BLUE}▶ Checking Database${NC}\n"

# Check PostgreSQL container
if docker ps 2>/dev/null | grep -q "godcomplex-postgres"; then
    check_pass "PostgreSQL container running"
    
    # Check database connection
    if docker exec godcomplex-postgres pg_isready -U godcomplex -d godcomplex &> /dev/null; then
        check_pass "PostgreSQL accepting connections"
        
        # Check for tables
        TABLE_COUNT=$(docker exec godcomplex-postgres psql -U godcomplex -d godcomplex -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
        
        if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt "0" ]; then
            check_pass "Database has $TABLE_COUNT tables"
        else
            check_warn "No tables found (run: pnpm db:migrate)"
        fi
    else
        check_fail "PostgreSQL not accepting connections"
    fi
else
    check_warn "PostgreSQL container not running (run: pnpm db:start)"
fi

# =============================================================================
# Prisma
# =============================================================================
echo -e "\n${BLUE}▶ Checking Prisma${NC}\n"

# Check generated client
if [ -d "packages/prisma/generated/prisma" ]; then
    check_pass "Prisma client generated"
else
    check_warn "Prisma client not generated (run: pnpm --filter @god-complex/prisma exec prisma generate)"
fi

# Check schema exists
if [ -f "packages/prisma/prisma/schema.prisma" ]; then
    check_pass "Prisma schema exists"
else
    check_fail "Prisma schema missing"
fi

# =============================================================================
# Dependencies
# =============================================================================
echo -e "\n${BLUE}▶ Checking Dependencies${NC}\n"

# Check node_modules
if [ -d "node_modules" ]; then
    check_pass "Root node_modules installed"
else
    check_fail "Dependencies not installed (run: pnpm install)"
fi

# Check turbo
if [ -f "node_modules/.bin/turbo" ]; then
    check_pass "Turbo installed"
else
    check_fail "Turbo not installed"
fi

# =============================================================================
# Backend Server
# =============================================================================
echo -e "\n${BLUE}▶ Checking Backend Server${NC}\n"

# Check if server is running
if curl -s http://localhost:4000/api/health &> /dev/null; then
    check_pass "Backend server running on :4000"
    
    # Check health response
    HEALTH=$(curl -s http://localhost:4000/api/health)
    if echo "$HEALTH" | grep -q "ok\|healthy" 2>/dev/null; then
        check_pass "Health endpoint responding correctly"
    else
        check_warn "Health endpoint returned unexpected response"
    fi
else
    check_warn "Backend server not running on :4000 (run: pnpm dev)"
fi

# =============================================================================
# Frontend
# =============================================================================
echo -e "\n${BLUE}▶ Checking Frontend${NC}\n"

# Check if frontend is running
if curl -s http://localhost:3000 &> /dev/null; then
    check_pass "Frontend running on :3000"
else
    check_warn "Frontend not running on :3000 (run: pnpm dev)"
fi

# =============================================================================
# Auth Configuration
# =============================================================================
echo -e "\n${BLUE}▶ Checking Auth Configuration${NC}\n"

# Check BETTER_AUTH_SECRET
if [ -f "apps/http-server/.env" ]; then
    if grep -q 'BETTER_AUTH_SECRET="..*"' "apps/http-server/.env"; then
        SECRET_LENGTH=$(grep 'BETTER_AUTH_SECRET=' "apps/http-server/.env" | cut -d'"' -f2 | wc -c)
        if [ "$SECRET_LENGTH" -gt 32 ]; then
            check_pass "BETTER_AUTH_SECRET configured"
        else
            check_warn "BETTER_AUTH_SECRET may be too short"
        fi
    else
        check_fail "BETTER_AUTH_SECRET not set"
    fi
fi

# Check Google OAuth (optional)
if [ -f "apps/http-server/.env" ]; then
    if grep -q 'GOOGLE_CLIENT_ID=".\+apps.googleusercontent.com"' "apps/http-server/.env" 2>/dev/null; then
        check_pass "Google OAuth configured"
    else
        check_warn "Google OAuth not configured (optional)"
    fi
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    VALIDATION SUMMARY                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo -e "Your development environment is ready."
    echo -e "Run ${BLUE}pnpm dev${NC} to start development."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warnings found${NC}"
    echo ""
    echo -e "Setup is mostly complete. Address warnings if needed."
    exit 0
else
    echo -e "${RED}❌ $ERRORS errors, $WARNINGS warnings${NC}"
    echo ""
    echo -e "Please fix the errors above before continuing."
    echo ""
    echo -e "Quick fixes:"
    echo -e "  - Run ${BLUE}pnpm setup${NC} to create .env files"
    echo -e "  - Run ${BLUE}pnpm install${NC} to install dependencies"
    echo -e "  - Run ${BLUE}pnpm db:start${NC} to start database"
    echo -e "  - Run ${BLUE}pnpm db:migrate${NC} to create tables"
    exit 1
fi
