// API tests for the auth + challenges endpoints, run with Jest + Supertest
// against the isolated TEST database (see .env.test / config/env.js).
//
// Load the environment FIRST — before importing the app or any config module —
// so process.env is populated (JWT_SECRET, MONGODB_URI, …) before modules that
// read it at import time are evaluated. Same ordering rule as src/index.js.
import "../src/config/env.js";

import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { Coder, Manager, Challenge, Submission } from "../src/models/index.js";

// Connecting + seeding can take a moment against Atlas; give the hooks room.
jest.setTimeout(30000);

const app = createApp();

// Known plaintext password for the seeded coder. The User pre-save hook hashes
// it on create, so login's comparePassword works with this value.
const CODER_PASSWORD = "test-coder-password";
// Use a real IANA TLD (.dev) — Joi's email validator rejects the reserved
// .test TLD. A separate test database keeps these clear of the dev seed data.
const CODER_EMAIL = "test.coder@codecla.dev";
const MANAGER_EMAIL = "test.manager@codecla.dev";

// A minimal but schema-valid challenge authored by the given manager.
const makeChallenge = (title, managerId) => ({
  title,
  category: "Arrays",
  description: "Test challenge.",
  difficulty: "Easy",
  manager: managerId,
  code: {
    function_name: "solve",
    code_text: [{ language: "js", content: "function solve() {}" }],
    inputs: [{ name: "n", type: "number" }],
  },
  tests: [{ weight: 1, inputs: [{ name: "n", value: 1 }], expected_output: 1 }],
});

// Handles to the inserted docs so afterAll can remove exactly what we created.
let manager;
let coder;
let challengeCompleted; // coder has a PASSING submission -> status "Completed"
let challengeAttempted; // coder has a FAILING submission -> status "Attempted"
let coderToken; // obtained via a real login in beforeAll, reused below

beforeAll(async () => {
  await connectDB();

  // Clean slate for these fixtures in case a previous run left them behind
  // (scoped to our test emails / their data — never a blanket wipe).
  await Manager.deleteMany({ email: MANAGER_EMAIL });
  await Coder.deleteMany({ email: CODER_EMAIL });

  manager = await Manager.create({
    first_name: "Test",
    last_name: "Manager",
    email: MANAGER_EMAIL,
    password: "test-manager-password",
    is_verified: true,
  });

  coder = await Coder.create({
    first_name: "Test",
    last_name: "Coder",
    email: CODER_EMAIL,
    password: CODER_PASSWORD,
    is_verified: true,
  });

  [challengeCompleted, challengeAttempted] = await Challenge.create([
    makeChallenge("Completed Challenge", manager._id),
    makeChallenge("Attempted Challenge", manager._id),
  ]);

  await Submission.create([
    {
      coder: coder._id,
      challenge: challengeCompleted._id,
      passed: true, // -> Completed
      score: 100,
      code: "function solve(n){ return n; }",
      language: "js",
    },
    {
      coder: coder._id,
      challenge: challengeAttempted._id,
      passed: false, // -> Attempted
      score: 0,
      code: "function solve(){ return -1; }",
      language: "js",
    },
  ]);

  // Log in once so the "challenges after login" test can reuse the token.
  const res = await request(app)
    .post("/api/auth/coders/login")
    .send({ email: CODER_EMAIL, password: CODER_PASSWORD });
  coderToken = res.body.token;
});

afterAll(async () => {
  // Remove exactly the data this suite inserted, then close the connection.
  await Submission.deleteMany({ coder: coder?._id });
  await Challenge.deleteMany({
    _id: { $in: [challengeCompleted?._id, challengeAttempted?._id] },
  });
  await Coder.deleteMany({ _id: coder?._id });
  await Manager.deleteMany({ _id: manager?._id });
  await mongoose.connection.close();
});

describe("GET /api/challenges — authorization", () => {
  it("should return an unauthorized error when the user is not logged in", async () => {
    const res = await request(app).get("/api/challenges");
    expect(res.status).toBe(401);
  });

  it("should return an unauthorized error when the user passes an invalid token", async () => {
    const res = await request(app)
      .get("/api/challenges")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/coders/login", () => {
  it("should return a valid token when the correct credentials are passed to the login endpoint", async () => {
    const res = await request(app)
      .post("/api/auth/coders/login")
      .send({ email: CODER_EMAIL, password: CODER_PASSWORD });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
  });
});

describe("GET /api/challenges — after login", () => {
  it("should return all the challenges for the coder after login", async () => {
    const res = await request(app)
      .get("/api/challenges")
      .set("Authorization", `Bearer ${coderToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Our two seeded challenges are present, each carrying the coder's status.
    const statuses = res.body.map((c) => c.status);
    expect(statuses).toContain("Completed");
    expect(statuses).toContain("Attempted");

    // Exactly one of each, from the passing / failing submissions we seeded.
    expect(statuses.filter((s) => s === "Completed")).toHaveLength(1);
    expect(statuses.filter((s) => s === "Attempted")).toHaveLength(1);
  });
});
