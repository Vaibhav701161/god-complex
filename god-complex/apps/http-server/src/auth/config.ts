function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        console.error(`FATAL: ${name} environment variable is missing or empty.`);
        if (name === "BETTER_AUTH_SECRET") {
            console.error("Generate one using: openssl rand -hex 32");
        }
        process.exit(1);
    }
    return value;
}
function optionalEnv(name: string, defaultValue?: string): string | undefined {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        return defaultValue;
    }
    return value;
}
function parseTrustedOrigins(): string[] {
    const originsString = process.env.TRUSTED_ORIGINS || "http://localhost:3000,http://localhost:4000";
    return originsString.split(",").map((origin) => origin.trim()).filter(Boolean);
}
export const authConfig = {
    secret: requireEnv("BETTER_AUTH_SECRET"),
    baseURL: requireEnv("BETTER_AUTH_URL"),
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        freshAge: 60 * 60 * 24,
        cookieName: "better-auth.session_token",
        cookieOptions: {
            httpOnly: true,
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        },
    },
    oauth: {
        google: {
            clientId: optionalEnv("GOOGLE_CLIENT_ID"),
            clientSecret: optionalEnv("GOOGLE_CLIENT_SECRET"),
            enabled: Boolean(optionalEnv("GOOGLE_CLIENT_ID") && optionalEnv("GOOGLE_CLIENT_SECRET")),
        },
    },
    email: {
        provider: optionalEnv("EMAIL_PROVIDER", "console") as "console" | "resend" | "sendgrid",
        from: optionalEnv("EMAIL_FROM", "noreply@godcomplex.local"),
        resendApiKey: optionalEnv("RESEND_API_KEY"),
    },
    trustedOrigins: parseTrustedOrigins(),
    rateLimit: {
        window: 60,
        max: 10,
    },
} as const;
if (process.env.NODE_ENV === "development") {
    console.log("[AUTH CONFIG] Loaded configuration:");
    console.log(`  - Base URL: ${authConfig.baseURL}`);
    console.log(`  - Session expires in: ${authConfig.session.expiresIn / 60 / 60 / 24} days`);
    console.log(`  - Google OAuth: ${authConfig.oauth.google.enabled ? "enabled" : "disabled"}`);
    console.log(`  - Email provider: ${authConfig.email.provider}`);
    console.log(`  - Trusted origins: ${authConfig.trustedOrigins.join(", ")}`);
}
