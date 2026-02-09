import { Request, Response, NextFunction } from "express";
export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
    if (process.env.ADMIN_ENABLED !== "true") {
        res.status(403).json({ error: "Admin access disabled" });
        return;
    }
    const key = req.headers["x-admin-key"];
    const secret = process.env.ADMIN_KEY;
    if (!secret || key !== secret) {
        res.sendStatus(403);
        return;
    }
    const identity = req.headers["x-admin-identity"];
    if (!identity || typeof identity !== 'string') {
        res.status(400).json({ error: "Missing x-admin-identity header" });
        return;
    }
    (req as any).adminIdentity = identity;
    next();
}
