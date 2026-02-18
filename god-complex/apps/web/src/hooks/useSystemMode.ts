"use client";
import { useEffect, useState, useCallback } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { SystemMode } from "@/types/dashboard";
export function useSystemMode() {
    const { groupId, currentDate } = useDashboardContext();
    const [mode, setMode] = useState<SystemMode>('DECLARATION_REQUIRED');
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<any>(null);
    const fetchSystemMode = useCallback(async () => {
        if (!groupId) {
            setMode('DECLARATION_REQUIRED');
            setLoading(false);
            setMetadata(null);
            return;
        }
        try {
            setLoading(true);
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(`${apiURL}/api/state/${groupId}/${currentDate}`, {
                credentials: "include",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error("Failed to fetch system state");
            }
            const state = await response.json();
            setMode(state.systemMode);
            setMetadata(state.metadata);
            setLoading(false);
        }
        catch (err) {
            if ((err as Error)?.name === 'AbortError') {
                console.error('System mode fetch timed out');
            }
            else {
                console.error('Failed to fetch system mode:', err);
            }
            setMode('DECLARATION_REQUIRED');
            setLoading(false);
        }
    }, [groupId, currentDate]);
    useEffect(() => {
        fetchSystemMode();
    }, [fetchSystemMode]);
    const refetch = useCallback(async () => {
        await fetchSystemMode();
    }, [fetchSystemMode]);
    return { mode, loading, metadata, refetch };
}
interface GroupState {
    groupId: string;
    groupName: string;
    mode: SystemMode;
    metadata?: any;
}
interface AggregateState {
    aggregateMode: SystemMode;
    drivingGroup: GroupState | null;
    groupStates: GroupState[];
    earliestCutoff?: string;
}
export function useAggregateSystemMode() {
    const { currentDate, user, userLoading } = useDashboardContext();
    const [aggregateState, setAggregateState] = useState<AggregateState>({
        aggregateMode: 'DECLARATION_REQUIRED',
        drivingGroup: null,
        groupStates: [],
    });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        async function fetchAggregateState() {
            if (!user?.memberships || user.memberships.length === 0) {
                setAggregateState({
                    aggregateMode: 'DECLARATION_REQUIRED',
                    drivingGroup: null,
                    groupStates: [],
                });
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const statePromises = user.memberships.map(async (membership: any) => {
                    try {
                        const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000);
                        const response = await fetch(`${apiURL}/api/state/${membership.groupId}/${currentDate}`, {
                            credentials: "include",
                            signal: controller.signal,
                        });
                        clearTimeout(timeoutId);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch state for group ${membership.groupId}`);
                        }
                        const state = await response.json();
                        return {
                            groupId: membership.groupId,
                            groupName: membership.group?.name || 'Unknown Group',
                            mode: state.systemMode,
                            metadata: state.metadata,
                        } as GroupState;
                    }
                    catch (err) {
                        if ((err as Error)?.name === 'AbortError') {
                            console.error(`State fetch timed out for group ${membership.groupId}`);
                        }
                        else {
                            console.error(`Error fetching state for group ${membership.groupId}:`, err);
                        }
                        return null;
                    }
                });
                const groupStates = (await Promise.all(statePromises)).filter(Boolean) as GroupState[];
                if (groupStates.length === 0) {
                    setAggregateState({
                        aggregateMode: 'DECLARATION_REQUIRED',
                        drivingGroup: null,
                        groupStates: [],
                    });
                    setLoading(false);
                    return;
                }
                const modePriority: Record<SystemMode, number> = {
                    'AUTO_FAILED': 5,
                    'RESOLUTION_PENDING': 4,
                    'EXECUTION_IN_PROGRESS': 3,
                    'DECLARATION_REQUIRED': 2,
                    'DAY_FINALIZED': 1,
                };
                let mostCriticalState = groupStates[0];
                for (const state of groupStates) {
                    if (modePriority[state.mode] > modePriority[mostCriticalState.mode]) {
                        mostCriticalState = state;
                    }
                }
                const cutoffTimes = groupStates
                    .map(s => s.metadata?.cutoffTime)
                    .filter(Boolean);
                const earliestCutoff = cutoffTimes.length > 0
                    ? cutoffTimes.sort()[0]
                    : undefined;
                setAggregateState({
                    aggregateMode: mostCriticalState.mode,
                    drivingGroup: mostCriticalState,
                    groupStates,
                    earliestCutoff,
                });
                setLoading(false);
            }
            catch (err) {
                console.error('Failed to fetch aggregate system mode:', err);
                setAggregateState({
                    aggregateMode: 'DECLARATION_REQUIRED',
                    drivingGroup: null,
                    groupStates: [],
                });
                setLoading(false);
            }
        }
        if (!userLoading) {
            fetchAggregateState();
        }
    }, [user, userLoading, currentDate]);
    return { ...aggregateState, loading };
}
