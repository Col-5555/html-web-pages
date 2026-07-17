import * as statsService from "../services/stats.service.js";

// Solved-challenges statistics for the requesting coder (per difficulty:
// solved-by-them vs total available).
export const getSolvedChallenges = async (req, res) => {
  const stats = await statsService.getSolvedChallenges(req.user.id);
  res.status(200).json(stats);
};

// Trending categories (platform-wide).
export const getTrendingCategories = async (req, res) => {
  const categories = await statsService.getTrendingCategories();
  res.status(200).json(categories);
};

// Submission heatmap for the requesting coder. Extract the optional start_date /
// end_date filters (validated) and pass them through with the coder's id.
export const getHeatmap = async (req, res) => {
  const { start_date, end_date } = req.validated?.query ?? {};
  const heatmap = await statsService.getHeatmap({ start_date, end_date }, req.user.id);
  res.status(200).json(heatmap);
};
