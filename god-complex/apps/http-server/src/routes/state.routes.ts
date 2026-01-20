import { Router } from "express";
import { getDailyState } from "../services/state.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/state/:groupId/:date
 * 
 * Returns backend-derived system state for a given date.
 * Frontend should use this instead of computing time-based logic.
 * 
 * Example: GET /api/state/group-123/2026-01-20
 */
router.get(
    "/:groupId/:date",
    requireAuth,
    async (req, res) => {
        try {
            const { groupId, date } = req.params;
            const state = await getDailyState(groupId, date);
            res.json(state);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Failed to get daily state"
            });
        }
    }
);

export default router;
