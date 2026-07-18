import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
import { uploadMiddleware } from "../middlewares/upload.js";
import {
  updateProfileSchema,
  updateCoderProfileSchema,
} from "../validators/profile.validators.js";
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
// Coder profile update accepts multipart/form-data: an optional `avatar` image
// file (Multer → req.file, uploaded to Supabase) plus the text fields. Multer
// must run before validation so the text fields are populated on req.body.
router.patch(
  "/coders/:id/profile",
  authorize("Coder"),
  uploadMiddleware.single("avatar"),
  validate(updateCoderProfileSchema),
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
