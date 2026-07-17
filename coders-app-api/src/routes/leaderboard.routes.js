import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
import { topKQuerySchema } from "../validators/leaderboard.validators.js";
import * as leaderboardController from "../controllers/leaderboard.controller.js";

// Leaderboard routes: the full ranking, and the top-k coders (k validated). Only
// coders may see the leaderboard.
const router = Router();

// Declared before "/leaderboard" so the literal path matches first.
router.get(
  "/leaderboard/top",
  authorize("Coder"),
  validate(topKQuerySchema, "query"),
  asyncHandler(leaderboardController.getTop)
);
router.get(
  "/leaderboard",
  authorize("Coder"),
  asyncHandler(leaderboardController.getLeaderboard)
);

export default router;
