import { Router } from "express";
import {
  closeMonth,
  getMonthlyResult,
} from "../services/monthly.service";
import { getGroupMonthlyHistory } from "@/services/scoring.service";

const router = Router();

router.post("/close", async (req, res) => {
  await closeMonth(req.body.groupId, req.body.month);
  res.sendStatus(200);
});

router.get("/:groupId/:month", async (req, res) => {
  const userId = "mock-user-id";
  const result = await getMonthlyResult(
    userId,
    req.params.groupId,
    req.params.month
  );
  res.json(result);
});
router.get(
  "/:groupId/history/:month",
  async (req, res) => {
    const { groupId, month } = req.params;
    const history = await getGroupMonthlyHistory(groupId, month);
    res.json(history);
  }
);


export default router;
