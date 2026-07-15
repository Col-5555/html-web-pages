import { challenges } from "../data/challenges.js";

// Submission service — STUB. The real grader is an external code-runner that
// executes the submitted code against the challenge's tests; that integration is
// a later assignment. Here we return a believable, deterministic mock result so
// the submission route/controller/validator can be exercised.
export const gradeSubmission = async ({ lang, code, challenge_id }) => {
  const challenge = challenges.find((c) => c.id === challenge_id);
  const tests = challenge?.tests ?? [];

  // Pretend every test passed (deterministic mock — no real execution yet).
  const results = tests.map((test, index) => ({
    test: index + 1,
    weight: test.weight,
    passed: true,
  }));
  const score = results.reduce((sum, r) => sum + r.weight, 0);

  return {
    challenge_id,
    lang,
    received_code_length: code.length,
    status: "graded",
    passed: results.length,
    total: tests.length,
    score, // weighted score in [0, 1]
    results,
    message: "Grading is stubbed until the code-runner service is available.",
  };
};
