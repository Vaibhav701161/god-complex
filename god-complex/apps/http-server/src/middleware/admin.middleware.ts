
import { Request, Response, NextFunction } from "express";

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
    // 1. Feature Flag
    if (process.env.ADMIN_ENABLED !== "true") {
        res.status(403).json({ error: "Admin access disabled" });
        return;
    }

    // 2. Secret Verification
    const key = req.headers["x-admin-key"];
    const secret = process.env.ADMIN_KEY;

    if (!secret || key !== secret) {
        res.sendStatus(403);
        return;
    }

    // 3. Identity Requirement
    const identity = req.headers["x-admin-identity"];
    if (!identity || typeof identity !== 'string') {
        res.status(400).json({ error: "Missing x-admin-identity header" });
        return;
    }

    // Attach to request for use in routes
    (req as any).adminIdentity = identity;

    next();
}
