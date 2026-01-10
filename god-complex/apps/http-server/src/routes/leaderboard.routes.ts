import { request, Router } from "express";
import { getLeaderboard, getUserDailyHistory, getUserWeeklySummary } from "../services/scoring.service";
import { getMonthlyResult } from "../services/monthly.service";
import { getWeeklyDiscomfortStatus } from "../services/scoring.service";
import { getExcuseStats } from "../services/scoring.service";
import { GoalCategory } from "../../../../packages/prisma/generated/prisma/enums";

const router = Router();


router.get("/leaderboard/:groupId/:month", async (req, res) => {
  const userId = "mock-user-id";
  const leaderboard = await getLeaderboard(
    req.params.groupId,
    req.params.month,
    userId
  );
  res.json(leaderboard);
});


router.get("/monthly/:groupId/:month", async (req, res) => {
  const userId = "mock-user-id"; 
  const result = await getMonthlyResult(
    userId,
    req.params.groupId,
    req.params.month
  );
  res.json(result);
});

router.get(
    "/:groupId/weekly-discomfort/:date",
    async (req,res) => {
        const userId = "user";
        const {groupId,date} = request.params;

        const status = await getWeeklyDiscomfortStatus(
            userId,
            groupId,
            date,
        );
        res.json(status);
    }
);

router.get("/:groupId/excuses", async (req,res)=>{
    const userId = "mock-user-id";
    const stats = await getExcuseStats(userId, req.params.groupId);
    res.json(stats);
});

router.get(
    "/:groupId/daily/:date",
    async (req,res)=>{
        const userId = "mock user";
        const {groupId,date} = req.params;

        const history = await getUserDailyHistory(
            userId,
            groupId,
            date
        );

        res.json(history);
    }
);

router.get(
    "/:groupId/weekly/:date",
    async(req,res) => {
        const userId = "mock-user-id";
        const {groupId,date} = req.params;

        const summary = await getUserWeeklySummary(
            userId,
            groupId,
            date
        );

        res.json(summary);
    }
);



export default router;