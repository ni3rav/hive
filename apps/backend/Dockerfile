# Production-grade Multi-stage Dockerfile for Express TypeScript Backend
# Uses turbo prune to extract only the necessary files from the monorepo

# Stage 1: Prune
FROM node:22-alpine AS pruner

WORKDIR /app

# Install pnpm and turbo
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy the entire monorepo structure needed for pruning
COPY apps/backend ./apps/backend
COPY packages/types ./packages/types

# Prune the backend application
RUN pnpm turbo prune backend --docker

# Stage 2: Dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy pruned package files
COPY --from=pruner /app/out/pnpm-lock.yaml ./
COPY --from=pruner /app/out/pnpm-workspace.yaml ./
COPY --from=pruner /app/out/package.json ./
COPY --from=pruner /app/out/apps/backend/package.json ./apps/backend/package.json
COPY --from=pruner /app/out/packages/types/package.json ./packages/types/package.json

# Install dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Stage 3: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules

# Copy pruned source code
COPY --from=pruner /app/out ./

# Build the types package first, then the backend
RUN cd packages/types && pnpm build
RUN cd apps/backend && pnpm build

# Stage 4: Production
FROM node:22-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY --from=pruner /app/out/apps/backend/package.json ./
COPY --from=pruner /app/out/packages/types/package.json ./packages/types/package.json

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules

# Copy built application
COPY --from=builder /app/apps/backend/dist ./dist

# Copy drizzle migrations
COPY --from=pruner /app/out/apps/backend/drizzle ./drizzle

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["node", "dist/index.js"]
