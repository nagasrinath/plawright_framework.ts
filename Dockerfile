# ── Stage 1: Build TypeScript ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY mock-app/ ./mock-app/
COPY src/ ./src/

RUN npx tsc --noEmit

# ── Stage 2: Playwright runner ────────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS runner

WORKDIR /app

# Copy package files and install all deps (including devDependencies for ts-node)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY --from=builder /app/mock-app ./mock-app
COPY --from=builder /app/src ./src
COPY tsconfig.json playwright.config.ts ./
COPY tests/ ./tests/

# Install browsers
RUN npx playwright install --with-deps chromium firefox webkit

ENV CI=true
ENV BASE_URL=http://localhost:3000

CMD ["npx", "playwright", "test"]
