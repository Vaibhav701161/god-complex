"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
export interface UserMembership {
    groupId: string;
    month: string;
    group: {
        id: string;
        name: string;
        timezone: string;
        cutoffHour: number;
    };
}
interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    publicId?: string;
    applicationDone: boolean;
    displayName?: string;
    motivation?: string;
    createdAt: string;
    memberships?: UserMembership[];
}
interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
    staleUser: User | null;
    stale: boolean;
}
export function useUser() {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const [state, setState] = useState<UserState>({
        user: null,
        loading: true,
        error: null,
        staleUser: null,
        stale: false,
    });
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const refetch = useCallback((forceReset = false) => {
        if (forceReset) {
            setState(prev => ({ ...prev, user: null, loading: true, staleUser: prev.user, stale: true }));
        }
        setRefetchTrigger(prev => prev + 1);
    }, []);
    const mutate = useCallback((updater: Partial<User> | ((prev: User | null) => User | null)) => {
        setState(prev => {
            const newUser = typeof updater === 'function'
                ? updater(prev.user)
                : prev.user ? { ...prev.user, ...updater } : null;
            return { ...prev, user: newUser };
        });
    }, []);
    const invalidate = useCallback(() => {
        setState(prev => ({ ...prev, user: null, loading: true, staleUser: prev.user, stale: true }));
        setRefetchTrigger(prev => prev + 1);
    }, []);
    useEffect(() => {
        let mounted = true;
        async function fetchUser() {
            console.log("[useUser] fetchUser called - authLoading:", authLoading, "isAuthenticated:", isAuthenticated, "refetchTrigger:", refetchTrigger);
            if (authLoading) {
                console.log("[useUser] Waiting for auth to complete...");
                return;
            }
            if (!isAuthenticated) {
                console.log("[useUser] Not authenticated, clearing user state");
                if (mounted) {
                    setState({
                        user: null,
                        loading: false,
                        error: null,
                        staleUser: null,
                        stale: false,
                    });
                }
                return;
            }
            console.log("[useUser] Fetching user data from /api/users/me...");
            setState(prev => ({ ...prev, loading: true, staleUser: prev.user || prev.staleUser, stale: !!prev.user }));
            const maxRetries = 2;
            const delays = [500, 1000];
            let lastError: Error | null = null;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    console.log(`[useUser] Attempt ${attempt}/${maxRetries}: Fetching from /api/users/me`);
                    const response = await fetch("/api/users/me", {
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    if (!mounted)
                        return;
                    if (response.status === 401) {
                        console.log("[useUser] Unauthorized, clearing user state");
                        setState(prev => ({
                            user: null,
                            loading: false,
                            error: "Unauthorized",
                            staleUser: null,
                            stale: false,
                        }));
                        return;
                    }
                    if (response.status === 403 || response.status === 404 || response.status === 400) {
                        throw new Error(`Failed to fetch user data: ${response.status}`);
                    }
                    if (!response.ok) {
                        throw new Error("Failed to fetch user data");
                    }
                    const userData = await response.json();
                    console.log("[useUser] ✓ Fetched user:", userData.email, "applicationDone:", userData.applicationDone);
                    setState({
                        user: userData,
                        loading: false,
                        error: null,
                        staleUser: null,
                        stale: false,
                    });
                    return;
                }
                catch (error) {
                    if (!mounted)
                        return;
                    lastError = error instanceof Error ? error : new Error("Failed to fetch user");
                    const isAbortError = error instanceof Error && error.name === 'AbortError';
                    const isNetworkError = error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'));
                    if ((isAbortError || isNetworkError) && attempt < maxRetries) {
                        const delay = delays[attempt - 1] || delays[delays.length - 1];
                        console.log(`[useUser] Retry ${attempt}/${maxRetries} after ${delay}ms (${lastError.message})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    console.error("[useUser] fetchUser error after retries:", lastError);
                    setState(prev => ({
                        user: prev.staleUser,
                        loading: false,
                        error: lastError?.message || "Failed to fetch user",
                        staleUser: prev.staleUser,
                        stale: !!prev.staleUser,
                    }));
                    return;
                }
            }
        }
        fetchUser();
        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, refetchTrigger]);
    return {
        user: state.user,
        staleUser: state.staleUser,
        loading: state.loading,
        error: state.error,
        stale: state.stale,
        refetch,
        mutate,
        invalidate,
    };
}
