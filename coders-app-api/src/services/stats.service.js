import { solvedChallenges, trendingCategories, heatmap } from "../data/stats.js";

// System-statistics service — STUB over mock data (persistence: later assignment).

// Challenges solved per difficulty, plus a computed total.
export const getSolvedChallenges = async () => {
  const total_solved = Object.values(solvedChallenges).reduce(
    (sum, level) => sum + level.solved,
    0
  );
  return { ...solvedChallenges, total_solved };
};

// The trending (most-submitted) categories.
export const getTrendingCategories = async () => trendingCategories;

// The submission heatmap, optionally restricted to a [start_date, end_date]
// window (inclusive). Dates arrive already coerced to Date objects by Joi.
export const getHeatmap = async ({ start_date, end_date } = {}) => {
  return heatmap.filter((entry) => {
    const date = new Date(entry.date);
    if (start_date && date < start_date) return false;
    if (end_date && date > end_date) return false;
    return true;
  });
};
