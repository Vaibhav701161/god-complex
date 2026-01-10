import { Router } from "express";
import {
  createGroup,
  joinGroup,
  lockGroup,
  getGroup,
} from "../services/group.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  async (req, res) => {
    const group = await createGroup(req.user!.id, req.body);
    res.json(group);
  }
);

router.post(
  "/:groupId/join",
  requireAuth,
  async (req, res) => {
    await joinGroup(req.user!.id, req.params.groupId);
    res.sendStatus(200);
  }
);

router.post(
  "/:groupId/lock",
  requireAuth,
  async (req, res) => {
    await lockGroup(req.params.groupId);
    res.sendStatus(200);
  }
);

router.get(
  "/:groupId",
  requireAuth,
  async (req, res) => {
    const group = await getGroup(req.params.groupId);
    res.json(group);
  }
);

export default router;
