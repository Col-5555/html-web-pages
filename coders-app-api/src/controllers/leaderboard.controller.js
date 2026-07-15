import * as leaderboardService from "../services/leaderboard.service.js";

// The full ranked leaderboard.
export const getLeaderboard = async (req, res) => {
  const board = await leaderboardService.getLeaderboard();
  res.status(200).json(board);
};

// The top `k` coders. `k` was validated (required positive integer) as a query,
// so it's read coerced from req.validated.query.
export const getTop = async (req, res) => {
  const { k } = req.validated.query;
  const coders = await leaderboardService.getTopCoders(k);
  res.status(200).json(coders);
};
