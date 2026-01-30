"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";

// Membership structure from backend
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
}

export function useUser() {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const [state, setState] = useState<UserState>({
        user: null,
        loading: true,
        error: null,
    });
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        let mounted = true;

        async function fetchUser() {
            // Wait for auth check to complete
            if (authLoading) {
                return;
            }

            // If not authenticated, don't fetch
            if (!isAuthenticated) {
                if (mounted) {
                    setState({
                        user: null,
                        loading: false,
                        error: null,
                    });
                }
                return;
            }

            try {
                const response = await fetch("/api/users/me", {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!mounted) return;

                if (response.status === 401) {
                    // Session invalid - force logout
                    logout();
                    setState({
                        user: null,
                        loading: false,
                        error: "Session expired",
                    });
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }

                const userData = await response.json();

                setState({
                    user: userData,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                if (!mounted) return;

                setState({
                    user: null,
                    loading: false,
                    error: error instanceof Error ? error.message : "Failed to fetch user",
                });
            }
        }

        fetchUser();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, logout, refetchTrigger]);

    return {
        user: state.user,
        loading: state.loading || authLoading,
        error: state.error,
        refetch,
    };
}
