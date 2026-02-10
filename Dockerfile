FROM node:20-alpine

WORKDIR /repo

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace files
COPY god-complex/package.json god-complex/pnpm-lock.yaml god-complex/pnpm-workspace.yaml god-complex/turbo.json ./
COPY god-complex/apps ./apps
COPY god-complex/packages ./packages

# Install all dependencies
RUN pnpm install

# Generate Prisma client BEFORE building
RUN cd packages/prisma && pnpm exec prisma generate

# Build Prisma using tsc --build --force (needed for composite TypeScript projects)
RUN cd packages/prisma && npx tsc --build --force

# Build http-server
RUN pnpm --filter http-server run build

# Set working directory to backend
WORKDIR /repo/apps/http-server

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "build/server.js"]
