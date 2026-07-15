import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { heatmapQuerySchema } from "../validators/stats.validators.js";
import * as statsController from "../controllers/stats.controller.js";

// System-statistics routes: solved-challenges, trending categories, and the
// heatmap (with an optional validated date-range filter).
const router = Router();

router.get("/stats/solved-challenges", asyncHandler(statsController.getSolvedChallenges));
router.get("/stats/trending-categories", asyncHandler(statsController.getTrendingCategories));
router.get(
  "/stats/heatmap",
  validate(heatmapQuerySchema, "query"),
  asyncHandler(statsController.getHeatmap)
);

export default router;
