import { Router } from "express";
import {
  createGroup,
  joinGroup,
  lockGroup,
  getGroup,
} from "../services/group.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * Error messages that map to specific HTTP status codes:
 * - Validation errors (name length, invalid timezone, etc.) -> 400 Bad Request
 * - Duplicate membership -> 400 Bad Request
 * - Other errors -> 500 Internal Server Error
 */
router.post(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const group = await createGroup(req.user!.id, req.body);
      res.status(201).json(group);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const lowerMessage = message.toLowerCase();

      // Map known validation errors to 400
      if (
        lowerMessage.includes("name") ||
        lowerMessage.includes("timezone") ||
        lowerMessage.includes("cutoff") ||
        lowerMessage.includes("pledge") ||
        lowerMessage.includes("validation") ||
        lowerMessage.includes("required")
      ) {
        return res.status(400).json({ message });
      }

      // Unexpected errors - server issue
      console.error("Group creation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Error messages that map to specific HTTP status codes:
 * - "Group not found" -> 404 Not Found
 * - "failed penalties", "penalty" -> 403 Forbidden
 * - "already member", "duplicate" -> 400 Bad Request
 * - Other errors -> 500 Internal Server Error
 */
router.post(
  "/:groupId/join",
  requireAuth,
  async (req, res) => {
    try {
      await joinGroup(req.user!.id, req.params.groupId);
      res.sendStatus(200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const lowerMessage = message.toLowerCase();

      // Map known errors to appropriate status codes
      if (lowerMessage.includes("not found")) {
        return res.status(404).json({ message });
      }

      if (
        lowerMessage.includes("failed penalties") ||
        lowerMessage.includes("penalty") ||
        lowerMessage.includes("outstanding")
      ) {
        return res.status(403).json({ message });
      }

      if (
        lowerMessage.includes("already member") ||
        lowerMessage.includes("duplicate") ||
        lowerMessage.includes("already has membership")
      ) {
        return res.status(400).json({ message });
      }

      // Unexpected errors - server issue
      console.error("Group join error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
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
    try {
      const group = await getGroup(req.params.groupId);
      res.json(group);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const lowerMessage = message.toLowerCase();

      // Map known errors to appropriate status codes
      if (lowerMessage.includes("not found")) {
        return res.status(404).json({ message });
      }

      // Unexpected errors - server issue
      console.error("Group fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
