import mongoose from "mongoose";
import { Coder, Challenge, Submission } from "../models/index.js";
import { httpError } from "../utils/httpError.js";
import { runCode } from "../utils/codeRunner.js";

// Submission service — grades a coder's code against a challenge's tests by
// delegating execution to the external code runner (src/utils/codeRunner.js),
// then persists the outcome and updates the coder's score.

// Shape the challenge's embedded tests into the runner's expected format. The
// embedded tests have no _id of their own ({ _id: false }), so we use the array
// index as a stable per-test id; the runner echoes it back as `test_id`.
const toRunnerTests = (tests) =>
  tests.map((test, index) => ({
    _id: String(index),
    inputs: test.inputs.map((input) => ({ value: input.value })),
    output: test.expected_output,
  }));

// Grade a submission. `coderId` comes from the authenticated coder's token.
export const gradeSubmission = async ({ lang, code, challenge_id }, coderId) => {
  if (!mongoose.isValidObjectId(challenge_id)) {
    throw httpError(404, `Challenge ${challenge_id} not found`);
  }

  const challenge = await Challenge.findById(challenge_id);
  if (!challenge) throw httpError(404, `Challenge ${challenge_id} not found`);

  // A coder can't re-solve a challenge they've already passed.
  const alreadySolved = await Submission.findOne({
    coder: coderId,
    challenge: challenge_id,
    passed: true,
  });
  if (alreadySolved) {
    throw httpError(409, "You have already solved this challenge");
  }

  // Run the code against the tests.
  const report = await runCode({
    lang,
    code,
    func_name: challenge.code.function_name,
    tests: toRunnerTests(challenge.tests),
  });

  // Passed only when the runner says so. On pass, the score is the sum over all
  // test cases of (weight × 100); a failure scores 0.
  const passed = report.status === "passed";
  const score = passed
    ? challenge.tests.reduce((sum, test) => sum + test.weight * 100, 0)
    : 0;

  const submission = await Submission.create({
    coder: coderId,
    challenge: challenge_id,
    code,
    language: lang,
    passed,
    score,
  });

  // A passing submission adds to the coder's cumulative leaderboard score.
  if (passed) {
    await Coder.findByIdAndUpdate(coderId, { $inc: { score } });
  }

  return {
    submission_id: submission.id,
    challenge_id,
    passed,
    score,
    status: report.status,
    message: report.message, // e.g. syntax-error note when the runner couldn't execute
    test_results: report.test_results ?? [],
  };
};
