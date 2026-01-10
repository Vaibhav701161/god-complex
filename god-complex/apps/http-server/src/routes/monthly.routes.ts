import { Router } from "express";
import {
  closeMonth,
  getMonthlyResult,
} from "../services/monthly.service";
import { getGroupMonthlyHistory , getCurrentMonthProjection} from "../services/scoring.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/close",
  async (req, res) => {
   
    await closeMonth(req.body.groupId, req.body.month);
    res.sendStatus(200);
  }
);
router.get(
  "/:groupId/projection",
  requireAuth,
  async (req, res) => {
    const projection = await getCurrentMonthProjection(
      req.user!.id,
      req.params.groupId
    );
    res.json(projection);
  }
);


router.get(
  "/:groupId/:month",
  requireAuth,
  async (req, res) => {
    const result = await getMonthlyResult(
      req.user!.id,
      req.params.groupId,
      req.params.month
    );
    res.json(result);
  }
);

router.get(
  "/:groupId/history/:month",
  requireAuth,
  async (req, res) => {
    const history = await getGroupMonthlyHistory(
      req.params.groupId,
      req.params.month
    );
    res.json(history);
  }
);

export default router;
