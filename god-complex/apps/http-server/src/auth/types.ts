import type { User as PrismaUser, Session as PrismaSession } from "@god-complex/prisma";
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthSession {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface SessionData {
    session: AuthSession;
    user: AuthUser;
}
export interface RequestUser {
    id: string;
    email?: string;
    name?: string;
    emailVerified?: boolean;
}
export interface AuthResponse {
    success: boolean;
    user?: AuthUser;
    session?: AuthSession;
    error?: string;
    redirectTo?: string;
}
export interface EmailVerificationStatus {
    verified: boolean;
    email: string;
    canResend: boolean;
    lastSentAt?: Date;
}
export interface FullUser extends AuthUser {
    publicId?: string | null;
    applicationDone: boolean;
    displayName?: string | null;
    motivation?: string | null;
}
export interface ApplicationData {
    displayName: string;
    motivation: string;
}
export type OAuthProvider = "google" | "github" | "discord";
export interface SignUpData {
    email: string;
    password: string;
    name: string;
}
export interface SignInData {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export enum AuthErrorType {
    UNAUTHORIZED = "UNAUTHORIZED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    SESSION_EXPIRED = "SESSION_EXPIRED",
    INVALID_TOKEN = "INVALID_TOKEN",
    RATE_LIMITED = "RATE_LIMITED",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNKNOWN = "UNKNOWN"
}
export interface AuthError {
    type: AuthErrorType;
    message: string;
    statusCode: number;
}
