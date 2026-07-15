import * as statsService from "../services/stats.service.js";

// Solved-challenges statistics (per difficulty + total).
export const getSolvedChallenges = async (req, res) => {
  const stats = await statsService.getSolvedChallenges();
  res.status(200).json(stats);
};

// Trending categories.
export const getTrendingCategories = async (req, res) => {
  const categories = await statsService.getTrendingCategories();
  res.status(200).json(categories);
};

// Submission heatmap. Extract the optional start_date / end_date filters
// (validated) and pass them through to the service.
export const getHeatmap = async (req, res) => {
  const { start_date, end_date } = req.validated?.query ?? {};
  const heatmap = await statsService.getHeatmap({ start_date, end_date });
  res.status(200).json(heatmap);
};
