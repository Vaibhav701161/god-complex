import { Router } from "express";
import { submitCheckin } from "../services/checkin.service";
import { requireAuth } from "../middleware/auth.middleware";
import { prisma } from "@god-complex/prisma";

const router = Router();

/**
 * Error messages that map to specific HTTP status codes:
 * - Temporal errors ("has passed", "future days") -> 403 Forbidden
 * - Validation errors ("all goals", "no goals", "failure reason", "already checked in") -> 400 Bad Request
 * - Other errors -> 500 Internal Server Error
 */
router.post(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      await submitCheckin(req.user!.id, req.body);
      res.sendStatus(201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const lowerMessage = message.toLowerCase();

      // Map known temporal errors to 403
      if (
        lowerMessage.includes("has passed") ||
        lowerMessage.includes("future days") ||
        lowerMessage.includes("window closed")
      ) {
        return res.status(403).json({ message });
      }

      // Map known validation errors to 400
      if (
        lowerMessage.includes("all goals must be checked in") ||
        lowerMessage.includes("no goals found") ||
        lowerMessage.includes("failure reason required") ||
        lowerMessage.includes("already been checked in") ||
        lowerMessage.includes("goal does not belong") ||
        lowerMessage.includes("group not found") ||
        lowerMessage.includes("not a member")
      ) {
        return res.status(400).json({ message });
      }

      // Unexpected errors - server issue
      console.error("Check-in submission error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);
router.get(
  "/status/:groupId/:date",
  requireAuth,
  async (req, res) => {
    const { groupId, date } = req.params;

    const results = await prisma.goal.findMany({
      where: {
        userId: req.user!.id,
        groupId,
        date: new Date(date),
      },
      include: { result: true },
    });

    res.json(
      results.map(g => ({
        goalId: g.id,
        status: g.result?.status ?? "NOT_CHECKED_IN",
        failureReason: g.result?.failureReason ?? null,
      }))
    );
  }
);



export default router;
