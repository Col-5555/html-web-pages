# Backend Deployment — walkthrough

The final challenge: containerize both backend services with **Docker** and run
them alongside a **MongoDB** container.

- **`coders-app-api`** (Express) → a **single-stage** image.
- **`managers-app-api`** (NestJS) → a **multi-stage** image (build TS in one stage,
  ship only the compiled output in the next → much smaller).

One `docker-compose.yml` at the repo root wires up Mongo + both APIs so the whole
stack comes up with a single command.

---

## 1. The Express image (single-stage)

`coders-app-api/Dockerfile`:

```dockerfile
FROM node:lts-alpine3.19
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

- `node:lts-alpine3.19` is a small Alpine-based Node LTS image.
- **`package*.json` is copied first**, before the rest of the source, so the
  (slow) `npm install` layer is cached and only re-runs when dependencies change.
- **`--legacy-peer-deps` is required here.** `express-graphql` declares a peer of
  `graphql@^15`, but the project uses `graphql@16`; a plain `npm install` aborts on
  that conflict. (It works fine at runtime — we proved that with the GraphQL
  endpoint.)
- `CMD ["npm", "start"]` runs `cross-env APP_ENV=prod node src/index.js`. There's no
  `.env.prod` inside the image, so the env loader no-ops and the app reads the
  config passed in at run time (`MONGODB_URI`, `JWT_SECRET`, …). **Secrets are never
  baked into the image** — a `.dockerignore` keeps `.env*` out.

## 2. The NestJS image (multi-stage)

`managers-app-api/Dockerfile`:

```dockerfile
# development stage — install everything and compile TypeScript → dist/
FROM node:lts-alpine3.19 AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build          # nest build → dist/

# production stage — prod deps + compiled dist only
FROM node:lts-alpine3.19 AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
COPY --from=development /app/dist ./dist
EXPOSE 4100
CMD ["node", "dist/main"]
```

Why two stages? The **build** needs the whole toolchain — the Nest CLI, TypeScript,
type packages — none of which are needed to *run* the compiled JS. The production
stage starts fresh, installs only `dependencies` (`--only=production`), and copies
just the compiled `dist/` from the development stage with
`COPY --from=development`. The dev-only tooling never reaches the final image.

**The payoff** (from `docker images`):

| Image | Size |
| --- | --- |
| `codecla-nestjs:v1` (multi-stage) | **208 MB** |
| `codecla-express:v1` (single-stage) | 236 MB |

The brief notes a traditional single-stage Nest build would be ~1.5 GB — the
multi-stage result is a fraction of that.

## 3. Orchestration — `docker-compose.yml`

```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]
  coders-api:
    build: ./coders-app-api
    image: codecla-express:v1
    ports: ["4000:4000"]
    environment:
      MONGODB_URI: mongodb://mongo:27017
      MONGODB_DB: codecla
      JWT_SECRET: docker-demo-shared-secret-change-me
      APP_URL: http://localhost:4000
    depends_on: [mongo]
  managers-api:
    build: ./managers-app-api
    image: codecla-nestjs:v1
    ports: ["4100:4100"]
    environment:
      PORT: 4100
      MONGODB_URI: mongodb://mongo:27017
      MONGODB_DB: codecla
      JWT_SECRET: docker-demo-shared-secret-change-me   # SAME secret as Express
    depends_on: [mongo]
volumes:
  mongo-data:
```

Key points:

- **The apps reach Mongo by service name** (`mongodb://mongo:27017`) — Compose puts
  them on one network with DNS, so no `--network host` needed.
- **The two APIs run on different ports** (4000 / 4100), as the brief requires.
- **Both share one database (`codecla`) and one `JWT_SECRET`.** The Express app
  seeds the database on first boot (`src/seed/`), so there's data immediately, and a
  token minted by the Express auth endpoints is accepted by the NestJS service.

```bash
docker compose up --build -d      # build images + start the stack
docker compose down -v            # stop everything + drop the db volume
```

## Doing it manually (the brief's step-by-step)

Compose is a convenience; the same thing by hand:

```bash
# 1. Build the images with the brief's tags
docker build -t codecla-express:v1 ./coders-app-api
docker build -t codecla-nestjs:v1  ./managers-app-api

# 2. A network + a MongoDB container
docker network create codecla-net
docker run -d --name mongo --network codecla-net -p 27017:27017 mongo:7

# 3. Run each API — publish its port, pass env vars
docker run -d --name coders-api --network codecla-net -p 4000:4000 \
  -e MONGODB_URI=mongodb://mongo:27017 -e MONGODB_DB=codecla \
  -e JWT_SECRET=demo-secret -e APP_URL=http://localhost:4000 codecla-express:v1

docker run -d --name managers-api --network codecla-net -p 4100:4100 \
  -e MONGODB_URI=mongodb://mongo:27017 -e MONGODB_DB=codecla \
  -e JWT_SECRET=demo-secret -e PORT=4100 codecla-nestjs:v1
```

**Networking fallback (the brief's note):** if a container can't reach Mongo on the
bridge network, run with `--network host` and point at
`MONGODB_URI=mongodb://localhost:27017` (host networking is Linux-only).

## What was verified (real build + run)

- Both images **build** (`codecla-express:v1`, `codecla-nestjs:v1`) and all three
  containers come up on distinct ports.
- Express (`:4000`): `/health` ok; the DB **seeds** on boot; coder login → token →
  `GET /api/challenges` returns the 4 seeded challenges (Two-sum `Completed`, 50 %
  solution rate); `GET /graphql` serves GraphiQL.
- NestJS (`:4100`): a **manager token minted by the Express service** (shared
  `JWT_SECRET`) is accepted → `GET /challenges` returns the manager's 4 challenges
  from the shared DB; no token → **401**. This confirms cross-service auth and a
  shared database.
- The standalone `docker run --network host` path was exercised too (the manual
  fallback), and `docker images` confirms the small multi-stage Nest image.
