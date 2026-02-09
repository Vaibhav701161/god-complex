import { randomBytes } from "crypto";
import { AuthError, AuthErrorType } from "./types";
export function generateToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
}
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
}
export function calculateExpiry(durationSeconds: number): Date {
    return new Date(Date.now() + durationSeconds * 1000);
}
export function createAuthError(type: AuthErrorType, message?: string): AuthError {
    const errorMap: Record<AuthErrorType, {
        message: string;
        statusCode: number;
    }> = {
        [AuthErrorType.UNAUTHORIZED]: {
            message: "You must be logged in to access this resource",
            statusCode: 401,
        },
        [AuthErrorType.INVALID_CREDENTIALS]: {
            message: "Invalid email or password",
            statusCode: 401,
        },
        [AuthErrorType.EMAIL_NOT_VERIFIED]: {
            message: "Please verify your email address before continuing",
            statusCode: 403,
        },
        [AuthErrorType.USER_NOT_FOUND]: {
            message: "User not found",
            statusCode: 404,
        },
        [AuthErrorType.SESSION_EXPIRED]: {
            message: "Your session has expired. Please sign in again",
            statusCode: 401,
        },
        [AuthErrorType.INVALID_TOKEN]: {
            message: "Invalid or expired token",
            statusCode: 400,
        },
        [AuthErrorType.RATE_LIMITED]: {
            message: "Too many requests. Please try again later",
            statusCode: 429,
        },
        [AuthErrorType.NETWORK_ERROR]: {
            message: "Network error. Please check your connection",
            statusCode: 503,
        },
        [AuthErrorType.UNKNOWN]: {
            message: "An unexpected error occurred",
            statusCode: 500,
        },
    };
    const defaults = errorMap[type];
    return {
        type,
        message: message || defaults.message,
        statusCode: defaults.statusCode,
    };
}
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
export function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, "password"> {
    const { password, ...safeUser } = user as T & {
        password?: unknown;
    };
    return safeUser as Omit<T, "password">;
}
export function extractSessionToken(cookieHeader?: string): string | null {
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, string>);
    return cookies["better-auth.session_token"] || null;
}
export function getClientIP(req: {
    headers: Record<string, string | string[] | undefined>;
    ip?: string;
    socket?: {
        remoteAddress?: string;
    };
}): string {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (forwardedFor) {
        const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
        return ips?.split(",")[0]?.trim() || "unknown";
    }
    return req.ip || req.socket?.remoteAddress || "unknown";
}
export function getUserAgent(req: {
    headers: Record<string, string | string[] | undefined>;
}): string {
    const ua = req.headers["user-agent"];
    return (Array.isArray(ua) ? ua[0] : ua) || "unknown";
}
export function maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain)
        return email;
    const maskedLocal = localPart.length <= 2
        ? localPart[0] + "***"
        : localPart[0] + "***" + localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
}
