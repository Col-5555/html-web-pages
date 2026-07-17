import mongoose from "mongoose";
import { Challenge, Submission } from "../models/index.js";

// Turn an aggregation's [{ _id, count }] rows into a plain { key: count } lookup.
const countsByKey = (rows) =>
  rows.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

// Solved-challenges statistics for one coder: how many challenges exist per
// difficulty (platform-wide) and how many of them this coder has solved.
export const getSolvedChallenges = async (coderId) => {
  const coder = new mongoose.Types.ObjectId(coderId);

  // Total challenges per difficulty (platform-wide).
  const totalRows = await Challenge.aggregate([
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
  ]);
  const totals = countsByKey(totalRows);

  // Distinct challenges this coder has passed, bucketed by difficulty.
  const solvedRows = await Submission.aggregate([
    { $match: { coder, passed: true } },
    { $group: { _id: "$challenge" } }, // distinct solved challenges
    { $lookup: { from: "challenges", localField: "_id", foreignField: "_id", as: "challenge" } },
    { $unwind: "$challenge" },
    { $group: { _id: "$challenge.difficulty", count: { $sum: 1 } } },
  ]);
  const solved = countsByKey(solvedRows);

  return {
    totalEasySolvedChallenges: solved.Easy ?? 0,
    totalModerateSolvedChallenges: solved.Moderate ?? 0,
    totalHardSolvedChallenges: solved.Hard ?? 0,
    totalEasyChallenges: totals.Easy ?? 0,
    totalModerateChallenges: totals.Moderate ?? 0,
    totalHardChallenges: totals.Hard ?? 0,
  };
};

// Trending categories (platform-wide): the categories with the most passing
// submissions, most popular first. Built with the aggregation pipeline the brief
// describes: filter passed → join to challenges → group+count by category →
// surface the category field → sort → project.
export const getTrendingCategories = async () => {
  return Submission.aggregate([
    { $match: { passed: true } },
    { $lookup: { from: "challenges", localField: "challenge", foreignField: "_id", as: "challenge" } },
    { $unwind: "$challenge" },
    { $group: { _id: "$challenge.category", count: { $sum: 1 } } },
    { $addFields: { category: "$_id" } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, category: 1, count: 1 } },
  ]);
};

// Submission "strikes" heatmap for one coder: the number of passing submissions
// per day within [start_date, end_date]. When a bound is omitted it defaults to
// the current date (end) and one year before it (start), per the brief.
export const getHeatmap = async ({ start_date, end_date } = {}, coderId) => {
  const coder = new mongoose.Types.ObjectId(coderId);
  const end = end_date ?? new Date();
  let start = start_date;
  if (!start) {
    start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
  }

  return Submission.aggregate([
    { $match: { coder, passed: true, submitted_at: { $gte: start, $lte: end } } },
    { $addFields: { date: { $dateToString: { format: "%Y/%m/%d", date: "$submitted_at" } } } },
    { $group: { _id: "$date", count: { $sum: 1 } } },
    { $addFields: { date: "$_id" } },
    { $sort: { date: 1 } },
    { $project: { _id: 0, date: 1, count: 1 } },
  ]);
};
