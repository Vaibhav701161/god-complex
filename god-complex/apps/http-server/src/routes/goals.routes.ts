import { Router } from "express";
import {
  submitDailyGoals,
  getDailyGoals,
} from "../services/goal.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * Error messages that map to specific HTTP status codes:
 * - "cutoff" -> 403 Forbidden (time-based restriction)
 * - "already submitted" -> 400 Bad Request (duplicate submission)
 * - "uncomfortable" -> 400 Bad Request (validation: discomfort requirement)
 * - "at least one goal" -> 400 Bad Request (validation: empty goals)
 * - Other errors -> 500 Internal Server Error
 */
router.post(
  "/submit",
  requireAuth,
  async (req, res) => {
    try {
      await submitDailyGoals(req.user!.id, req.body);
      res.sendStatus(201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const lowerMessage = message.toLowerCase();

      // Map known validation errors to appropriate HTTP status codes
      if (lowerMessage.includes("cutoff")) {
        // Time-based restriction - user missed the window
        return res.status(403).json({ message });
      }

      if (
        lowerMessage.includes("already submitted") ||
        lowerMessage.includes("uncomfortable") ||
        lowerMessage.includes("at least one goal") ||
        lowerMessage.includes("group not found") ||
        lowerMessage.includes("not a member")
      ) {
        // Validation errors - client can fix these
        return res.status(400).json({ message });
      }

      // Unexpected errors - server issue
      console.error("Goal submission error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/:groupId/:date",
  requireAuth,
  async (req, res) => {
    try {
      const goals = await getDailyGoals(
        req.params.groupId,
        req.params.date
      );
      res.json(goals);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  }
);

export default router;
