import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import challengeRoutes from "./challenge.routes.js";
import submissionRoutes from "./submission.routes.js";

// Aggregates every domain router under the /api base path (mounted in app.js).
// Leaderboard and stats routers are added in the final phase.
const router = Router();

router.use("/auth", authRoutes);
router.use("/", profileRoutes);
router.use("/", challengeRoutes);
router.use("/", submissionRoutes);

export default router;
