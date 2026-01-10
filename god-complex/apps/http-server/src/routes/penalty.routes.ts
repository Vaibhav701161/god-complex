import { Router } from "express";
import { prisma } from "@god-complex/prisma";
import { autoFailOverduePenalties } from "../services/penalty.service";

const router = Router();


router.get("/my", async (req, res) => {
  const userId = "mock-user-id";

  const penalties = await prisma.penaltyAssignment.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });

  res.json(penalties);
});


router.post("/:penaltyId/complete", async (req, res) => {
  const userId = "mock-user-id";
  const { penaltyId } = req.params;

  const penalty = await prisma.penaltyAssignment.findUnique({
    where: { id: penaltyId },
  });

  if (!penalty || penalty.userId !== userId) {
    return res.status(403).json({ error: "Not allowed" });
  }

  if (penalty.status !== "PENDING") {
    return res.status(400).json({ error: "Penalty not active" });
  }

  await prisma.penaltyAssignment.update({
    where: { id: penaltyId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  res.json({ message: "Penalty completed" });
});


router.post("/internal/auto-fail", async (_, res) => {
  await autoFailOverduePenalties();
  res.sendStatus(200);
});

export default router;
