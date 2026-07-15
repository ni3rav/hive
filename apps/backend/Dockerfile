# Production-grade Multi-stage Dockerfile for Express TypeScript Backend

# Stage 1: Install dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY packages/types ./packages/types
RUN cd packages/types && npx tsdown

COPY apps/backend ./apps/backend
RUN cd apps/backend && npx tsc

# Stage 3: Production
FROM node:22-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY packages/types/package.json ./packages/types/package.json

COPY --from=builder /app/apps/backend/dist ./dist

COPY apps/backend/drizzle ./drizzle

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["node", "dist/server.js"]
