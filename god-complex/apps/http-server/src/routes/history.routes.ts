import { Router } from "express";
import { getMonthlyHistory } from "../services/history.service";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.get("/:groupId/:month", requireAuth, async (req, res) => {
    try {
        const { groupId, month } = req.params;
        const history = await getMonthlyHistory(groupId, month);
        res.json(history);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to fetch history"
        });
    }
});
export default router;
