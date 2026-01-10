import { Router } from "express";
import {
  submitDailyGoals,
  getDailyGoals,
} from "../services/goal.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/submit",
  requireAuth,
  async (req, res) => {
    await submitDailyGoals(req.user!.id, req.body);
    res.sendStatus(201);
  }
);

router.get(
  "/:groupId/:date",
  requireAuth,
  async (req, res) => {
    const goals = await getDailyGoals(
      req.params.groupId,
      req.params.date
    );
    res.json(goals);
  }
);

export default router;
