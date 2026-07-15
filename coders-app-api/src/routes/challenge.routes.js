import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import {
  createChallengeSchema,
  listChallengesQuerySchema,
} from "../validators/challenge.validators.js";
import * as challengeController from "../controllers/challenge.controller.js";

// Content-management routes: challenges CRUD-ish (create/list/by-id) plus the
// categories listing. Mounted at the /api root so paths read as /api/challenges
// and /api/categories.
const router = Router();

router.post(
  "/challenges",
  validate(createChallengeSchema),
  asyncHandler(challengeController.create)
);
router.get(
  "/challenges",
  validate(listChallengesQuerySchema, "query"),
  asyncHandler(challengeController.list)
);
router.get("/challenges/:id", asyncHandler(challengeController.getById));

router.get("/categories", asyncHandler(challengeController.listCategories));

export default router;
