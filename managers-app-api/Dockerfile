# NestJS API (managers-app-api) — multi-stage build. The dev stage compiles the
# TypeScript to dist/; the prod stage ships only prod deps + the compiled output,
# so the final image is a fraction of the size of a single-stage build.

# ── development stage: install everything and build ───────────────────────────
FROM node:lts-alpine3.19 AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── production stage: prod deps + compiled dist only ──────────────────────────
FROM node:lts-alpine3.19 AS production
WORKDIR /app
COPY package*.json ./
# Production dependencies only (no Nest CLI / TypeScript / test tooling).
RUN npm install --only=production
COPY . .
# Bring in the compiled output from the development stage.
COPY --from=development /app/dist ./dist

# The Nest app listens on 4100 (overridable with the PORT env var).
EXPOSE 4100

# Run the compiled entrypoint (start:prod = node dist/main). Runtime config
# (MONGODB_URI, JWT_SECRET, PORT) is supplied via env vars at `docker run` time.
CMD ["node", "dist/main"]
