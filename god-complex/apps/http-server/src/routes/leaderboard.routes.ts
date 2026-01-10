import { Router } from "express";
import { getLeaderboard } from "../services/scoring.service";

const router = Router();

router.get("/:groupId/:month", async (req, res) => {
  const userId = "mock-user-id"; 
  const leaderboard = await getLeaderboard(
    req.params.groupId,
    req.params.month,
    userId
  );
  res.json(leaderboard);
});

export default router;