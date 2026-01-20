"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

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
                const response = await fetch("http://localhost:4000/api/users/me", {
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
    }, [isAuthenticated, authLoading, logout]);

    return {
        user: state.user,
        loading: state.loading || authLoading,
        error: state.error,
    };
}
