import { Router } from "express";
import { prisma } from "@god-complex/prisma";
import { autoFailOverduePenalties,getPenaltyConsequences } from "../services/penalty.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/my",
  requireAuth,
  async (req, res) => {
    const penalties = await prisma.penaltyAssignment.findMany({
      where: { userId: req.user!.id },
      orderBy: { dueDate: "asc" },
    });
    res.json(penalties);
  }
);

router.get(
  "/:groupId/:month",
  requireAuth,
  async (req, res) => {
    try {
      const { groupId, month } = req.params;

      // Validate month format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: "Invalid month format. Use YYYY-MM" });
      }

      // Verify user is a member of this group for the specified month
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId_month: {
            userId: req.user!.id,
            groupId,
            month,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group for the specified month" });
      }

      // Fetch penalties for this user, group, and month
      const penalties = await prisma.penaltyAssignment.findMany({
        where: {
          userId: req.user!.id,
          groupId,
          month,
        },
        orderBy: { dueDate: "asc" },
      });

      res.json(penalties);
    } catch (err) {
      console.error("Penalty fetch error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:penaltyId/complete",
  requireAuth,
  async (req, res) => {
    const penalty = await prisma.penaltyAssignment.findUnique({
      where: { id: req.params.penaltyId },
    });

    if (!penalty || penalty.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    if (penalty.status !== "PENDING") {
      return res.status(400).json({ error: "Penalty not active" });
    }

    await prisma.penaltyAssignment.update({
      where: { id: penalty.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        groupId: penalty.groupId,
        action: "PENALTY_COMPLETED",
        targetType: "PenaltyAssignment",
        targetId: penalty.id,
        source: "USER",
        changes: {
          penaltyType: penalty.penaltyType,
        },
      },
    });

    res.json({ message: "Penalty completed" });
  }
);

router.post(
  "/:penaltyId/appeal",
  requireAuth,
  async (req, res) => {
    try {
      const { reason } = req.body;

      // Validate appeal reason
      if (!reason || typeof reason !== 'string' || reason.trim().length < 20) {
        return res.status(400).json({ 
          error: "Appeal reason must be at least 20 characters" 
        });
      }

      if (reason.length > 500) {
        return res.status(400).json({ 
          error: "Appeal reason cannot exceed 500 characters" 
        });
      }

      // Fetch and validate penalty ownership
      const penalty = await prisma.penaltyAssignment.findUnique({
        where: { id: req.params.penaltyId },
      });

      if (!penalty) {
        return res.status(404).json({ error: "Penalty not found" });
      }

      if (penalty.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not allowed" });
      }

      // Check status is PENDING or FAILED
      if (penalty.status !== "PENDING" && penalty.status !== "FAILED") {
        return res.status(400).json({ 
          error: `Cannot appeal ${penalty.status} penalty. Only PENDING or FAILED penalties can be appealed.` 
        });
      }

      // Update penalty status to APPEALED
      const updatedPenalty = await prisma.penaltyAssignment.update({
        where: { id: penalty.id },
        data: {
          status: "APPEALED",
          appealReason: reason.trim(),
        },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          actorId: req.user!.id,
          groupId: penalty.groupId,
          action: "PENALTY_APPEALED",
          targetType: "PenaltyAssignment",
          targetId: penalty.id,
          source: "USER",
          changes: {
            penaltyType: penalty.penaltyType,
            appealReason: reason.trim(),
          },
        },
      });

      res.json(updatedPenalty);
    } catch (err) {
      console.error("Penalty appeal error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/consequences/:groupId",
  requireAuth,
  async (req, res) => {
    const data = await getPenaltyConsequences(
      req.user!.id,
      req.params.groupId
    );
    res.json(data);
  }
);



router.post("/internal/auto-fail", async (_, res) => {
  await autoFailOverduePenalties();
  res.sendStatus(200);
});

export default router;
