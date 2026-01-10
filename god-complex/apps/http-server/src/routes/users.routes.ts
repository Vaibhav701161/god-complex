import { Router } from "express";
import { getMe } from "../services/user.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    const user = await getMe(req.user!.id);
    res.json(user);
  }
);

export default router;
