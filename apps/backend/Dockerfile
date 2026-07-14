# Production-grade Multi-stage Dockerfile for Express TypeScript Backend

# Stage 1: Dependencies
# Use Alpine for smaller image size
FROM node:22-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
# --omit=dev skips devDependencies for production build
RUN npm ci --only=production && \
    # Cache production dependencies
    cp -R node_modules /tmp/prod_node_modules && \
    # Install all dependencies (including dev) for build
    npm ci

# Stage 2: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* tsconfig.json ./

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Stage 3: Production
FROM node:22-alpine AS production

# Install dumb-init to handle PID 1 and signal forwarding
# RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./

# Copy production dependencies from dependencies stage
COPY --from=dependencies /tmp/prod_node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle migrations if needed
COPY drizzle ./drizzle

# Change ownership to non-root user
# RUN chown -R nodejs:nodejs /app

# Switch to non-root user
# USER nodejs

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to run the application
# This ensures proper signal handling and zombie process reaping
# ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
