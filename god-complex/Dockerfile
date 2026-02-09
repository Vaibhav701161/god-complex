FROM node:18-alpine

WORKDIR /repo

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/http-server ./apps/http-server
COPY packages/prisma ./packages/prisma

# Install all dependencies (keeps pnpm workspace structure intact)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/prisma && pnpm exec prisma generate

# Build Prisma package (REQUIRED for TypeScript compilation)
RUN cd packages/prisma && pnpm run build

# Build backend (now Prisma types are available)
RUN cd apps/http-server && pnpm run build

# Set working directory to backend
WORKDIR /repo/apps/http-server

ENV NODE_ENV=production
EXPOSE 8080

# Run from workspace context (keeps all dependencies accessible)
CMD ["node", "build/server.js"]

