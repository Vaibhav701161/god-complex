#!/bin/bash

# =============================================================================
# ENVIRONMENT SETUP SCRIPT
# Copies .env.example files and configures environment
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           GOD COMPLEX - ENVIRONMENT SETUP                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

# Function to copy env file if it doesn't exist
copy_env() {
    local source=$1
    local target=$2
    local name=$3
    
    if [ -f "$target" ]; then
        echo -e "${YELLOW}⚠ $name already exists, skipping${NC}"
    else
        if [ -f "$source" ]; then
            cp "$source" "$target"
            echo -e "${GREEN}✓ Created $name${NC}"
        else
            echo -e "${YELLOW}⚠ $source not found, skipping${NC}"
        fi
    fi
}

echo -e "${BLUE}Setting up environment files...${NC}\n"

# Copy root .env
copy_env ".env.example" ".env" "Root .env"

# Copy packages/prisma/.env
copy_env "packages/prisma/.env.example" "packages/prisma/.env" "packages/prisma/.env"

# Copy apps/http-server/.env
copy_env "apps/http-server/.env.example" "apps/http-server/.env" "apps/http-server/.env"

# Copy apps/web/.env.local
copy_env "apps/web/.env.local.example" "apps/web/.env.local" "apps/web/.env.local"

echo ""

# Generate BETTER_AUTH_SECRET if not set
if [ -f ".env" ]; then
    if grep -q 'BETTER_AUTH_SECRET="change-me' ".env" || grep -q 'BETTER_AUTH_SECRET="your-' ".env"; then
        echo -e "${BLUE}Generating BETTER_AUTH_SECRET...${NC}"
        
        # Generate a secure secret
        SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)
        
        # Update the secret in .env files
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/BETTER_AUTH_SECRET=\"[^\"]*\"/BETTER_AUTH_SECRET=\"$SECRET\"/" .env
            [ -f "apps/http-server/.env" ] && sed -i '' "s/BETTER_AUTH_SECRET=\"[^\"]*\"/BETTER_AUTH_SECRET=\"$SECRET\"/" apps/http-server/.env
        else
            # Linux
            sed -i "s/BETTER_AUTH_SECRET=\"[^\"]*\"/BETTER_AUTH_SECRET=\"$SECRET\"/" .env
            [ -f "apps/http-server/.env" ] && sed -i "s/BETTER_AUTH_SECRET=\"[^\"]*\"/BETTER_AUTH_SECRET=\"$SECRET\"/" apps/http-server/.env
        fi
        
        echo -e "${GREEN}✓ Generated secure BETTER_AUTH_SECRET${NC}"
    else
        echo -e "${YELLOW}⚠ BETTER_AUTH_SECRET already configured${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 SETUP COMPLETE!                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. ${BLUE}pnpm db:start${NC}     - Start PostgreSQL database"
echo -e "  2. ${BLUE}pnpm db:migrate${NC}   - Run database migrations"
echo -e "  3. ${BLUE}pnpm dev${NC}          - Start development servers"
echo ""
echo -e "Optional:"
echo -e "  - Configure Google OAuth in .env files"
echo -e "  - Run ${BLUE}pnpm db:seed${NC} to add test data"
echo ""
