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

## Done (API brief)

That completes the Coders API brief — auth & profile, content management &
grading, and leaderboard & statistics — all following the route → controller →
service pattern with Joi validation, over a stubbed service layer.

---

## Persistence: MongoDB + Mongoose

A follow-up assignment ("Implementing Database Design") wires the
[ER diagram](../database-design.md) to a real database with **MongoDB Atlas** and
**Mongoose**. Scope here is the persistence layer itself — connection, models,
and dummy data on startup; the endpoints still serve their mock data for now.

### Connecting

Config comes from the environment (`.env`, gitignored — see `.env.example`):
`MONGODB_URI` (the Atlas `mongodb+srv://…` string) and `MONGODB_DB` (the database
name). `src/config/db.js` is a thin wrapper:

```js
export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  console.log(`MongoDB connected → db "${mongoose.connection.name}"`);
}
```

`src/index.js` connects and seeds **before** listening — and only when a URI is
configured, so the app still boots without a database:

```js
if (process.env.MONGODB_URI) {
  await connectDB();
  await seedDatabase();
}
app.listen(PORT, ...);
```

### Modelling the ER diagram in Mongoose

The relational ERD maps to MongoDB idiomatically — **embed** the parts that only
exist inside a parent, **reference** the things that live on their own, and use
**discriminators** for the supertype/subtype.

**The User supertype → discriminators.** Coder and Manager share the account
fields, so they're one `users` collection with a `role` discriminator key:

```js
const User = mongoose.model("User", userSchema);           // discriminatorKey: "role"
const Coder = User.discriminator("Coder", new Schema({ description: String, score: Number }));
const Manager = User.discriminator("Manager", new Schema({}));
```

A saved coder comes back with `role: "Coder"` and its `score`; a manager with
`role: "Manager"`.

**Challenge embeds its Code and TestCases.** In the ERD, `Code`, `CodeText`,
`FunctionInputDefinition`, `TestCase` and `FunctionInputValue` are separate
entities — but they only ever exist as part of a challenge, so in MongoDB they're
**embedded subdocuments** (defined with `{ _id: false }`), not separate
collections. `value`/`expected_output` are `Schema.Types.Mixed` because a test
value can be a number, string, or array:

```js
const challengeSchema = new Schema({
  title: String, category: String, description: String,
  difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"] },
  manager: { type: ObjectId, ref: "Manager" },     // reference — managers live independently
  code:  codeSchema,                                // embedded
  tests: [testSchema],                              // embedded
});
```

**Submission references Coder + Challenge.** Both exist independently, so the
submission just holds `ObjectId` refs — which `populate()` can expand:

```js
Submission.findOne().populate("coder", "first_name").populate("challenge", "title");
```

### Seeding dummy data (idempotently)

`src/seed/index.js` populates each collection **only when it's empty**
(`countDocuments() === 0`), so restarting the server never duplicates data. It
reuses the mock challenges from `src/data/challenges.js`, mapping them to the
model shape (`level → difficulty`, `code_text.text → content`,
`tests.output → expected_output`) and attaching the seeded manager:

```
First run:  Seeded dummy data: { managers: 1, coders: 2, challenges: 4, submissions: 1 }
Next runs:  Seed: database already populated, skipping.
```

### Trying it out

```bash
cd coders-app-api
cp .env.example .env          # then fill in MONGODB_URI + MONGODB_DB
npm install
npm run dev                   # connects to Atlas, seeds on first run, then listens
```

> Atlas note: your cluster's **Network Access** allowlist must include the IP
> you're connecting from (or `0.0.0.0/0` for a learning project), or the connect
> will fail on IP even with a correct URI.

---

## Authentication

The [Authentication assignment](../Project%20Authentication.pdf) finally makes the
auth layer *real*. Until now `auth.service.js` was a stub returning a mock user
and a fake token; the `User` model stored plaintext passwords. This phase adds:

1. **Registration** that hashes the password (bcrypt) and emails a verification link.
2. An **email-verification route** that flips `is_verified` to `true`.
3. **Login** that rejects unverified / wrong-credential attempts and issues a JWT.
4. An **`authorize(...roles)`** middleware to guard endpoints.

Three small libraries do the heavy lifting: `bcryptjs` (hashing), `jsonwebtoken`
(tokens), and `nodemailer` (email).

### Hashing lives in the model, not the service

Rather than hash in the service (and risk forgetting it somewhere), the password
is hashed by a **pre-save hook** on the `User` schema. Because Mongoose runs
base-schema hooks for the `Coder`/`Manager` discriminators too, both subtypes get
hashing for free. The model also gains `is_verified`, a `comparePassword` helper,
and a `toJSON` transform so the hash is never serialised into a response:

```js
userSchema.add({ is_verified: { type: Boolean, default: false } });

// Note: an *async* pre-save hook resolves via its promise — it does NOT take
// (and must not call) `next` in Mongoose 9, or you get "next is not a function".
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;      // only when it actually changed
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
```

### Two token shapes, one secret

Both JWTs are signed with `JWT_SECRET` (from `.env`), declared in one place
(`src/utils/token.js`). The **verification** token encodes `{ id, role }` (per the
brief); the **login** token encodes `{ id, email }` — *plus* `role`, so the
authorization middleware can make role decisions:

