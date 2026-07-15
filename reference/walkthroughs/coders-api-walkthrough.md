# Coders App — Express.js API — Step-by-Step Walkthrough

The Coders API is the **backend** for the Coders platform: a REST API built with
**Express** and validated with **Joi**. It's a *separate* app from the two
front-ends, living in `coders-app-api/`.

It follows a strict **route → controller → service** architecture, and it's built
in phases. This document grows with each phase.

- **Phase 1 — Auth & Profile**: project setup, the layered architecture, the Joi
  validation middleware, and the auth + profile endpoints.
- **Phase 2 — Content management**: challenges (create/list/by-id), categories,
  and the grading submission endpoint — with deeply nested Joi validation.
- **Phase 3 — Leaderboard + system statistics**: ranked leaderboard, top-`k`,
  solved-challenge stats, trending categories, and a date-filtered heatmap.

> **About the service layer:** the brief says services (which need a database)
> arrive in a later assignment. So here the services are **stubs that return
> realistic mock data** — enough to exercise every route/controller/validator
> end-to-end with `curl`.

---

## Phase 1: Setup & Authentication / Profile

### The layered architecture

Every feature flows through three layers, each in its own folder under `src/`:

```
routes/       URL + HTTP verb → a controller (plus any validator middleware)
controllers/  read the request, call a service, shape the HTTP response
services/      the actual work (STUBBED with mock data for now)
```

Supporting folders: `validators/` (Joi schemas), `middlewares/` (the validation
middleware + error handler), `data/` (mock data), `utils/` (small helpers).

Keeping these apart means a route file reads like a table of contents, and the
controller never worries about *how* data is stored — only about HTTP.

`src/app.js` wires it together; `src/index.js` starts the server:

```js
// app.js
const app = express();
app.use(express.json());
app.use("/api", apiRoutes);   // every endpoint lives under /api
app.use(notFound);            // unmatched → 404
app.use(errorHandler);        // central error → JSON
```

We use **ES modules** (`"type": "module"`) and Node's built-ins — `node --watch`
for dev reload and `--env-file-if-exists=.env` for config — so there are no
`nodemon`/`dotenv` dependencies.

### One validator, reused everywhere

Rather than repeat validation in each handler, a small **middleware factory**
runs any Joi schema against any part of the request:

```js
export const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,   // report *every* problem, not just the first
    stripUnknown: true,  // drop fields the schema doesn't declare
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }
  req.validated = { ...(req.validated || {}), [property]: value };
  next();
};
```

Two Express-5 details worth knowing:

- `req.query` is now a **read-only getter** — you can't reassign it. So instead
  of overwriting the request, we stash the cleaned, type-coerced value on
  `req.validated` and read it from there in the controller.
- Async errors are auto-forwarded to the error handler, but we still wrap
  handlers in a tiny `asyncHandler` for clarity.

Using it in a route is a one-liner:

```js
router.post("/coders/register", validate(registerSchema), asyncHandler(register("coder")));
```

### Registration vs. login — two validation styles

The brief asks for these deliberately differently, and the code honours that:

- **Registration** is validated by the **route middleware** above.
- **Login** is validated **inside the controller**:

```js
export const login = (role) => async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", errors: ... });
  const session = await authService.login({ ...value, role });
  res.status(200).json(session);
};
```

Notice the `(role) => async (req, res) => {…}` shape: the handler is a small
factory so the *same* controller serves both `/coders/...` and `/managers/...` —
the role is bound when the route is declared.

### Stubbed services

The service is where a real app would hash passwords and hit a database. For now
it just returns a believable shape:

```js
// services/auth.service.js — STUB
export const register = async ({ role, first_name, last_name, email }) => ({
  id: nextId++, role, first_name, last_name, email,
  created_at: new Date().toISOString(),   // note: never returns the password
});
```

The profile service reads from a mock store keyed by id and throws a
`404`-carrying error (via a `httpError(status, message)` helper) when an id is
missing — which the central error handler turns into a JSON `404`.

### The endpoints (Phase 1)

| Method | Path | Validation |
| --- | --- | --- |
| POST | `/api/auth/coders/register` | register middleware |
| POST | `/api/auth/managers/register` | register middleware |
| POST | `/api/auth/coders/login` | login (in controller) |
| POST | `/api/auth/managers/login` | login (in controller) |
| GET | `/api/coders/:id/profile` | — |
| GET | `/api/managers/:id/profile` | — |
| PATCH | `/api/coders/:id/profile` | update-profile middleware |
| PATCH | `/api/managers/:id/profile` | update-profile middleware |

