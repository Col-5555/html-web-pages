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

See [`reference/walkthroughs/managers-app-api-walkthrough.md`](../reference/walkthroughs/managers-app-api-walkthrough.md)
for a build walkthrough.
