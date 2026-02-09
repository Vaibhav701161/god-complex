import { Router } from "express";
import { getLeaderboard, getUserDailyHistory, getUserWeeklySummary, getIntegrityBreakdown, getWeeklyDiscomfortStatus, getExcuseStats, getExcuseRiskLevel, } from "../services/scoring.service";
import { getMonthlyResult } from "../services/monthly.service";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.get("/leaderboard/:groupId/:month", requireAuth, async (req, res) => {
    const leaderboard = await getLeaderboard(req.params.groupId, req.params.month, req.user!.id);
    res.json(leaderboard);
});
router.get("/monthly/:groupId/:month", requireAuth, async (req, res) => {
    const result = await getMonthlyResult(req.user!.id, req.params.groupId, req.params.month);
    res.json(result);
});
router.get("/:groupId/weekly-discomfort/:date", requireAuth, async (req, res) => {
    const status = await getWeeklyDiscomfortStatus(req.user!.id, req.params.groupId, req.params.date);
    res.json(status);
});
router.get("/:groupId/excuses", requireAuth, async (req, res) => {
    const stats = await getExcuseStats(req.user!.id, req.params.groupId);
    res.json(stats);
});
router.get("/:groupId/excuse-risk", requireAuth, async (req, res) => {
    const risk = await getExcuseRiskLevel(req.user!.id, req.params.groupId);
    res.json(risk);
});
router.get("/:groupId/daily/:date", requireAuth, async (req, res) => {
    const history = await getUserDailyHistory(req.user!.id, req.params.groupId, req.params.date);
    res.json(history);
});
router.get("/:groupId/weekly/:date", requireAuth, async (req, res) => {
    const summary = await getUserWeeklySummary(req.user!.id, req.params.groupId, req.params.date);
    res.json(summary);
});
router.get("/:groupId/integrity", requireAuth, async (req, res) => {
    const stats = await getIntegrityBreakdown(req.user!.id, req.params.groupId);
    res.json(stats);
});
export default router;
