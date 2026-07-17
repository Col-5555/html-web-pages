# Unit Testing — walkthrough

This assignment adds two things to **`coders-app-api`** (the Express backend):

1. **Part 1 — a test / dev / prod environment system:** an `envLoader` utility that
   loads a different `.env.<env>` file depending on which environment the server is
   running in.
2. **Part 2 — Jest + Supertest API tests** for the auth and challenges endpoints,
   running against an isolated **test database**.

> Built in two phases, each its own commit + tag (`unit-testing-env`,
> `unit-testing-api`).

---

## Part 1 — Test, Dev, and Prod environments

### The idea

Real projects don't share one set of configuration across every situation. The
**dev** environment is where you write code; **prod** is where the app serves real
users; **test** is a throwaway environment where an automated suite can seed and
delete data freely. Crucially, each points at a **different database** so tests
never clobber real data.

We express each environment as its own file — `.env.dev`, `.env.test`, `.env.prod`
— and choose between them at runtime with a single variable, `APP_ENV`.

### Before

The server loaded one hard-coded `.env` using Node's built-in flag, baked into the
npm scripts:

```jsonc
// package.json (before)
"scripts": {
  "start": "node --env-file-if-exists=.env src/index.js",
  "dev":   "node --env-file-if-exists=.env --watch src/index.js"
}
```

One file, one database, no notion of "which environment am I in".

### After

