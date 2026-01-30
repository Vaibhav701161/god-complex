"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useUser, UserMembership } from "./useUser";

const SELECTED_GROUP_KEY = "god_complex_selected_group";

interface AvailableGroup {
    id: string;
    name: string;
    timezone: string;
    cutoffHour: number;
}

interface DashboardContextValue {
    groupId: string | null;
    currentDate: string; // YYYY-MM-DD
    currentMonth: string; // YYYY-MM
    loading: boolean;
    error: string | null;
    refetch: () => void;
    // Multi-group support
    availableGroups: AvailableGroup[];
    selectedGroupId: string | null;
    selectGroup: (groupId: string) => void;
    requiresSelection: boolean; // True when user has >1 group and none selected
    hasNoGroups: boolean; // True when user has 0 groups
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUser();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [initialized, setInitialized] = useState(false);

    // Compute current date/month (client-side, will need timezone handling later)
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = currentDate.slice(0, 7); // YYYY-MM

    // Extract available groups from user memberships
    const availableGroups: AvailableGroup[] = user?.memberships?.map((m: UserMembership) => ({
        id: m.groupId,
        name: m.group?.name || "Unknown Group",
        timezone: m.group?.timezone || "UTC",
        cutoffHour: m.group?.cutoffHour ?? 0,
    })) || [];

    const hasNoGroups = availableGroups.length === 0;
    const hasSingleGroup = availableGroups.length === 1;
    const hasMultipleGroups = availableGroups.length > 1;

    // Initialize selected group from localStorage or auto-select
    useEffect(() => {
        if (userLoading || initialized) return;

        if (!user) {
            setSelectedGroupId(null);
            setError(null);
            setInitialized(true);
            return;
        }

        // Load stored preference
        let storedGroupId: string | null = null;
        try {
            storedGroupId = localStorage.getItem(SELECTED_GROUP_KEY);
        } catch {
            // localStorage may be unavailable
        }

        // Validate stored preference against available groups
        const storedIsValid = storedGroupId && availableGroups.some(g => g.id === storedGroupId);

        if (storedIsValid) {
            setSelectedGroupId(storedGroupId);
            setError(null);
        } else if (hasSingleGroup) {
            // Auto-select if only one group
            const onlyGroupId = availableGroups[0].id;
            setSelectedGroupId(onlyGroupId);
            try {
                localStorage.setItem(SELECTED_GROUP_KEY, onlyGroupId);
            } catch {
                // Ignore localStorage errors
            }
            setError(null);
        } else if (hasMultipleGroups) {
            // User must select - don't auto-select
            console.warn(
                `⚠️  MULTI_GROUP_DETECTED: User has ${availableGroups.length} active groups.`,
                'Groups:', availableGroups.map(g => ({ id: g.id, name: g.name })),
                'User must select a group.'
            );
            setSelectedGroupId(null);
            setError(null); // Not an error, just needs selection
        } else {
            // No groups - not an error, just unbound mode
            setSelectedGroupId(null);
            setError(null); // Use hasNoGroups flag instead of error
        }

        setInitialized(true);
    }, [user, userLoading, initialized, availableGroups, hasSingleGroup, hasMultipleGroups]);

    // Select group handler
    const selectGroup = useCallback((groupId: string) => {
        const groupExists = availableGroups.some(g => g.id === groupId);
        if (!groupExists) {
            console.error(`Cannot select group ${groupId}: not in available groups`);
            return;
        }

        setSelectedGroupId(groupId);
        try {
            localStorage.setItem(SELECTED_GROUP_KEY, groupId);
        } catch {
            // Ignore localStorage errors
        }

        // Trigger refetch to reload data for new group
        setRefetchTrigger(prev => prev + 1);
    }, [availableGroups]);

    // Determine if selection is required
    const requiresSelection = hasMultipleGroups && !selectedGroupId;

    // Final groupId to expose (for backwards compatibility)
    const groupId = selectedGroupId;

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
        refetchUser?.();
    }, [refetchUser]);

    return (
        <DashboardContext.Provider
            value={{
                groupId,
                currentDate,
                currentMonth,
                loading: userLoading || !initialized,
                error: error || userError,
                refetch,
                // Multi-group support
                availableGroups,
                selectedGroupId,
                selectGroup,
                requiresSelection,
                hasNoGroups,
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