```js
export const signVerifyToken = ({ id, role })        => jwt.sign({ id, role }, SECRET, { expiresIn: "1d" });
export const signLoginToken  = ({ id, email, role }) => jwt.sign({ id, email, role }, SECRET, { expiresIn: "7d" });
```

> Design note: the PDF says the login token carries *id and email*. We add `role`
> as well because `authorize(...roles)` needs it — but only `{ id, email }` is
> ever exposed to route handlers via `req.user`. The role rides along in the token
> for the guard; it doesn't leak into your controllers.

### Register: before → after

**Before** (stub) — invent an id and hand back a mock record:

```js
export const register = async ({ role, email }) => ({ id: nextId++, role, email });
```

**After** — reject duplicate emails, create through the right discriminator (the
hook hashes the password), then email a verification link:

```js
export const register = async ({ role, first_name, last_name, email, password }) => {
  if (await User.findOne({ email })) throw httpError(409, "…already exists");

  const Model = role === "manager" ? Manager : Coder;
  const user  = await Model.create({ first_name, last_name, email, password });

  const token     = signVerifyToken({ id: user.id, role: user.role });
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;
  const emailPreviewUrl = await sendVerificationEmail(user, verifyUrl);   // Ethereal in dev
  return { user, emailPreviewUrl };
};
```

### Email without a real mail server

`src/utils/mailer.js` uses **nodemailer**. In production it reads SMTP creds from
the environment; in development — when no `SMTP_HOST` is set — it falls back to a
throwaway **Ethereal** test account. Ethereal doesn't deliver mail; it captures it
and returns a browser **preview URL**, which the server logs alongside the raw
verify link so you can complete the flow with `curl`:

```
Verification email sent to test.coder@example.com
  Verify link : http://localhost:4000/api/auth/verify?token=eyJhbGciOiJ…
  Email preview: https://ethereal.email/message/…
```

### The verification route returns HTML

Because a user reaches it by clicking a link in their inbox, the verify route
renders a small **HTML page** (the brief allows this) rather than JSON. It decodes
the token, finds the user by the encoded id, flips `is_verified`, and is
idempotent (re-clicking a used-but-valid link still succeeds):

```js
export const verifyEmail = async (token) => {
  const { id } = verifyToken(token);              // throws → rendered as an error page
  const user = await User.findById(id);
  if (!user.is_verified) { user.is_verified = true; await user.save(); }
  return user;
};
```

### Login: verified + correct, or a clear error

Login finds the user by email, and returns the **same 401** for "no such user",
"wrong password", and "wrong user type" (so we don't leak which emails exist).
Unverified accounts get a distinct **403**; success issues the login JWT:

```js
if (!user || user.role.toLowerCase() !== role) throw httpError(401, "Invalid email or password");
if (!(await user.comparePassword(password)))   throw httpError(401, "Invalid email or password");
if (!user.is_verified)                          throw httpError(403, "Please verify your email…");
return { token: signLoginToken({ id: user.id, email: user.email, role: user.role }), user };
```

### The `authorize(...roles)` guard

A middleware **creator**: call it with the roles a route allows, and it returns an
Express middleware that reads the `Authorization: Bearer <jwt>` header, verifies
the token, checks the role, and injects `{ id, email }` onto `req.user`:

```js
export const authorize = (...roles) => (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) throw httpError(401, "Missing … Authorization header");

  let payload;
  try { payload = verifyToken(token); } catch { throw httpError(401, "Invalid or expired token"); }
  if (roles.length && !roles.includes(payload.role)) throw httpError(403, "…insufficient role");

  req.user = { id: payload.id, email: payload.email };    // identity only — not the role
  next();
};
```

Two demo routes show it off without touching the earlier phases' endpoints:
`GET /api/auth/me` (`authorize()` — any logged-in user, echoes `req.user`) and
`GET /api/auth/managers-only` (`authorize("Manager")` — a Coder's token gets a 403).

### Trying it out (Authentication)

```bash
cd coders-app-api
# .env needs JWT_SECRET and APP_URL in addition to the Mongo vars (see .env.example)
npm install
npm run dev

# 1) Register → 201; note the emailPreviewUrl and watch the log for the verify link
curl -s -X POST localhost:4000/api/auth/coders/register -H 'Content-Type: application/json' \
  -d '{"first_name":"Test","last_name":"Coder","email":"test.coder@example.com","password":"secret123"}'

# 2) Login before verifying → 403
curl -s -X POST localhost:4000/api/auth/coders/login -H 'Content-Type: application/json' \
  -d '{"email":"test.coder@example.com","password":"secret123"}'

# 3) Open the "Verify link" from the server log → HTML "Account verified ✅"; is_verified is now true
# 4) Login again → 200 with a JWT; save it as $JWT

# 5) The guard: identity in, role enforced
curl -s localhost:4000/api/auth/me                     # 401 (no token)
curl -s localhost:4000/api/auth/me          -H "Authorization: Bearer $JWT"   # 200 {user:{id,email}}
curl -s localhost:4000/api/auth/managers-only -H "Authorization: Bearer $JWT" # 403 for a Coder
```

> Seed note: seeded users are now created **pre-verified** with hashed passwords,
> so they're login-ready — but the seed only inserts into an *empty* collection.
> If your database was seeded before this phase, those older rows keep their
> plaintext/unverified state; the reliable demo path is **register → verify → login**.
