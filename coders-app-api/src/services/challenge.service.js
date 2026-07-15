import { challenges } from "../data/challenges.js";
import { httpError } from "../utils/httpError.js";

// Challenge service — STUB. Reads/writes the in-memory mock store; real
// persistence arrives in a later assignment.

let nextId = 1000;

// List challenges, optionally filtered by category.
export const listChallenges = async ({ category } = {}) => {
  if (!category) return challenges;
  return challenges.filter((challenge) => challenge.category === category);
};

// Fetch one challenge by id, or 404.
export const getChallenge = async (id) => {
  const challenge = challenges.find((c) => c.id === id);
  if (!challenge) {
    throw httpError(404, `Challenge ${id} not found`);
  }
  return challenge;
};

// Create a challenge (used to populate the DB, per the brief). Assigns an id and
// appends to the mock store so subsequent GETs see it.
export const createChallenge = async (data) => {
  const challenge = { id: String(nextId++), ...data };
  challenges.push(challenge);
  return challenge;
};

// The distinct categories currently in use.
export const listCategories = async () => {
  return [...new Set(challenges.map((challenge) => challenge.category))];
};
