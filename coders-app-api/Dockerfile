# Express API (coders-app-api) — single-stage image.
# node:lts-alpine3.19 is a small Alpine-based Node LTS image.
FROM node:lts-alpine3.19

# App code lives in /app inside the container.
WORKDIR /app

# Install dependencies first (copied separately so this layer is cached and only
# re-runs when package.json / package-lock.json change).
COPY package*.json ./
# --legacy-peer-deps: express-graphql pins graphql@^15 but the project uses
# graphql@16 (works fine at runtime); without this flag npm aborts on the peer
# conflict. Full install keeps devDeps like cross-env, which `npm start` uses.
RUN npm install --legacy-peer-deps

# Copy the rest of the source (node_modules, .env* etc. excluded via .dockerignore).
COPY . .

# The API listens on 4000 (overridable with the PORT env var).
EXPOSE 4000

# `npm start` = cross-env APP_ENV=prod node src/index.js. Runtime config
# (MONGODB_URI, JWT_SECRET, …) is supplied via env vars at `docker run` time.
CMD ["npm", "start"]
