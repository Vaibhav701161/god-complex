"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser } from "./useUser";

interface DashboardContextValue {
    groupId: string | null;
    currentDate: string; // YYYY-MM-DD
    currentMonth: string; // YYYY-MM
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, loading: userLoading, error: userError } = useUser();
    const [groupId, setGroupId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Compute current date/month (client-side, will need timezone handling later)
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = currentDate.slice(0, 7); // YYYY-MM

    useEffect(() => {
        if (!user) {
            setGroupId(null);
            setError(null);
            return;
        }

        // Extract groupId with explicit validation
        const userWithMemberships = user as any; // Type assertion needed until we update User interface

        // INVARIANT 1: Memberships must exist
        if (!userWithMemberships.memberships) {
            const errorMsg = "INVARIANT_VIOLATION: User has no memberships array";
            console.error(errorMsg, user);
            setError(errorMsg);
            setGroupId(null);
            return;
        }

        const activeMemberships = userWithMemberships.memberships;

        // INVARIANT 2: User must have at least one active membership
        if (activeMemberships.length === 0) {
            setGroupId(null);
            setError("No active group membership found for current month");
            return;
        }

        // MULTI-GROUP DETECTION: Explicit warning if >1 group
        if (activeMemberships.length > 1) {
            console.warn(
                `⚠️  MULTI_GROUP_DETECTED: User has ${activeMemberships.length} active groups for ${currentMonth}.`,
                'Groups:', activeMemberships.map((m: any) => ({
                    groupId: m.groupId,
                    groupName: m.group?.name || 'Unknown'
                })),
                'Using first group. Implement group selector UI to allow user choice.'
            );
        }

        // Take first membership (explicit, not silent)
        const activeGroupId = activeMemberships[0].groupId;

        if (!activeGroupId) {
            setError("INVALID_STATE: groupId is null in membership");
            setGroupId(null);
            return;
        }

        setGroupId(activeGroupId);
        setError(null);
    }, [user, refetchTrigger, currentMonth]);

    const refetch = () => setRefetchTrigger(prev => prev + 1);

    return (
        <DashboardContext.Provider
            value={{
                groupId,
                currentDate,
                currentMonth,
                loading: userLoading,
                error: error || userError,
                refetch,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboardContext must be used within DashboardProvider");
    }
    return context;
}
