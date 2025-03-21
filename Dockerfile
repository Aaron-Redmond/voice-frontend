# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Create public directory if it doesn't exist
RUN mkdir -p public

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy necessary files from builder
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml* .
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["node", "server.js"] 