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

_(Added in Phase 2 — `unit-testing-api`.)_
