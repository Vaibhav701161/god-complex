import { Router } from "express";

import userRoutes from "./users.routes";
import groupRoutes from "./groups.routes";
import goalRoutes from "./goals.routes";
import leaderboardRoutes from "./leaderboard.routes";
import checkinRoutes from "./checkin.routes";
import monthlyRoutes from "./monthly.routes";
import historyRoutes from "./history.routes";
import stateRoutes from "./state.routes";
import metricsRoutes from "./metrics.routes";
import healthRoutes from "./health.routes";

import adminRoutes from "./admin.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/groups", groupRoutes);
router.use("/daily-goals", goalRoutes);
router.use("/daily-checkin", checkinRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/monthly", monthlyRoutes);
router.use("/history", historyRoutes);
router.use("/state", stateRoutes);
router.use("/metrics", metricsRoutes);
router.use("/health", healthRoutes);
router.use("/admin", adminRoutes);

export default router;