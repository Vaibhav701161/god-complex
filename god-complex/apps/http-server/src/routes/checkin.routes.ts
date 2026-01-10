import { Router } from "express";
import { submitCheckin } from "../services/checkin.service";
import { requireAuth } from "../middleware/auth.middleware";
import { prisma } from "@god-complex/prisma";

const router = Router();

router.post(
  "/",
  requireAuth,
  async (req, res) => {
    await submitCheckin(req.user!.id, req.body);
    res.sendStatus(201);
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
