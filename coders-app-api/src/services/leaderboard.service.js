import { leaderboard, topCoders } from "../data/leaderboard.js";

// Leaderboard service — STUB over mock data (persistence: later assignment).

// The full ranked leaderboard.
export const getLeaderboard = async () => leaderboard;

// The top `k` coders by score (capped at however many exist).
export const getTopCoders = async (k) => topCoders.slice(0, k);
