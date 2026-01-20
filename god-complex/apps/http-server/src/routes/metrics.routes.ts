import { Router } from "express";
import { getDashboardMetrics } from "../services/metrics.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/metrics/:groupId
 * 
 * Returns all dashboard metrics computed backend-side.
 * Ensures single source of truth for formulas.
 */
router.get(
    "/:groupId",
    requireAuth,
    async (req, res) => {
        try {
            const { groupId } = req.params;
            // req.user is populated by requireAuth
            const userId = (req as any).user.id;

            const metrics = await getDashboardMetrics(groupId, userId);
            res.json(metrics);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Failed to fetch metrics"
            });
        }
    }
);

export default router;
