"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo, useRef } from "react";
import { UserMembership } from "./useUser";
const SELECTED_GROUP_KEY = "god_complex_selected_group";
interface AvailableGroup {
    id: string;
    name: string;
    timezone: string;
    cutoffHour: number;
}
interface DashboardContextValue {
    groupId: string | null;
    currentDate: string;
    currentMonth: string;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    availableGroups: AvailableGroup[];
    selectedGroupId: string | null;
    selectGroup: (groupId: string) => void;
    requiresSelection: boolean;
    hasNoGroups: boolean;
    stale: boolean;
    user: any | null;
    userLoading: boolean;
    refetchUser: (forceReset?: boolean) => void;
}
const DashboardContext = createContext<DashboardContextValue | null>(null);
interface DashboardProviderProps {
    children: ReactNode;
    user: any | null;
    userLoading: boolean;
    userError: string | null;
    refetchUser: (forceReset?: boolean) => void;
    stale?: boolean;
}
export function DashboardProvider({ children, user, userLoading, userError, refetchUser, stale: userStale }: DashboardProviderProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const prevAvailableGroupsRef = useRef<string>("");
    const currentDate = new Date().toISOString().split('T')[0];
    const currentMonth = currentDate.slice(0, 7);
    const availableGroups: AvailableGroup[] = useMemo(() => user?.memberships?.map((m: UserMembership) => ({
        id: m.groupId,
        name: m.group?.name || "Unknown Group",
        timezone: m.group?.timezone || "UTC",
        cutoffHour: m.group?.cutoffHour ?? 0,
    })) || [], [user?.memberships]);
    const hasNoGroups = availableGroups.length === 0;
    const hasSingleGroup = availableGroups.length === 1;
    const hasMultipleGroups = availableGroups.length > 1;
    const availableGroupsKey = availableGroups.map(g => g.id).sort().join(',');
    useEffect(() => {
        prevAvailableGroupsRef.current = availableGroupsKey;
    }, [availableGroupsKey]);
    useEffect(() => {
        if (userLoading)
            return;
        if (!user) {
            setSelectedGroupId(null);
            setError(null);
            return;
        }
        const currentSelectionValid = selectedGroupId && availableGroups.some(g => g.id === selectedGroupId);
        if (currentSelectionValid) {
            setError(null);
            return;
        }
        let storedGroupId: string | null = null;
        try {
            storedGroupId = localStorage.getItem(SELECTED_GROUP_KEY);
        }
        catch {
        }
        const storedIsValid = storedGroupId && availableGroups.some(g => g.id === storedGroupId);
        if (storedIsValid) {
            setSelectedGroupId(storedGroupId);
            setError(null);
        }
        else if (hasSingleGroup) {
            const onlyGroupId = availableGroups[0].id;
            setSelectedGroupId(onlyGroupId);
            try {
                localStorage.setItem(SELECTED_GROUP_KEY, onlyGroupId);
            }
            catch {
            }
            setError(null);
        }
        else if (hasMultipleGroups) {
            console.warn(`️  MULTI_GROUP_DETECTED: User has ${availableGroups.length} active groups.`, 'Groups:', availableGroups.map(g => ({ id: g.id, name: g.name })), 'User must select a group.');
            setSelectedGroupId(null);
            try {
                localStorage.removeItem(SELECTED_GROUP_KEY);
            }
            catch {
            }
            setError(null);
        }
        else if (hasNoGroups) {
            setSelectedGroupId(null);
            try {
                localStorage.removeItem(SELECTED_GROUP_KEY);
            }
            catch {
            }
            setError(null);
        }
    }, [user, userLoading, availableGroups, hasSingleGroup, hasMultipleGroups, hasNoGroups, availableGroupsKey]);
    const selectGroup = useCallback((groupId: string) => {
        const groupExists = availableGroups.some(g => g.id === groupId);
        if (!groupExists) {
            console.error(`Cannot select group ${groupId}: not in available groups`);
            return;
        }
        setSelectedGroupId(groupId);
        try {
            localStorage.setItem(SELECTED_GROUP_KEY, groupId);
        }
        catch {
        }
        setRefetchTrigger(prev => prev + 1);
    }, [availableGroups]);
    const requiresSelection = hasMultipleGroups && !selectedGroupId;
    const groupId = selectedGroupId;
    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
        refetchUser?.();
    }, [refetchUser]);
    const contextValue = useMemo(() => ({
        groupId,
        currentDate,
        currentMonth,
        loading: userLoading,
        error: error || userError,
        refetch,
        availableGroups,
        selectedGroupId,
        selectGroup,
        requiresSelection,
        hasNoGroups,
        stale: userStale || false,
        user,
        userLoading,
        refetchUser,
    }), [
        groupId,
        currentDate,
        currentMonth,
        userLoading,
        error,
        userError,
        refetch,
        availableGroups,
        selectedGroupId,
        selectGroup,
        requiresSelection,
        hasNoGroups,
        userStale,
        user,
        refetchUser,
    ]);
    return (<DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>);
}
export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboardContext must be used within DashboardProvider");
    }
    return context;
}
