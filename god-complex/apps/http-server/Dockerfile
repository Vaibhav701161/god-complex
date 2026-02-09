# Use Node 18 Alpine for smaller image
FROM node:18-alpine AS base

# Install dependencies for Prisma (required for alpine)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ============================================================================
# Dependencies stage - install all workspace dependencies
# ============================================================================
FROM base AS deps

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for dependency resolution
COPY packages/prisma/package.json ./packages/prisma/package.json
COPY apps/http-server/package.json ./apps/http-server/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ============================================================================
# Builder stage - build the application
# ============================================================================
FROM base AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/prisma/node_modules ./packages/prisma/node_modules
COPY --from=deps /app/apps/http-server/node_modules ./apps/http-server/node_modules

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy prisma package (schema, migrations, config)
COPY packages/prisma ./packages/prisma

# Generate Prisma Client
RUN cd packages/prisma && pnpm exec prisma generate

# Copy backend source code
COPY apps/http-server ./apps/http-server

# Build the backend
RUN pnpm --filter http-server build

# ============================================================================
# Runner stage - production runtime
# ============================================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy compiled backend
COPY --from=builder /app/apps/http-server/build ./apps/http-server/build
COPY --from=builder /app/apps/http-server/package.json ./apps/http-server/package.json

# Copy Prisma generated client and schema
COPY --from=builder /app/packages/prisma/generated ./packages/prisma/generated
COPY --from=builder /app/packages/prisma/prisma ./packages/prisma/prisma
COPY --from=builder /app/packages/prisma/package.json ./packages/prisma/package.json
COPY --from=builder /app/packages/prisma/src ./packages/prisma/src

# Copy node_modules (production only)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/prisma/node_modules ./packages/prisma/node_modules
COPY --from=deps /app/apps/http-server/node_modules ./apps/http-server/node_modules

# Railway uses PORT environment variable
EXPOSE 8080

# Start the server
CMD ["pnpm", "--filter", "http-server", "start"]
