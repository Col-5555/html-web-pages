# Coders App — Express.js API

The backend REST API for the Coders platform, built with **Express 5** and
**Joi**, using a **route → controller → service** architecture, with a
**MongoDB (Atlas) + Mongoose** persistence layer.

> The **endpoint service layer is still stubbed** with mock data. Mongoose models
> and the ER design are implemented (`src/models/`) and seeded on startup; wiring
> the endpoints to read/write MongoDB is the next assignment.

## Getting started

```bash
cd coders-app-api
npm install
cp .env.example .env    # fill in MONGODB_URI + MONGODB_DB (from your Atlas cluster)
npm run dev             # connects to MongoDB, seeds dummy data on first run, then listens on :4000
# or: npm start
```

`.env` (gitignored) supplies:

| Var | Purpose |
| --- | --- |
| `PORT` | API port (default `4000`; override e.g. `PORT=5000 npm start`) |
| `MONGODB_URI` | Atlas `mongodb+srv://…` connection string |
| `MONGODB_DB` | database name (`ImpDatabaseDesign`) |

If `MONGODB_URI` is unset the API still starts (endpoints serve mock data). The
Atlas cluster's **Network Access** allowlist must include your IP.

## Project structure

```
src/
  index.js            server entry: connect DB + seed, then listen
  app.js              express app: json parser, /api routes, 404 + error handler
  config/db.js        Mongoose connection (connectDB)
  models/             Mongoose models — User (Coder/Manager discriminators),
                        Challenge (embeds code + tests), Submission
  seed/               idempotent dummy-data seeding on startup
  routes/             URL → controller wiring (+ validator middleware)
  controllers/        read request → call service → shape response
  services/           STUBS returning mock data (endpoint wiring: later assignment)
  validators/         Joi schemas
  middlewares/        validate factory + central error handler
  data/               mock data (also the seed source)
  utils/              asyncHandler, httpError
```

## Endpoints

Base path: `/api`. The full API — auth + profile (Phase 1), content management +
grading (Phase 2), and leaderboard + statistics (Phase 3):

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
| GET | `/api/leaderboard` | — |
| GET | `/api/leaderboard/top` | `?k` (required positive integer) |
| GET | `/api/stats/solved-challenges` | — |
| GET | `/api/stats/trending-categories` | — |
| GET | `/api/stats/heatmap` | `?start_date`, `?end_date` (optional ISO dates) |

A teaching walkthrough lives at
[`reference/walkthroughs/coders-api-walkthrough.md`](../reference/walkthroughs/coders-api-walkthrough.md).
