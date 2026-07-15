import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";

// Aggregates every domain router under the /api base path (mounted in app.js).
// Content, submissions, leaderboard and stats routers are added in later phases.
const router = Router();

router.use("/auth", authRoutes);
router.use("/", profileRoutes);

export default router;
