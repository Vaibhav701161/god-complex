"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
interface AuthState {
    user: any | null;
    loading: boolean;
    error: string | null;
}
export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });
    const router = useRouter();
    const checkingRef = useRef(false);
    useEffect(() => {
        let mounted = true;
        async function checkSession() {
            if (checkingRef.current) {
                console.log("[useAuth] Already checking session, skipping");
                return;
            }
            checkingRef.current = true;
            console.log("[useAuth] Starting session check...");
            const maxRetries = 2;
            const retryDelays = [500, 1000];
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    console.log(`[useAuth] Attempt ${attempt}/${maxRetries}: Checking session via /api/auth/get-session`);
                    const apiURL = process.env.NEXT_PUBLIC_API_URL;
                    if (!apiURL) {
                        throw new Error("NEXT_PUBLIC_API_URL not defined");
                    }
                    const resp = await fetch(`${apiURL}/api/auth/get-session`, {
                        credentials: "include",
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    let session: any = null;
                    if (resp.ok) {
                        session = await resp.json();
                    }
                    else {
                        console.warn("[useAuth] Session endpoint returned non-200", resp.status);
                        if (resp.status === 401 || resp.status === 403) {
                            console.warn("[useAuth] Auth failure, not retrying");
                            if (mounted) {
                                setState({
                                    user: null,
                                    loading: false,
                                    error: null,
                                });
                            }
                            checkingRef.current = false;
                            return;
                        }
                    }
                    console.log("[useAuth] session response", resp.status, session);
                    if (!mounted)
                        return;
                    const sessionUser = session?.user || session?.data?.user;
                    if (sessionUser) {
                        console.log("[useAuth] ✓ Found user in session:", sessionUser.email, "ID:", sessionUser.id);
                        setState({
                            user: sessionUser,
                            loading: false,
                            error: null,
                        });
                        checkingRef.current = false;
                        return;
                    }
                    else {
                        console.warn("[useAuth] ✗ No session user returned, marking unauthenticated. Response:", session);
                        setState({
                            user: null,
                            loading: false,
                            error: null,
                        });
                        checkingRef.current = false;
                        return;
                    }
                }
                catch (error) {
                    if (!mounted)
                        return;
                    const isAbortError = (error as Error)?.name === "AbortError";
                    const isNetworkError = error instanceof TypeError || (error as Error)?.message?.includes("fetch");
                    if (isAbortError) {
                        console.error(`[useAuth] Session check timed out (attempt ${attempt}/${maxRetries})`);
                    }
                    else if (isNetworkError) {
                        console.error(`[useAuth] Network error (attempt ${attempt}/${maxRetries}):`, error);
                    }
                    else {
                        console.error(`[useAuth] Session check failed (attempt ${attempt}/${maxRetries}):`, error);
                    }
                    if (attempt < maxRetries && (isNetworkError || isAbortError)) {
                        const delay = retryDelays[attempt - 1];
                        console.log(`[useAuth] Retry ${attempt}/${maxRetries} after ${delay}ms`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    setState({
                        user: null,
                        loading: false,
                        error: isAbortError ? "timeout" : "Failed to check session",
                    });
                    checkingRef.current = false;
                    return;
                }
            }
            checkingRef.current = false;
        }
        checkSession();
        return () => {
            mounted = false;
        };
    }, []);
    const logout = useCallback(async () => {
        try {
            await authClient.signOut();
            setState({
                user: null,
                loading: false,
                error: null,
            });
            router.push("/signin");
        }
        catch (error) {
            console.error("Logout failed:", error);
        }
    }, [router]);
    return {
        user: state.user,
        loading: state.loading,
        error: state.error,
        logout,
        isAuthenticated: !!state.user,
    };
}
