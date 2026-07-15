import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { submissionSchema } from "../validators/submission.validators.js";
import * as submissionController from "../controllers/submission.controller.js";

// Grading route: post a code submission. The validator checks the submitted code
// before the (stubbed) grader is invoked.
const router = Router();

router.post(
  "/submissions",
  validate(submissionSchema),
  asyncHandler(submissionController.grade)
);

export default router;
