import { Coder } from "../models/index.js";

// Leaderboard service — coders ranked by score, each annotated with the number
// of distinct challenges they've solved (from their passing submissions).

// Build the ranking pipeline. `limit` (optional) caps the result to the top-k.
// Note: aggregate() does NOT apply the Coder discriminator filter automatically
// (unlike find), so we match role: "Coder" explicitly.
const rankingPipeline = (limit) => {
  const pipeline = [
    { $match: { role: "Coder" } },
    { $sort: { score: -1 } },
  ];
  if (limit) pipeline.push({ $limit: limit });
  pipeline.push(
    {
      // Distinct challenges this coder has passed.
      $lookup: {
        from: "submissions",
        let: { coderId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ["$coder", "$$coderId"] }, { $eq: ["$passed", true] }] },
            },
          },
          { $group: { _id: "$challenge" } },
        ],
        as: "solved",
      },
    },
    { $addFields: { solved_challenges: { $size: "$solved" } } },
    { $project: { solved: 0, password: 0, __v: 0 } }
  );
  return pipeline;
};

// The full ranked leaderboard (highest score first).
export const getLeaderboard = async () => Coder.aggregate(rankingPipeline());

// The top `k` coders by score.
export const getTopCoders = async (k) => Coder.aggregate(rankingPipeline(k));
