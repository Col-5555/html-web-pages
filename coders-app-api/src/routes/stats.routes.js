import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
import { heatmapQuerySchema } from "../validators/stats.validators.js";
import * as statsController from "../controllers/stats.controller.js";

// System-statistics routes: solved-challenges, trending categories, and the
// heatmap (with an optional validated date-range filter). All are coders-only.
const router = Router();

router.get(
  "/stats/solved-challenges",
  authorize("Coder"),
  asyncHandler(statsController.getSolvedChallenges)
);
router.get(
  "/stats/trending-categories",
  authorize("Coder"),
  asyncHandler(statsController.getTrendingCategories)
);
router.get(
  "/stats/heatmap",
  authorize("Coder"),
  validate(heatmapQuerySchema, "query"),
  asyncHandler(statsController.getHeatmap)
);

export default router;
