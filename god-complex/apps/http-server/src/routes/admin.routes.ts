
import { Router } from "express";
import { requireAdminKey } from "../middleware/admin.middleware";
import { finalizeDay } from "../services/daily.service";
import { closeMonth } from "../services/monthly.service";
import { prisma } from "@god-complex/prisma";

const router = Router();

router.use(requireAdminKey);

router.post("/daily/reconcile", async (req, res) => {
    try {
        const { groupId, date, reason } = req.body;
        const adminIdentity = (req as any).adminIdentity;

        if (!reason) {
            res.status(400).json({ error: "Reason is required for admin actions" });
            return;
        }

        // We pass audit context to service
        await finalizeDay(groupId, date, {
            source: "ADMIN",
            reason,
            correlationId: `ADMIN-${Date.now()}`
        });

        res.json({ success: true, message: "Finalization attempted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/monthly/close", async (req, res) => {
    try {
        const { groupId, month, reason } = req.body;
        const adminIdentity = (req as any).adminIdentity;

        if (!reason) {
            res.status(400).json({ error: "Reason is required" });
            return;
        }

        await closeMonth(groupId, month, {
            source: "ADMIN",
            reason,
            correlationId: `ADMIN-${Date.now()}`
        });
        res.json({ success: true, message: "Month closed" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/health/daily-finalization", async (req, res) => {
    // Check recent finalizations
    const recent = await prisma.dailyFinalization.findMany({
        take: 10,
        orderBy: { finalizedAt: 'desc' }
    });
    res.json(recent);
});

export default router;
