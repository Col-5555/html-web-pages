import * as challengeService from "../services/challenge.service.js";

// Create a challenge. The route is guarded to Managers, so req.user.id is the
// authoring manager. The create validator sanitised the body onto
// req.validated.body.
export const create = async (req, res) => {
  const challenge = await challengeService.createChallenge(req.validated.body, req.user.id);
  res.status(201).json({ message: "Challenge created", challenge });
};

// List challenges (role-aware — see the service), optionally filtered by
// ?category. Every challenge carries a solution_rate; coders also get a status.
export const list = async (req, res) => {
  const { category } = req.validated?.query ?? {};
  const challenges = await challengeService.listChallenges(req.user.id, { category });
  res.status(200).json(challenges);
};

// Fetch one challenge by id (404 if missing / not visible to the requester).
export const getById = async (req, res) => {
  const challenge = await challengeService.getChallenge(req.params.id, req.user.id);
  res.status(200).json(challenge);
};

// List the distinct categories currently in use.
export const listCategories = async (req, res) => {
  const categories = await challengeService.listCategories();
  res.status(200).json(categories);
};
