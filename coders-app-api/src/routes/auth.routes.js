import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { authorize } from "../middlewares/authorize.js";
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

// Email verification: the link emailed on registration points here
// (GET /api/auth/verify?token=<jwt>). Returns an HTML page.
router.get("/verify", asyncHandler(authController.verify));

// Demonstration of the authorize(...roles) middleware guarding endpoints:
//   /me           — any authenticated user; echoes the injected req.user.
//   /managers-only — Managers only; a Coder's token gets a 403.
router.get(
  "/me",
  authorize(),
  asyncHandler(async (req, res) => res.json({ user: req.user }))
);
router.get(
  "/managers-only",
  authorize("Manager"),
  asyncHandler(async (req, res) =>
    res.json({ message: `Welcome, manager ${req.user.email}` })
  )
);

export default router;
