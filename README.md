# CodeCLA — Coders & Managers

This repository holds the two front-end applications built during the CLA
bootcamp, as a small monorepo:

| App | Folder | Stack | What it is |
| --- | --- | --- | --- |
| **Coders** | [`coders-app/`](./coders-app) | Vite + React + Redux + Tailwind | The coder-facing platform: auth, challenges, workspace, leaderboard, profile. |
| **Managers** | [`managers-app/`](./managers-app) | Next.js + Redux + shadcn/ui | The admin dashboard for creating, editing, and deleting challenges. Integrated with the real backends — auth via the Express API, challenges via the NestJS API (json-server retired). |
| **Coders API** | [`coders-app-api/`](./coders-app-api) | Express 5 + Joi + Mongoose/MongoDB | The backend REST API (route/controller/service architecture). Fully DB-backed: Mongoose models + Atlas persistence, real auth (bcrypt, JWT, email verification, `authorize(...roles)` guard), role-aware content management, submission grading via an external code runner, and leaderboard/statistics via aggregation pipelines. |
| **Managers API** | [`managers-app-api/`](./managers-app-api) | NestJS + Mongoose/MongoDB | The managers' backend (NestJS, TypeScript) for challenge CRUD. Separate service from the Coders API but shares the same Atlas database and JWT secret; guarded so only authenticated managers can manage their own challenges. |

Each app has its own `package.json` and dependencies — `cd` into the folder you
want and run its scripts there.

```bash
# Coders app (Vite dev server)
cd coders-app && npm install && npm run dev

# Managers app (Next.js on :8457) — needs the Express API (:4000) for auth and the
# NestJS API (:4100) for challenges running (see below); json-server is retired.
cd managers-app && npm install && npm run dev

# Coders API (Express on :4000)
cd coders-app-api && npm install && npm run dev

# Managers API (NestJS on :4100)
cd managers-app-api && npm install && npm run start:dev
```

## Documentation

Assignment briefs and step-by-step walkthroughs live in
[`reference/`](./reference) (see [`reference/walkthroughs/`](./reference/walkthroughs)).

## Milestones

Each assignment submission is an annotated git tag — `git tag -n` lists them.
The Coders app pages: `intro-and-authentication`, `challenges-page`,
`workspace-page`, `leaderboard-page`, `profile-page`. The Managers app then
builds in phases: `managers-auth` (signin/signup), `managers-dashboard` (the
challenges table + delete), and `managers-challenge-form` (the two-pane
create/edit form). The Coders API follows in three phases: `coders-api-auth` (auth + profile),
`coders-api-content` (challenges + grading), and `coders-api-stats` (leaderboard
+ system statistics). `database-design` adds the ER model for the platform (see
[`reference/database-design.md`](./reference/database-design.md)), and
`mongoose-models` implements it in the Coders API with MongoDB Atlas + Mongoose
(models, connection, and startup seeding). `authentication` then makes auth real:
bcrypt password hashing, JWT-based email verification (via nodemailer/Ethereal in
dev), login, and an `authorize(...roles)` middleware guarding endpoints. Finally,
the **Express Services** brief replaces the remaining stubbed services with real
DB-backed logic in phases: `express-services-content` (role-aware challenge
create/list with `solution_rate` + per-coder `status`, categories, and
own-profile management with coder rank), `express-services-grading` (coder-only
submission grading via an external code runner, with score updates and
already-solved protection), and `express-services-stats` (coders-only leaderboard,
top-k, solved-challenge/trending-category/heatmap analytics via MongoDB
aggregation pipelines). A second backend then begins: `managers-nest-crud` starts
the NestJS `managers-app-api` (challenge CRUD over the shared database), and
`managers-nest-auth` guards it — a `@Roles`/`AuthGuard`/`@AuthenticatedUser` stack
that verifies the manager's Express-issued JWT with the shared secret. Finally,
`managers-integration-auth` connects the Next.js `managers-app` to those real
backends: signup/signin route handlers (Axios → Express) with the token stored in
Redux + a cookie, replacing the mock auth; and `managers-integration-challenges`
points the challenge data layer + server actions at the NestJS API (Bearer token,
with a form↔API shape mapper), retiring json-server entirely.
