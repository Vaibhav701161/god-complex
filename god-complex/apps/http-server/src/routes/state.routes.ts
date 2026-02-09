import { Router } from "express";
import { getDailyState } from "../services/state.service";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.get("/:groupId/:date", requireAuth, async (req, res) => {
    try {
        const { groupId, date } = req.params;
        const state = await getDailyState(groupId, date);
        res.json(state);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to get daily state"
        });
    }
});
export default router;