## Trying it out (Phase 1)

```bash
cd coders-app-api
npm install
npm run dev        # Express on :4000 (set PORT to change)
```

It's a JSON API, so `curl` is the test:

```bash
# Register (valid) → 201 with a mock user (no password echoed)
curl -X POST localhost:4000/api/auth/coders/register -H 'Content-Type: application/json' \
  -d '{"first_name":"Ada","last_name":"Lovelace","email":"ada@x.com","password":"secret1"}'

# Register (invalid) → 400 listing *every* Joi error
curl -X POST localhost:4000/api/auth/coders/register -H 'Content-Type: application/json' \
  -d '{"first_name":"A","email":"nope","password":"123"}'

# Login → 200 with a mock token
curl -X POST localhost:4000/api/auth/coders/login -H 'Content-Type: application/json' \
  -d '{"email":"ada@x.com","password":"secret1"}'

# Profile: fetch, update, and a missing id
curl localhost:4000/api/coders/1/profile
curl -X PATCH localhost:4000/api/coders/1/profile -H 'Content-Type: application/json' \
  -d '{"about":"Updated via API"}'
curl localhost:4000/api/coders/999/profile        # → 404
```

Expect `201`/`200` on the happy paths, `400` with Joi messages on bad input, and
`404` for unknown ids or routes.

---

## Phase 2: Content Management + Grading

Phase 2 adds the challenge catalogue and the submission endpoint. The pattern is
now familiar — route → controller → service, Joi at the edge — so the new work is
mostly a richer schema and a couple more stubs.

### A deeply nested validator

Challenge creation is where Joi earns its keep. The brief's payload nests a
`code` object (function name + per-language code + typed inputs) and an array of
weighted `tests`, so the schema is composed from small named pieces:

```js
const testSchema = Joi.object({
  weight: Joi.number().min(0).max(1).required(),
  inputs: Joi.array().items(
    Joi.object({ name: Joi.string().min(1).required(), value: Joi.any().required() })
  ).required(),
  output: Joi.any().required(),   // any: could be a number, string, array…
});

export const createChallengeSchema = Joi.object({
  title: Joi.string().min(1).required(),
  category: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),           // markdown
  level: Joi.string().valid("Easy", "Moderate", "Hard").required(),
  code: Joi.object({
    function_name: Joi.string().min(1).required(),
    code_text: Joi.array().items(codeTextSchema).min(1).required(),
    inputs: Joi.array().items(inputSchema).required(),
  }).required(),
  tests: Joi.array().items(testSchema).min(1).required(),
});
```

Because the same `validate` middleware runs with `abortEarly: false`, a bad
request reports **every** problem at once, with **dotted paths** into the nested
structure:

```json
{
  "message": "Validation failed",
  "errors": [
    "\"level\" must be one of [Easy, Moderate, Hard]",
    "\"code.code_text\" must contain at least 1 items",
    "\"tests[0].weight\" must be less than or equal to 1"
  ]
}
```

### Query validation and dynamic categories

The list endpoint accepts an optional `?category` filter, validated as a *query*
(`validate(listChallengesQuerySchema, "query")`) — the coerced value is read from
`req.validated.query`. Categories aren't a hard-coded list; the service derives
them from whatever challenges exist, so a challenge in a new category makes that
category appear automatically:

```js
export const listCategories = async () =>
  [...new Set(challenges.map((c) => c.category))];
```

### The submission stub

`POST /submissions` validates `{ lang: "py"|"js", code, challenge_id }`, then
hands off to the grading service — which, until the real code-runner exists,
returns a believable, deterministic mock (every test "passes", weighted score):

```js
export const gradeSubmission = async ({ lang, code, challenge_id }) => {
  const tests = challenges.find((c) => c.id === challenge_id)?.tests ?? [];
  const results = tests.map((t, i) => ({ test: i + 1, weight: t.weight, passed: true }));
  return { challenge_id, lang, passed: results.length, total: tests.length,
           score: results.reduce((s, r) => s + r.weight, 0), results,
           message: "Grading is stubbed until the code-runner service is available." };
};
```

### The endpoints (Phase 2)

| Method | Path | Validation |
| --- | --- | --- |
| POST | `/api/challenges` | create-challenge middleware |
| GET | `/api/challenges` | `?category` (query middleware) |
| GET | `/api/challenges/:id` | — |
| GET | `/api/categories` | — |
| POST | `/api/submissions` | submission middleware |

