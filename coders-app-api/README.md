# Coders App — Express.js API

The backend REST API for the Coders platform, built with **Express 5** and
**Joi**, using a **route → controller → service** architecture, with a
**MongoDB (Atlas) + Mongoose** persistence layer.

## Getting started

```bash
cd coders-app-api
npm install
cp .env.dev.example .env.dev    # fill in MONGODB_URI + MONGODB_DB (from your Atlas cluster)
npm run dev                     # connects to MongoDB, seeds dummy data on first run, then listens on :4000
# or: npm start
```

### Environments (test / dev / prod)

The API runs in one of three environments, each with its own `.env.<env>` file
(all gitignored). `config/env.js` loads the right one at startup based on the
`APP_ENV` variable, which [`cross-env`](https://www.npmjs.com/package/cross-env)
sets in the npm scripts:

| Script | `APP_ENV` | File loaded | Database (`MONGODB_DB`) |
| --- | --- | --- | --- |
| `npm run dev` | `dev` | `.env.dev` | `ImpDatabaseDesign` |
| `npm test` | `test` | `.env.test` | `ImpDatabaseDesign_test` (isolated) |
| `npm start` | `prod` | `.env.prod` | your production DB |

Test and dev use the **same Atlas cluster but different databases**, so the test
suite can seed and wipe data without touching development data. Copy each
`.env.<env>.example` to `.env.<env>` and fill in the values; see
[`.env.example`](.env.example) for what each variable means.

Each `.env.<env>` supplies:

| Var | Purpose |
| --- | --- |
| `PORT` | API port (default `4000`; override e.g. `PORT=5000 npm start`) |
| `MONGODB_URI` | Atlas `mongodb+srv://…` connection string |
| `MONGODB_DB` | database name for this environment |
| `JWT_SECRET` | secret used to sign/verify auth tokens |
| `APP_URL` | public base URL the email-verification link is built from |

The Atlas cluster's **Network Access** allowlist must include your IP.

## Project structure

```
src/
  index.js            server entry: load env, connect DB + seed, then listen
  app.js              express app: json parser, /api routes, 404 + error handler
  config/env.js       envLoader — picks .env.<APP_ENV> at startup (imported first)
  config/db.js        Mongoose connection (connectDB)
  graphql/            GraphQL schema (SDL) + resolvers over the service layer
  models/             Mongoose models — User (Coder/Manager discriminators),
                        Challenge (embeds code + tests), Submission
  seed/               idempotent dummy-data seeding on startup
  routes/             URL → controller wiring (+ validator middleware)
  controllers/        read request → call service → shape response
  services/           business logic + Mongoose persistence
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

## GraphQL

Alongside REST, the API exposes a **GraphQL** read layer at **`/graphql`** (built
with `graphql` + `express-graphql`) that mirrors the challenge-reading endpoints,
so a client fetches exactly the fields it needs. Open **GraphiQL** in a browser at
[http://localhost:4000/graphql](http://localhost:4000/graphql).

Queries (all authenticated — send `Authorization: Bearer <token>`, or pass the
optional `token` argument when testing in GraphiQL):

| Query | REST equivalent | Returns |
| --- | --- | --- |
| `categories` | `GET /api/categories` | `[String!]!` |
| `challenges(category)` | `GET /api/challenges?category` | challenges with `solution_rate` + coder `status` |
| `challenge(id)` | `GET /api/challenges/:id` | one challenge (full workspace payload) |

Resolvers reuse the existing service layer (`src/services/challenge.service.js`),
so GraphQL and REST share the same role-aware logic. Schema + resolvers live in
`src/graphql/`. Test values (`Mixed`) are JSON-stringified into `String` fields.
See the walkthrough for details.

## Testing

API tests use **Jest** + **Supertest** and run against the isolated **test**
database (`.env.test`, `MONGODB_DB=ImpDatabaseDesign_test`):

```bash
cp .env.test.example .env.test   # point at a dedicated test database
npm test
```

The suite (`test/challenges.test.js`) seeds a coder, a manager, two challenges and
two submissions (one passing, one failing), then covers the auth + challenges
endpoints:

- unauthorized without a token / with an invalid token → `401`
- login with correct credentials → `200` + a token
- listing challenges after login → the coder's per-challenge status
  (one `Completed`, one `Attempted`)

Seeded data is removed and the Mongoose connection closed after the run
(`afterAll`), so the test database is left clean. Jest runs in native-ESM mode
(`NODE_OPTIONS=--experimental-vm-modules`, wired into the `test` script).

## Walkthroughs

Teaching walkthroughs live in [`reference/walkthroughs/`](../reference/walkthroughs/):
the API build ([`coders-api-walkthrough.md`](../reference/walkthroughs/coders-api-walkthrough.md)),
the environment system + tests
([`unit-testing-walkthrough.md`](../reference/walkthroughs/unit-testing-walkthrough.md)),
and the GraphQL layer
([`graphql-walkthrough.md`](../reference/walkthroughs/graphql-walkthrough.md)).
