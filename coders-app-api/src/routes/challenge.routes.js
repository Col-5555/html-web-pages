import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
import {
  createChallengeSchema,
  listChallengesQuerySchema,
} from "../validators/challenge.validators.js";
import * as challengeController from "../controllers/challenge.controller.js";

// Content-management routes: challenges (create/list/by-id) plus the categories
// listing. Creation is Managers-only (the challenge is attributed to them);
// listing/reading is open to any authenticated user but role-aware in the service.
const router = Router();

router.post(
  "/challenges",
  authorize("Manager"),
  validate(createChallengeSchema),
  asyncHandler(challengeController.create)
);
router.get(
  "/challenges",
  authorize(),
  validate(listChallengesQuerySchema, "query"),
  asyncHandler(challengeController.list)
);
router.get("/challenges/:id", authorize(), asyncHandler(challengeController.getById));

router.get("/categories", authorize(), asyncHandler(challengeController.listCategories));

export default router;
