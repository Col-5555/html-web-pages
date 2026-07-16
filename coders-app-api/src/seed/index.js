import { Coder, Manager, Challenge, Submission } from "../models/index.js";
import { challenges as mockChallenges } from "../data/challenges.js";

// Dummy passwords for seeded users — clearly not real (hashing/auth is a later
// assignment). Never a real credential.
const SEED_PASSWORD = "seed-not-a-real-password";

// Map a mock challenge (src/data/challenges.js) into the Challenge model shape:
// level → difficulty, code_text[].text → content, tests[].output → expected_output,
// and attach the authoring manager.
function toChallengeDoc(mock, managerId) {
  return {
    title: mock.title,
    category: mock.category,
    description: mock.description,
    difficulty: mock.level,
    manager: managerId,
    code: {
      function_name: mock.code.function_name,
      code_text: mock.code.code_text.map((c) => ({ language: c.language, content: c.text })),
      inputs: mock.code.inputs,
    },
    tests: mock.tests.map((t) => ({
      weight: t.weight,
      inputs: t.inputs,
      expected_output: t.output,
    })),
  };
}

// Seed dummy data on startup. Idempotent: each collection is only populated when
// it's empty, so restarting the server doesn't create duplicates.
export async function seedDatabase() {
  const summary = {};

  // Manager (author of the challenges)
  let manager = await Manager.findOne();
  if (!manager) {
    manager = await Manager.create({
      first_name: "Grace",
      last_name: "Hopper",
      email: "grace@codecla.dev",
      password: SEED_PASSWORD,
    });
    summary.managers = 1;
  }

  // Coders
  let coders = await Coder.find();
  if (coders.length === 0) {
    coders = await Coder.create([
      {
        first_name: "Omar",
        last_name: "Moukhfi",
        email: "omar@codecla.dev",
        password: SEED_PASSWORD,
        description: "Full-stack learner working through the CLA challenges.",
        score: 120,
      },
      {
        first_name: "Alice",
        last_name: "Smith",
        email: "alice@codecla.dev",
        password: SEED_PASSWORD,
        description: "Enjoys graph problems and clean recursion.",
        score: 80,
      },
    ]);
    summary.coders = coders.length;
  }

  // Challenges (each references the manager)
  let challenges = await Challenge.find();
  if (challenges.length === 0) {
    challenges = await Challenge.create(
      mockChallenges.map((m) => toChallengeDoc(m, manager._id))
    );
    summary.challenges = challenges.length;
  }

  // A sample Submission (references a coder + a challenge)
  if ((await Submission.countDocuments()) === 0 && coders.length && challenges.length) {
    await Submission.create({
      coder: coders[0]._id,
      challenge: challenges[0]._id,
      passed: true,
      score: 1,
      code: "def twoSum(nums, target):\n    return [0, 1]",
      language: "py",
    });
    summary.submissions = 1;
  }

  if (Object.keys(summary).length) {
    console.log("Seeded dummy data:", summary);
  } else {
    console.log("Seed: database already populated, skipping.");
  }
}
