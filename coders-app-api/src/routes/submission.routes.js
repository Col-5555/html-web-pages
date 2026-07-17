import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
import { submissionSchema } from "../validators/submission.validators.js";
import * as submissionController from "../controllers/submission.controller.js";

// Grading route: post a code submission. Only coders may submit; the validator
// checks the body before the grader invokes the external code runner.
const router = Router();

router.post(
  "/submissions",
  authorize("Coder"),
  validate(submissionSchema),
  asyncHandler(submissionController.grade)
);

export default router;
