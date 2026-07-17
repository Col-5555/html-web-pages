// Environment loader. The app runs in one of three environments — test, dev, or
// prod — each with its own configuration (crucially, a different database). We
// pick the right `.env.<env>` file at runtime from `process.env.APP_ENV`, which
// `cross-env` sets in the npm scripts (see package.json).
//
// IMPORTANT (ESM ordering): several config modules read process.env at *import
// time* (e.g. config/auth.js reads JWT_SECRET at module top level). ES modules
// are evaluated in import order, so this module MUST be imported *first* — before
// app.js / the config modules — so the env vars are populated before anything
// reads them. That's why src/index.js and the test suite import this file at the
// very top. Loading happens as a side-effect of import (see the call at the
// bottom of this file).

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Package root (this file lives at <root>/src/config/env.js).
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// Load the .env file for the given environment onto process.env. Defaults to dev
// so a bare `node src/index.js` (no APP_ENV) still works.
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

// Load immediately on import, based on the environment the server was started in.
envLoader(process.env.APP_ENV);
