import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import challengeRoutes from "./challenge.routes.js";
import submissionRoutes from "./submission.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";
import statsRoutes from "./stats.routes.js";

// Aggregates every domain router under the /api base path (mounted in app.js).
const router = Router();

router.use("/auth", authRoutes);
router.use("/", profileRoutes);
router.use("/", challengeRoutes);
router.use("/", submissionRoutes);
router.use("/", leaderboardRoutes);
router.use("/", statsRoutes);

export default router;
