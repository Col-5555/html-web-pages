import mongoose from "mongoose";
import { User, Coder, Challenge, Submission } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

// Challenge service — real persistence over the Challenge model. Listing is
// role-aware: coders see every challenge (with their personal status); managers
// see only the ones they authored. Every challenge is decorated with a
// solution_rate.

// Map a validated create payload (level / code_text[].text / tests[].output) to
// the Challenge model shape (difficulty / content / expected_output) and attach
// the authoring manager. Mirrors the mapping used by the seed (src/seed/index.js).
const toChallengeDoc = (data, managerId) => ({
  title: data.title,
  category: data.category,
  description: data.description,
  difficulty: data.level,
  manager: managerId,
  code: {
    function_name: data.code.function_name,
    code_text: data.code.code_text.map((c) => ({ language: c.language, content: c.text })),
    inputs: data.code.inputs,
  },
  tests: data.tests.map((t) => ({
    weight: t.weight,
    inputs: t.inputs,
    expected_output: t.output,
  })),
});

// Create and persist a challenge authored by the given manager.
export const createChallenge = async (data, managerId) => {
  return Challenge.create(toChallengeDoc(data, managerId));
};

// solution_rate = percentage of coders (of ALL coders) who have a passing
// submission for the challenge. Returns a Map of challengeId → integer percent.
const solutionRates = async (challengeIds) => {
  const totalCoders = await Coder.countDocuments();
  const grouped = await Submission.aggregate([
    { $match: { passed: true, challenge: { $in: challengeIds } } },
    { $group: { _id: "$challenge", solvers: { $addToSet: "$coder" } } },
    { $project: { count: { $size: "$solvers" } } },
  ]);

  const rates = new Map();
  for (const { _id, count } of grouped) {
    rates.set(String(_id), totalCoders ? Math.round((count / totalCoders) * 100) : 0);
  }
  return rates;
};

// A coder's per-challenge status derived from their own submissions:
//   Waiting   — no submission yet
//   Attempted — submitted, but nothing passed
//   Completed — at least one passing submission
// Returns a Map of challengeId → status.
const coderStatuses = async (coderId, challengeIds) => {
  const subs = await Submission.find({
    coder: coderId,
    challenge: { $in: challengeIds },
  })
    .select("challenge passed")
    .lean();

  const status = new Map();
  for (const sub of subs) {
    const key = String(sub.challenge);
    if (sub.passed) status.set(key, "Completed");
    else if (!status.has(key)) status.set(key, "Attempted");
  }
  return status;
};

// Decorate a set of plain challenge docs with solution_rate, and — when the
// requester is a coder — each challenge's status for that coder.
const decorate = async (challenges, requester) => {
  const ids = challenges.map((c) => c._id);
  const rates = await solutionRates(ids);
  const statuses =
    requester.role === "Coder"
      ? await coderStatuses(requester._id, ids)
      : null;

  return challenges.map((challenge) => {
    const key = String(challenge._id);
    const decorated = { ...challenge, solution_rate: rates.get(key) ?? 0 };
    if (statuses) decorated.status = statuses.get(key) ?? "Waiting";
    return decorated;
  });
};

// List challenges. Coders see all; managers see only their own. Optional
// `category` filter is preserved from the original endpoint.
export const listChallenges = async (requesterId, { category } = {}) => {
  const requester = await User.findById(requesterId);

  const filter = {};
  if (category) filter.category = category;
  if (requester.role === "Manager") filter.manager = requesterId;

  const challenges = await Challenge.find(filter).lean();
  return decorate(challenges, requester);
};

// Fetch one challenge by id, decorated like the list. Managers can only fetch
// their own challenges (others read as "not found" from their perspective).
export const getChallenge = async (id, requesterId) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, `Challenge ${id} not found`);

  const requester = await User.findById(requesterId);
  const challenge = await Challenge.findById(id).lean();
  if (!challenge) throw httpError(404, `Challenge ${id} not found`);
  if (requester.role === "Manager" && String(challenge.manager) !== requesterId) {
    throw httpError(404, `Challenge ${id} not found`);
  }

  const [decorated] = await decorate([challenge], requester);
  return decorated;
};

// The distinct categories currently in use, queried from the database.
export const listCategories = async () => {
  return Challenge.distinct("category");
};
