"use client";
import { createAuthClient } from "better-auth/react";
const getApiUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!envUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return envUrl;
};
const loggingFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method || 'GET';
    const credentials = init?.credentials || 'include';
    console.log(`[AuthClient] ${method} ${url} (credentials: ${credentials})`);
    return fetch(input, init);
};
export const authClient = createAuthClient({
    baseURL: getApiUrl(),
    fetchOptions: {
        credentials: "include",
        fetch: loggingFetch,
    },
});
export const { signIn, signUp, signOut, useSession, getSession, } = authClient;
export async function getSessionWithRetry(maxAttempts = 3): Promise<any | null> {
    const delays = [300, 600, 1200];
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`[AuthClient] Session check attempt ${attempt}/${maxAttempts}`);
            const session = await authClient.getSession();
            if (session?.data) {
                console.log(`[AuthClient] ✓ Session retrieved successfully`);
                return session.data;
            }
            console.log(`[AuthClient] No session data returned`);
            if (attempt < maxAttempts) {
                const delay = delays[attempt - 1] || delays[delays.length - 1];
                console.log(`[AuthClient] Retrying after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        catch (error) {
            console.error(`[AuthClient] Session check attempt ${attempt} failed:`, error);
            if (attempt < maxAttempts) {
                const delay = delays[attempt - 1] || delays[delays.length - 1];
                console.log(`[AuthClient] Retrying after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error(`[AuthClient] ✗ Session check failed after ${maxAttempts} attempts`);
    return null;
}
export type Session = Awaited<ReturnType<typeof authClient.getSession>>["data"];
export type User = NonNullable<Session>["user"];
