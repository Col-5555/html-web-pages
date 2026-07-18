# managers-app-api

The **NestJS** backend managers use to create and manage their challenges. It's a
separate service from the Express `coders-app-api`, but shares the **same MongoDB
Atlas database** and the **same `JWT_SECRET`** — managers log in through the Express
backend and pass that token here in the `Authorization` header.

## Stack

- **NestJS** (TypeScript) — modules / controllers / services / DI
- **@nestjs/mongoose** + Mongoose — the shared `challenges` and `users` collections
- **class-validator** / **class-transformer** — DTO validation via a global `ValidationPipe`
- **@nestjs/jwt** — verifies manager tokens (auth phase)

## Running

```bash
cp .env.example .env      # set MONGODB_URI/DB and JWT_SECRET (match coders-app-api)
npm install
npm run start:dev         # watch mode on http://localhost:4100
```

## Endpoints

`/challenges` — `POST` create, `GET` list (the manager's own), `GET /:id`,
`PATCH /:id` update, `DELETE /:id`. All are guarded so only authenticated **managers**
may call them; each request is scoped to the challenges that manager authored.

## Docker

A **multi-stage** [`Dockerfile`](Dockerfile) (base `node:lts-alpine3.19`) compiles the
TypeScript in a build stage and ships only the prod deps + compiled `dist/` in the
final stage, keeping the image small (~208 MB).

```bash
docker build -t codecla-nestjs:v1 .
docker run -d -p 4100:4100 \
  -e MONGODB_URI=mongodb://mongo:27017 -e MONGODB_DB=codecla \
  -e JWT_SECRET=your-secret -e PORT=4100 codecla-nestjs:v1
```

Or bring up the whole backend with the repo-root
[`docker-compose.yml`](../docker-compose.yml): `docker compose up --build`. Use the
**same `JWT_SECRET`** as coders-app-api so its tokens are accepted here. See the
[deployment walkthrough](../reference/walkthroughs/backend-deployment-walkthrough.md).

## Walkthroughs

See [`reference/walkthroughs/managers-app-api-walkthrough.md`](../reference/walkthroughs/managers-app-api-walkthrough.md)
for the build walkthrough and
[`backend-deployment-walkthrough.md`](../reference/walkthroughs/backend-deployment-walkthrough.md)
for Docker deployment.
