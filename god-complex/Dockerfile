# ---------- Base ----------
FROM node:18-alpine AS base
WORKDIR /repo

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ---------- Dependencies ----------
FROM base AS deps

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace dependency resolution
COPY apps/http-server/package.json apps/http-server/package.json
COPY packages/prisma/package.json packages/prisma/package.json

# Install dependencies for http-server and its workspace deps
RUN pnpm install --filter http-server...

# ---------- Build ----------
FROM base AS build

# Copy installed node_modules from deps stage
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/http-server/node_modules ./apps/http-server/node_modules
COPY --from=deps /repo/packages/prisma/node_modules ./packages/prisma/node_modules

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy Prisma package (needed for generate & runtime)
COPY packages/prisma ./packages/prisma

# Generate Prisma Client
RUN cd packages/prisma && pnpm exec prisma generate

# Copy backend source code
COPY apps/http-server ./apps/http-server

# Build backend (compiles TypeScript)
RUN cd apps/http-server && pnpm run build

# ---------- Runtime ----------
FROM node:18-alpine AS runtime
WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy built backend
COPY --from=build /repo/apps/http-server/build ./build
COPY --from=build /repo/apps/http-server/package.json ./package.json

# Copy node_modules (includes Prisma)
COPY --from=build /repo/apps/http-server/node_modules ./node_modules

# Copy Prisma generated client
COPY --from=build /repo/packages/prisma/generated ./node_modules/.prisma
COPY --from=build /repo/packages/prisma/src ./node_modules/@god-complex/prisma/src

# Railway provides PORT env variable
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["pnpm", "start"]