## Trying it out (Phase 2)

```bash
# List (optionally filter by category), fetch one, list categories
curl localhost:4000/api/challenges
curl "localhost:4000/api/challenges?category=Graphs"
curl localhost:4000/api/challenges/146
curl localhost:4000/api/categories

# Create a challenge → 201 (then it shows up in the list + categories)
curl -X POST localhost:4000/api/challenges -H 'Content-Type: application/json' -d '{
  "title":"Palindrome","category":"Strings","description":"### Check palindrome","level":"Easy",
  "code":{"function_name":"isPal","code_text":[{"language":"py","text":"def isPal(s): return True"}],"inputs":[{"name":"s","type":"string"}]},
  "tests":[{"weight":1,"inputs":[{"name":"s","value":"racecar"}],"output":true}]
}'

# Submit code → 201 with a mock grade
curl -X POST localhost:4000/api/submissions -H 'Content-Type: application/json' \
  -d '{"lang":"py","code":"def twoSum(n,t): return [0,1]","challenge_id":"145"}'
```

---

## Phase 3: Leaderboard + System Statistics

The final phase adds read-only analytics endpoints. No new architecture — it's
the same layering — so the interesting parts are two more flavours of **query
validation**.

### Validating a query parameter: top-`k`

The top-k endpoint needs `k` to be a **required positive integer**. Joi coerces
the query string and enforces the bound; the route order matters too — the
literal `/leaderboard/top` is declared *before* `/leaderboard` so it matches
first:

```js
export const topKQuerySchema = Joi.object({
  k: Joi.number().integer().min(1).required(),
});

router.get("/leaderboard/top", validate(topKQuerySchema, "query"), getTop);
router.get("/leaderboard", getLeaderboard);
```

The controller reads the **coerced number** (not the raw string) from
`req.validated.query`:

```js
export const getTop = async (req, res) => {
  const { k } = req.validated.query;        // already a Number, thanks to Joi
  res.status(200).json(await getTopCoders(k));
};
```

So `?k=abc` → `400 "k must be a number"`, `?k=0` → `400 "k must be greater than
or equal to 1"`, and a missing `k` → `400 "k is required"`.

### An optional date range: the heatmap

The heatmap accepts optional `start_date` / `end_date` ISO dates. The subtlety is
the cross-field rule "end must not precede start" — which should only apply when
`start_date` is actually present. A naive `end_date: Joi.date().min(Joi.ref("start_date"))`
breaks on `?end_date=...` alone (the ref resolves to nothing). `when` fixes it:

```js
export const heatmapQuerySchema = Joi.object({
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().when("start_date", {
    is: Joi.exist(),
    then: Joi.date().iso().min(Joi.ref("start_date")),
  }),
});
```

The controller **extracts the filters and passes them to the service** (exactly
as the brief asks); the service does the inclusive range filter:

```js
export const getHeatmap = async ({ start_date, end_date } = {}) =>
  heatmap.filter((entry) => {
    const date = new Date(entry.date);
    if (start_date && date < start_date) return false;
    if (end_date && date > end_date) return false;
    return true;
  });
```

### The endpoints (Phase 3)

| Method | Path | Validation |
| --- | --- | --- |
| GET | `/api/leaderboard` | — |
| GET | `/api/leaderboard/top` | `?k` required int (query middleware) |
| GET | `/api/stats/solved-challenges` | — |
| GET | `/api/stats/trending-categories` | — |
| GET | `/api/stats/heatmap` | `?start_date`/`?end_date` (query middleware) |

## Trying it out (Phase 3)

```bash
curl localhost:4000/api/leaderboard
curl "localhost:4000/api/leaderboard/top?k=2"
curl "localhost:4000/api/leaderboard/top?k=0"          # → 400
curl localhost:4000/api/stats/solved-challenges
curl localhost:4000/api/stats/trending-categories
curl "localhost:4000/api/stats/heatmap?start_date=2026-07-05&end_date=2026-07-08"
curl "localhost:4000/api/stats/heatmap?start_date=2026-07-10&end_date=2026-07-05"  # → 400
```

## Done

That completes the Coders API brief — auth & profile, content management &
grading, and leaderboard & statistics — all following the route → controller →
service pattern with Joi validation, over a stubbed service layer that will be
wired to real persistence in a later assignment.
