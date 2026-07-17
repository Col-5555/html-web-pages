import { httpError } from "./httpError.js";

// Client for the external code-runner web service. It executes submitted js/py
// code against a challenge's test cases and returns a per-test report. We don't
// run any code ourselves — we just format the request and relay the result.
//
// The URL is configurable via CODE_RUNNER_URL (defaults to the runner provided
// with the brief). The runner is hosted on a free tier and can cold-start, so
// the timeout is generous and also overridable via CODE_RUNNER_TIMEOUT_MS.
const RUNNER_URL = process.env.CODE_RUNNER_URL || "https://runlang-v1.onrender.com/run";
const TIMEOUT_MS = Number(process.env.CODE_RUNNER_TIMEOUT_MS) || 60000;

// POST a grading payload to the runner and return its parsed JSON response.
// Shape sent:     { lang, code, func_name, tests: [{ _id, inputs: [{ value }], output }] }
// Shape returned: { status: "passed"|"failed", message?, test_results?: [...] }
// Network / non-2xx / timeout problems surface as a 502/504 so the grade
// endpoint reports "runner unavailable" rather than a generic 500.
export const runCode = async (payload) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(RUNNER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw httpError(502, `Code runner responded with ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    if (err.status) throw err; // already an httpError from the !ok branch
    if (err.name === "AbortError") {
      throw httpError(504, "Code runner timed out — please try again");
    }
    throw httpError(502, `Code runner unavailable: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
};
