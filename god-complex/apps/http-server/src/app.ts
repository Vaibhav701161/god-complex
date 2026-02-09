import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import routes from "./routes";
import { auth } from "./auth";
import { authConfig } from "./auth/config";
const app = express();
app.use(cors({
    origin: authConfig.trustedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "God Complex API Server",
        version: "1.0.0"
    });
});
app.get("/api/auth/session", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session?.user) {
            return res.status(401).json({ user: null, session: null });
        }
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(session);
    }
    catch (error) {
        console.error("[AUTH] Session validation failed:", error);
        return res.status(401).json({ user: null, session: null });
    }
});
const authHandler = toNodeHandler(auth);
app.use("/api/auth", (req: Request, res: Response, next: NextFunction) => {
    console.log(`[AUTH] Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        authHandler(req, res).then(() => {
            console.log(`[AUTH] Request completed: ${req.method} ${req.originalUrl}`);
        }).catch((error: Error) => {
            console.error("[AUTH] Error handling auth request:", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal auth error" });
            }
        });
    }
    catch (error) {
        console.error("[AUTH] Sync error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal auth error" });
        }
    }
});
app.use(express.json());
app.use("/api", routes);
export default app;
