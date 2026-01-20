"use client";

import { useEffect, useState } from "react";
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

    useEffect(() => {
        let mounted = true;

        async function checkSession() {
            try {
                const session = await authClient.getSession();

                if (!mounted) return;

                if (session?.data?.user) {
                    setState({
                        user: session.data.user,
                        loading: false,
                        error: null,
                    });
                } else {
                    setState({
                        user: null,
                        loading: false,
                        error: null,
                    });
                }
            } catch (error) {
                if (!mounted) return;

                setState({
                    user: null,
                    loading: false,
                    error: "Failed to check session",
                });
            }
        }

        checkSession();

        return () => {
            mounted = false;
        };
    }, []);

    const logout = async () => {
        try {
            await authClient.signOut();
            setState({
                user: null,
                loading: false,
                error: null,
            });
            router.push("/signin");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return {
        user: state.user,
        loading: state.loading,
        error: state.error,
        logout,
        isAuthenticated: !!state.user,
    };
}
