// Mock system-statistics data (analytics), reused from the coders-app samples.
// Real analytics come from the persistence layer in a later assignment.

// Challenges solved per difficulty level (out of the total available).
export const solvedChallenges = {
  easy: { solved: 30, total: 50 },
  moderate: { solved: 10, total: 50 },
  hard: { solved: 1, total: 50 },
};

// Most-submitted categories with their submission counts.
export const trendingCategories = [
  { category: "Graphs", count: 100 },
  { category: "Stacks", count: 45 },
  { category: "Algorithms", count: 20 },
  { category: "Databases", count: 3 },
];

// Daily correct-submission counts, used by the heatmap. Fixed dates so filtering
// by start_date / end_date is deterministic and easy to demonstrate.
export const heatmap = [
  { date: "2026-07-01", count: 2 },
  { date: "2026-07-02", count: 0 },
  { date: "2026-07-03", count: 4 },
  { date: "2026-07-04", count: 1 },
  { date: "2026-07-05", count: 10 },
  { date: "2026-07-06", count: 0 },
  { date: "2026-07-07", count: 3 },
  { date: "2026-07-08", count: 6 },
  { date: "2026-07-09", count: 0 },
  { date: "2026-07-10", count: 20 },
  { date: "2026-07-11", count: 5 },
  { date: "2026-07-12", count: 2 },
  { date: "2026-07-13", count: 0 },
  { date: "2026-07-14", count: 8 },
];
