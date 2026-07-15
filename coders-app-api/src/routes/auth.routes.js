import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../validators/auth.validators.js";
import * as authController from "../controllers/auth.controller.js";

// Authentication routes for both user types. Registration runs the Joi validator
// middleware; login validates inside its controller (per the brief).
const router = Router();

router.post(
  "/coders/register",
  validate(registerSchema),
  asyncHandler(authController.register("coder"))
);
router.post(
  "/managers/register",
  validate(registerSchema),
  asyncHandler(authController.register("manager"))
);

router.post("/coders/login", asyncHandler(authController.login("coder")));
router.post("/managers/login", asyncHandler(authController.login("manager")));

export default router;
