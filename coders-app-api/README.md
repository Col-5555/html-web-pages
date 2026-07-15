# Coders App — Express.js API

The backend REST API for the Coders platform, built with **Express 5** and
**Joi**, using a **route → controller → service** architecture.

> The **service layer is stubbed** with mock data — the real persistence layer
> arrives in a later assignment. Every endpoint still returns realistic JSON so
> the routes, controllers, and validators can be exercised end-to-end.

## Getting started

```bash
cd coders-app-api
npm install
npm run dev     # Express on http://localhost:4000 (auto-reload via node --watch)
# or: npm start
```

The port defaults to `4000`; override with `PORT` (`PORT=5000 npm start`) or by
copying `.env.example` to `.env` (loaded automatically via
`--env-file-if-exists`).

## Project structure

```
src/
  index.js            server entry (listen)
  app.js              express app: json parser, /api routes, 404 + error handler
  routes/             URL → controller wiring (+ validator middleware)
  controllers/        read request → call service → shape response
  services/           STUBS returning mock data (persistence: later assignment)
  validators/         Joi schemas
  middlewares/        validate factory + central error handler
  data/               mock data
  utils/              asyncHandler, httpError
```

## Endpoints

Base path: `/api`. Built so far — auth + profile (Phase 1) and content
management + grading (Phase 2):

| Method | Path | Body / Query |
| --- | --- | --- |
| POST | `/api/auth/coders/register` | `first_name, last_name, email, password` |
| POST | `/api/auth/managers/register` | same |
| POST | `/api/auth/coders/login` | `email, password` |
| POST | `/api/auth/managers/login` | same |
| GET | `/api/coders/:id/profile` | — |
| GET | `/api/managers/:id/profile` | — |
| PATCH | `/api/coders/:id/profile` | `first_name?, last_name?, about?` |
| PATCH | `/api/managers/:id/profile` | same |
| POST | `/api/challenges` | `title, category, description, level, code, tests` |
| GET | `/api/challenges` | `?category` (optional filter) |
| GET | `/api/challenges/:id` | — |
| GET | `/api/categories` | — |
| POST | `/api/submissions` | `lang (py\|js), code, challenge_id` |

Leaderboard and statistics endpoints arrive in the final phase. A teaching
walkthrough lives at
[`reference/walkthroughs/coders-api-walkthrough.md`](../reference/walkthroughs/coders-api-walkthrough.md).
