import {Router} from "express";

import userRoutes from "./users.routes";
import groupRoutes from "./groups.routes";
import goalRoutes from "./goals.routes";
import leaderboardRoutes from "./leaderboard.routes";
import checkinRoutes from "./checkin.routes";
import monthlyRoutes from "./monthly.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/groups", groupRoutes);
router.use("/daily-goals", goalRoutes);
router.use("/daily-checkin", checkinRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/monthly", monthlyRoutes);

export default router;