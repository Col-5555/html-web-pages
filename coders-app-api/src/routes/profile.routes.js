import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/profile.validators.js";
import * as profileController from "../controllers/profile.controller.js";

// Profile routes for coders and managers: fetch a profile, and update general
// info. The same handlers serve both roles, bound per route.
const router = Router();

router.get("/coders/:id/profile", asyncHandler(profileController.getProfile("coder")));
router.patch(
  "/coders/:id/profile",
  validate(updateProfileSchema),
  asyncHandler(profileController.updateProfile("coder"))
);

router.get("/managers/:id/profile", asyncHandler(profileController.getProfile("manager")));
router.patch(
  "/managers/:id/profile",
  validate(updateProfileSchema),
  asyncHandler(profileController.updateProfile("manager"))
);

export default router;
