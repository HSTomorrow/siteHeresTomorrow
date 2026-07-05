# Multi-stage build for HeresTomorrow

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build


# Runtime stage
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install pnpm for running node_modules
RUN npm install -g pnpm

# Copy package files for runtime reference
COPY package.json pnpm-lock.yaml .npmrc ./

# Copy prebuilt node_modules and application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('net').createConnection({port:8080}).on('error',process.exit(1)).on('connect',process.exit(0))" || exit 1

EXPOSE 8080

# Start server
CMD ["node", "dist/server/node-build.mjs"]
