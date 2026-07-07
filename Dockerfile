# Multi-stage build for HeresTomorrow

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with NODE_ENV=production for build time
ENV NODE_ENV=production
RUN pnpm run build


# Runtime stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy prebuilt node_modules and application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/spa ./dist/spa
COPY --from=builder /app/dist/server ./dist/server
COPY --from=builder /app/public ./public

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('net').createConnection({port:8080}).on('error',process.exit(1)).on('connect',process.exit(0))" || exit 1

EXPOSE 8080

# Start server
CMD ["node", "dist/server/node-build.mjs"]
