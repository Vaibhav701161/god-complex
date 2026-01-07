import { Router } from "express";
import {
  closeMonth,
  getMonthlyResult,
} from "../services/monthly.service";

const router = Router();

router.post("/close", async (req, res) => {
  await closeMonth(req.body.groupId, req.body.month);
  res.sendStatus(200);
});

router.get("/:groupId/:month", async (req, res) => {
  const result = await getMonthlyResult(
    req.params.groupId,
    req.params.month
  );
  res.json(result);
});

export default router;
