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

    res.json({ message: "Penalty completed" });
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
