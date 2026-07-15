# Production-grade Multi-stage Dockerfile for Express TypeScript Backend
# Uses `pnpm deploy` to produce a fully self-contained package directory
# so every dependency (including express) is guaranteed to be present at runtime.

# ── Stage 1: Install ALL workspace deps (dev+prod, needed to build TS) ───────
FROM node:22-alpine AS base

WORKDIR /app

# Pin the exact pnpm version from package.json — avoids drift between stages
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

# Copy only the manifests pnpm needs to resolve the workspace graph.
# Backend's only internal dependency is @hive/types.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json      ./apps/backend/package.json
COPY packages/types/package.json    ./packages/types/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build @hive/types then backend ───────────────────────────────────
FROM base AS builder

WORKDIR /app

# Source for the shared types package
COPY packages/tsconfig ./packages/tsconfig
COPY packages/types     ./packages/types
RUN pnpm --filter @hive/types build

# Source for the backend (includes drizzle/ directory)
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

# ── Stage 3: Self-contained prod deploy dir via `pnpm deploy` ────────────────
FROM base AS pruner

WORKDIR /app

# Full source so pnpm deploy can analyse the workspace
COPY packages/tsconfig ./packages/tsconfig
COPY packages/types     ./packages/types
COPY apps/backend       ./apps/backend

# Pre-built artifacts from builder (types dist is needed by pnpm deploy resolution)
COPY --from=builder /app/packages/types/dist ./packages/types/dist
# Compiled backend JS (overwrite any stale files; builder may differ from context copy)
COPY --from=builder /app/apps/backend/dist   ./apps/backend/dist

# `pnpm deploy` writes a fully self-contained dir:
#   /deploy/backend/node_modules  ← production deps only, no hoisting surprises
#   /deploy/backend/package.json
RUN pnpm --filter backend deploy --prod --legacy /deploy/backend

# Copy compiled dist into the deploy dir
# (pnpm deploy intentionally skips files in .gitignore / not in "files")
RUN cp -r apps/backend/dist /deploy/backend/dist

# Copy Drizzle migrations if the directory exists
RUN if [ -d apps/backend/drizzle ]; then \
      cp -r apps/backend/drizzle /deploy/backend/drizzle; \
    fi

# ── Stage 4: Lean production image ───────────────────────────────────────────
FROM node:22-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001

WORKDIR /app

ENV NODE_ENV=production

# Everything needed at runtime lives in the single deploy dir
COPY --from=pruner --chown=nodejs:nodejs /deploy/backend .

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# index.js: loads dotenv/config → starts the Express server
CMD ["node", "dist/index.js"]
