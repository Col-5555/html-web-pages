import * as challengeService from "../services/challenge.service.js";

// Create a challenge. The create validator middleware has sanitised the body
// onto req.validated.body.
export const create = async (req, res) => {
  const challenge = await challengeService.createChallenge(req.validated.body);
  res.status(201).json({ message: "Challenge created", challenge });
};

// List challenges, optionally filtered by ?category (validated as a query).
export const list = async (req, res) => {
  const { category } = req.validated?.query ?? {};
  const challenges = await challengeService.listChallenges({ category });
  res.status(200).json(challenges);
};

// Fetch one challenge by id (404 if missing, thrown by the service).
export const getById = async (req, res) => {
  const challenge = await challengeService.getChallenge(req.params.id);
  res.status(200).json(challenge);
};

// List the distinct categories currently in use.
export const listCategories = async (req, res) => {
  const categories = await challengeService.listCategories();
  res.status(200).json(categories);
};
