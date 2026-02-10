FROM node:18-alpine

WORKDIR /repo

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace files
# Railway builds from repo root where code is under god-complex/
# Support both contexts: repo root (Railway) and god-complex/ (local)
COPY god-complex/package.json god-complex/pnpm-lock.yaml god-complex/pnpm-workspace.yaml ./
COPY god-complex/apps/http-server ./apps/http-server
COPY god-complex/packages ./packages

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
