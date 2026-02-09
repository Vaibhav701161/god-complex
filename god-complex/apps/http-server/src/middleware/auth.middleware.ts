import { auth } from "../auth";
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { createAuthError } from "../auth/utils";
import { AuthErrorType } from "../auth/types";
import type { RequestUser } from "../auth/types";
declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
            sessionId?: string;
        }
    }
}
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session || !session.user) {
            const error = createAuthError(AuthErrorType.UNAUTHORIZED);
            return res.status(error.statusCode).json({
                error: error.message,
                type: error.type,
            });
        }
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            emailVerified: session.user.emailVerified,
        };
        req.sessionId = session.session.id;
        if (process.env.NODE_ENV === "development") {
            console.log(`[AUTH] Authenticated request: ${req.method} ${req.path} - User: ${session.user.email}`);
        }
        next();
    }
    catch (error) {
        console.error("[AUTH] Error validating session:", error);
        const authError = createAuthError(AuthErrorType.UNKNOWN);
        return res.status(authError.statusCode).json({
            error: authError.message,
            type: authError.type,
        });
    }
}
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (session?.user) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                emailVerified: session.user.emailVerified,
            };
            req.sessionId = session.session.id;
        }
        next();
    }
    catch (error) {
        console.warn("[AUTH] Optional auth check failed:", error);
        next();
    }
}
export async function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        const error = createAuthError(AuthErrorType.UNAUTHORIZED);
        return res.status(error.statusCode).json({
            error: error.message,
            type: error.type,
        });
    }
    if (!req.user.emailVerified) {
        const error = createAuthError(AuthErrorType.EMAIL_NOT_VERIFIED);
        return res.status(error.statusCode).json({
            error: error.message,
            type: error.type,
            redirectTo: "/verify-email",
        });
    }
    next();
}
export function authRequestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const userInfo = req.user ? `User: ${req.user.email}` : "Anonymous";
        console.log(`[AUTH LOG] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${userInfo}`);
    });
    next();
}
