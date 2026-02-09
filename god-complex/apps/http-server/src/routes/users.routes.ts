import { Router } from "express";
import { getMe, completeApplication, getEmailVerificationStatus, resendVerificationEmail } from "../services/user.service";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.get("/me", requireAuth, async (req, res) => {
    try {
        console.log(`[USERS] GET /me - Fetching user: ${req.user!.id}`);
        const user = await getMe(req.user!.id);
        console.log(`[USERS] GET /me - User found: ${user.email}, applicationDone: ${user.applicationDone}`);
        res.json(user);
    }
    catch (error) {
        console.error("[USERS] GET /me - Error:", error);
        if (error instanceof Error && error.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Failed to get user" });
    }
});
router.get("/verification-status", requireAuth, async (req, res) => {
    try {
        const status = await getEmailVerificationStatus(req.user!.id);
        res.json(status);
    }
    catch (error) {
        console.error("Verification status error:", error);
        res.status(500).json({ error: "Failed to get verification status" });
    }
});
router.post("/resend-verification", requireAuth, async (req, res) => {
    try {
        const result = await resendVerificationEmail(req.user!.id);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }
        res.json({ success: true, message: "Verification email sent" });
    }
    catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ error: "Failed to resend verification email" });
    }
});
router.post("/complete-application", requireAuth, async (req, res) => {
    try {
        console.log(`[USERS] POST /complete-application - User: ${req.user!.id}`);
        const { displayName, motivation } = req.body;
        if (!displayName || typeof displayName !== "string") {
            return res.status(400).json({ error: "Display name is required" });
        }
        if (!motivation || typeof motivation !== "string") {
            return res.status(400).json({ error: "Motivation is required" });
        }
        const trimmedDisplayName = displayName.trim();
        const trimmedMotivation = motivation.trim();
        if (trimmedDisplayName.length < 2 || trimmedDisplayName.length > 50) {
            return res.status(400).json({ error: "Display name must be 2-50 characters" });
        }
        if (trimmedMotivation.length < 10 || trimmedMotivation.length > 500) {
            return res.status(400).json({ error: "Motivation must be 10-500 characters" });
        }
        const user = await completeApplication(req.user!.id, {
            displayName: trimmedDisplayName,
            motivation: trimmedMotivation,
        });
        console.log(`[USERS] POST /complete-application - Success: ${user.email}, applicationDone: ${user.applicationDone}`);
        res.json(user);
    }
    catch (error) {
        console.error("[USERS] POST /complete-application - Error:", error);
        res.status(500).json({ error: "Failed to complete application" });
    }
});
export default router;
