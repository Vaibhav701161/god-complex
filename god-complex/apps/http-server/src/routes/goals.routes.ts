import { Router } from "express";
import { submitDailyGoals, getDailyGoals, } from "../services/goal.service";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.post("/submit", requireAuth, async (req, res) => {
    try {
        await submitDailyGoals(req.user!.id, req.body);
        res.sendStatus(201);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("cutoff")) {
            return res.status(403).json({ message });
        }
        if (lowerMessage.includes("already submitted") ||
            lowerMessage.includes("uncomfortable") ||
            lowerMessage.includes("at least one goal") ||
            lowerMessage.includes("group not found") ||
            lowerMessage.includes("not a member")) {
            return res.status(400).json({ message });
        }
        console.error("Goal submission error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/:groupId/:date", requireAuth, async (req, res) => {
    try {
        const goals = await getDailyGoals(req.params.groupId, req.params.date);
        res.json(goals);
    }
    catch (error) {
        console.error("Get goals error:", error);
        res.status(500).json({ message: "Failed to fetch goals" });
    }
});
export default router;