**1. An `envLoader` utility** (`src/config/env.js`). It switches on the environment
name and loads the matching file with [`dotenv`](https://www.npmjs.com/package/dotenv):

```js
export function envLoader(env = "dev") {
  switch (env) {
    case "test":
      return dotenv.config({ path: path.join(rootDir, ".env.test") });
    case "dev":
      return dotenv.config({ path: path.join(rootDir, ".env.dev") });
    case "prod":
      return dotenv.config({ path: path.join(rootDir, ".env.prod") });
    default:
      return dotenv.config({ path: path.join(rootDir, ".env.dev") });
  }
}

// Load immediately on import, based on how the server was started.
envLoader(process.env.APP_ENV);
```

**2. `cross-env` sets `APP_ENV` in the scripts.**
[`cross-env`](https://www.npmjs.com/package/cross-env) sets the variable the same
way on macOS, Linux, and Windows:

```jsonc
// package.json (after)
"scripts": {
  "start": "cross-env APP_ENV=prod node src/index.js",
  "dev":   "cross-env APP_ENV=dev node --watch src/index.js"
}
```

So `npm run dev` → `APP_ENV=dev` → `envLoader` loads `.env.dev` →
`MONGODB_DB=ImpDatabaseDesign`. Later, `npm test` → `APP_ENV=test` → `.env.test` →
`MONGODB_DB=ImpDatabaseDesign_test`, a completely separate database on the same
Atlas cluster.

### The subtle part: import order in ES modules

The brief says "replace calls to `dotenv.config()` with `envLoader` and load the
env before the app runs." In an **ES-module** project (`"type": "module"`), that's
trickier than it looks, because some config reads the environment *the moment it's
imported*:

```js
// src/config/auth.js
export const JWT_SECRET = process.env.JWT_SECRET; // read at import time!
```

ES modules are evaluated **in import order, depth-first** — every `import` at the
top of a file runs to completion before the next line. If the environment isn't
loaded by the time `config/auth.js` is evaluated, `JWT_SECRET` is `undefined` and
tokens can't be signed.

The fix is to make the env loader the **very first import** of the entry point, so
its `envLoader()` side-effect runs before anything else is evaluated:

```js
// src/index.js
import "./config/env.js";              // ← must be first: populates process.env

import { createApp } from "./app.js";  // app → routes → … → config/auth.js
import { connectDB } from "./config/db.js";
```

(`config/db.js` is safe either way — it reads `process.env` *inside* `connectDB()`,
at call time, not at import time.)

### Keeping credentials out of git

The real `.env.dev` / `.env.test` files hold live Atlas credentials, so they're
**gitignored**. The repo's `.gitignore` only ignored `.env` and `.env*.local`, which
would have let `.env.test` and `.env.dev` slip into a commit — so it was tightened:

```gitignore
.env.*
!.env.example
!.env.*.example
```

Committed `*.example` templates (`.env.dev.example`, `.env.test.example`) document
the shape without the secrets.

### Trying it out

```bash
cd coders-app-api
npm install
cp .env.dev.example .env.dev     # fill in your Atlas URI + JWT secret
npm run dev
```

You'll see `dotenv` report the file it injected and Mongoose connect to the dev DB:

```
injected env (5) from .env.dev
MongoDB connected → db "ImpDatabaseDesign"
Coders API listening on http://localhost:4000
```

Switching `APP_ENV` swaps the whole configuration — most importantly the database —
without touching a line of application code.

---

## Part 2 — API tests

### The idea

Now that a **test environment** exists (its own database, wiped freely), we can
write automated tests that exercise the real HTTP endpoints.
[**Supertest**](https://www.npmjs.com/package/supertest) fires requests at the
Express app in-process (no need to bind a port), and [**Jest**](https://jestjs.io/)
runs the suite and makes the assertions.

### Setup

`jest` and `supertest` are dev dependencies. Because the project is an ES-module
project, Jest runs in native-ESM mode via a Node flag, and a `test` script wires
the whole thing together with the test environment:

```jsonc
// package.json
"scripts": {
  "test": "cross-env APP_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --runInBand"
},
"jest": {
  "testEnvironment": "node",
  "testMatch": ["**/test/**/*.test.js"]
}
```

- `APP_ENV=test` → `envLoader` loads `.env.test` → the isolated `_test` database.
- `--experimental-vm-modules` lets Jest load ES modules natively (no Babel).
- `--runInBand` runs tests serially — they share one database, so we don't want
  parallel workers stepping on each other.

### The app is testable by design

`src/app.js` exports `createApp()` which builds the Express app **without** calling
`listen()` — the port binding lives in `src/index.js`. That separation is what lets
Supertest drive the app directly:

```js
import { createApp } from "../src/app.js";
const app = createApp();

const res = await request(app).get("/api/challenges");
```

And, exactly like `index.js`, the test file imports the env loader **first** so the
config is populated before anything reads it:

```js
import "../src/config/env.js";   // ← first line of the test file
```

### Seeding: `beforeAll`

Before the tests run, we insert dummy data **through the Mongoose models** (not raw
inserts) so the model hooks run — importantly, the `User` pre-save hook hashes the
password, so login works:

- one **manager** and one **coder** (both `is_verified: true`, so login isn't
  blocked with a 403);
- two **challenges** authored by that manager;
- two **submissions** by the coder — one **passing** (→ challenge status
  `Completed`) and one **failing** (→ status `Attempted`).

We also log the coder in once here and stash the token, so the "challenges after
login" test can reuse it.

```js
coder = await Coder.create({
  first_name: "Test", last_name: "Coder",
  email: CODER_EMAIL, password: CODER_PASSWORD, is_verified: true,
});
// …challenges, then submissions:
{ coder: coder._id, challenge: challengeCompleted._id, passed: true,  … } // Completed
{ coder: coder._id, challenge: challengeAttempted._id, passed: false, … } // Attempted
```

> **Gotcha — the email TLD.** The login/register Joi schemas use
> `Joi.string().email()`, which validates the domain against the real IANA TLD
> list. A `@…​.test` address is *rejected* (`.test` is a reserved, non-routable
> TLD), so the fixtures use `@…​.dev` — a real TLD — just like the app's own seed
> data. A separate database keeps them from colliding.

### The four test cases (names taken verbatim from the brief)

```js
it("should return an unauthorized error when the user is not logged in", …)
// GET /api/challenges with no header → 401

it("should return an unauthorized error when the user passes an invalid token", …)
// GET /api/challenges, Authorization: Bearer not-a-real-token → 401

it("should return a valid token when the correct credentials are passed to the login endpoint", …)
// POST /api/auth/coders/login → 200, body.token is a non-empty string

it("should return all the challenges for the coder after login", …)
// GET /api/challenges with the coder's Bearer token → 200; assert exactly one
// "Completed" and one "Attempted" status among the returned challenges
```

The first two prove the `authorize()` middleware guards the route; the third proves
login issues a signed token; the fourth proves both the auth flow **and** the
per-coder status logic (`Waiting`/`Attempted`/`Completed`) from the challenges
service.

### Cleanup: `afterAll`

The suite removes exactly the documents it inserted and closes the Mongoose
connection, so the test database is left empty and Jest exits cleanly (no
open-handle warning):

```js
afterAll(async () => {
  await Submission.deleteMany({ coder: coder?._id });
  await Challenge.deleteMany({ _id: { $in: [ … ] } });
  await Coder.deleteMany({ _id: coder?._id });
  await Manager.deleteMany({ _id: manager?._id });
  await mongoose.connection.close();
});
```

### Trying it out

```bash
cd coders-app-api
cp .env.test.example .env.test   # point MONGODB_DB at a dedicated test database
npm test
```

```
MongoDB connected → db "ImpDatabaseDesign_test"

 PASS  test/challenges.test.js
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

The suite seeds `ImpDatabaseDesign_test`, runs the four cases, then wipes the data
— the dev and prod databases are never touched.

