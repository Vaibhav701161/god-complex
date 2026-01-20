import { Router } from "express";
import { getMonthlyHistory } from "../services/history.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/history/:groupId/:month
 * 
 * Returns complete monthly history in a single batch query.
 * Replaces 31 individual daily requests.
 * 
 * Example: GET /api/history/group-123/2026-01
 */
router.get(
    "/:groupId/:month",
    requireAuth,
    async (req, res) => {
        try {
            const { groupId, month } = req.params;
            const history = await getMonthlyHistory(groupId, month);
            res.json(history);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Failed to fetch history"
            });
        }
    }
);

export default router;
