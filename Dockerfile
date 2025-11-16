# Multi-stage build for optimized production image with Python and yt-dlp
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install Python, pip, and yt-dlp along with other dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    py3-pip \
    ffmpeg

# Install yt-dlp globally
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Copy package files and prisma schema (needed for prisma generate during npm ci)
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install Python and yt-dlp in builder stage
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg

RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install runtime dependencies (Python, yt-dlp, ffmpeg)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg

RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
