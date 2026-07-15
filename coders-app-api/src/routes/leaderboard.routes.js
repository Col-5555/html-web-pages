import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { topKQuerySchema } from "../validators/leaderboard.validators.js";
import * as leaderboardController from "../controllers/leaderboard.controller.js";

// Leaderboard routes: the full ranking, and the top-k coders (k validated).
const router = Router();

// Declared before "/leaderboard" so the literal path matches first.
router.get(
  "/leaderboard/top",
  validate(topKQuerySchema, "query"),
  asyncHandler(leaderboardController.getTop)
);
router.get("/leaderboard", asyncHandler(leaderboardController.getLeaderboard));

export default router;
