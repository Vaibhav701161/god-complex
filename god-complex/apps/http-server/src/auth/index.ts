import { randomUUID } from "crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@god-complex/prisma";
import { authConfig } from "./config";
import { sendVerificationEmail } from "./email-provider";

console.log("[AUTH] Cookie Config:", {
    domain: process.env.NODE_ENV === "production" ? ".godcomplex.app" : "undefined (dev)",
    secure: process.env.NODE_ENV === "production",
    node_env: process.env.NODE_ENV
});

const socialProviders: Record<string, {
    clientId: string;
    clientSecret: string;
}> = {};
if (authConfig.oauth.google.enabled) {
    socialProviders.google = {
        clientId: authConfig.oauth.google.clientId!,
        clientSecret: authConfig.oauth.google.clientSecret!,
    };
    console.log("[AUTH] Google OAuth enabled");
}
else {
    console.log("[AUTH] Google OAuth disabled (no credentials configured)");
}
export const auth = betterAuth({
    secret: authConfig.secret,
    baseURL: authConfig.baseURL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    cookies: authConfig.session.cookieOptions,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            const { sendPasswordResetEmail } = await import("./email-provider");
            await sendPasswordResetEmail(user.email, url, user.name);
        },
    },
    emailVerification: {
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail(user.email, url, user.name);
        },
    },
    socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
    session: {
        expiresIn: authConfig.session.expiresIn,
        freshAge: authConfig.session.freshAge,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
    trustedOrigins: authConfig.trustedOrigins,
    rateLimit: {
        window: authConfig.rateLimit.window,
        max: authConfig.rateLimit.max,
    },
    advanced: {
        cookiePrefix: "better-auth",
        generateId: () => randomUUID(),
        crossSubDomainCookies: {
            enabled: true,
        },
        disableCSRFCheck: false,
    },
});
export type Auth = typeof auth;
