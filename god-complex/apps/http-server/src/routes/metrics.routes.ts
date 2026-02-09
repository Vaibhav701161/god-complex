import { Router } from "express";
import { getDashboardMetrics } from "../services/metrics.service";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.get("/:groupId", requireAuth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = (req as any).user.id;
        const metrics = await getDashboardMetrics(groupId, userId);
        res.json(metrics);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to fetch metrics"
        });
    }
});
export default router;
