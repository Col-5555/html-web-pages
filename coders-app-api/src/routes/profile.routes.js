import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
import { updateProfileSchema } from "../validators/profile.validators.js";
import * as profileController from "../controllers/profile.controller.js";

// Profile routes for coders and managers: fetch a profile, and update general
// info. Each route is guarded to the matching role; the controller additionally
// enforces that the token holder only touches their own profile.
const router = Router();

router.get(
  "/coders/:id/profile",
  authorize("Coder"),
  asyncHandler(profileController.getProfile("coder"))
);
router.patch(
  "/coders/:id/profile",
  authorize("Coder"),
  validate(updateProfileSchema),
  asyncHandler(profileController.updateProfile("coder"))
);

router.get(
  "/managers/:id/profile",
  authorize("Manager"),
  asyncHandler(profileController.getProfile("manager"))
);
router.patch(
  "/managers/:id/profile",
  authorize("Manager"),
  validate(updateProfileSchema),
  asyncHandler(profileController.updateProfile("manager"))
);

export default router;
