"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { SystemMode } from "@/types/dashboard";

/**
 * BACKEND-OWNED SYSTEM MODE
 * 
 * Frontend NO LONGER derives time-based state.
 * All mode logic lives on backend where server time is authoritative.
 * 
 * This eliminates:
 * - Clock drift issues
 * - Stale tab problems
 * - Frontend time authority
 */
export function useSystemMode() {
    const { groupId, currentDate } = useDashboardContext();
    const [mode, setMode] = useState<SystemMode>('DECLARATION_REQUIRED');
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState<any>(null);

    useEffect(() => {
        async function fetchSystemMode() {
            if (!groupId) {
                setMode('DECLARATION_REQUIRED');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // 🎯 BACKEND AUTHORITY - Server determines mode
                const response = await fetch(
                    `/api/state/${groupId}/${currentDate}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch system state");
                }

                const state = await response.json();

                setMode(state.systemMode);
                setMetadata(state.metadata);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch system mode:', err);
                // Fallback to safe default
                setMode('DECLARATION_REQUIRED');
                setLoading(false);
            }
        }

        fetchSystemMode();
    }, [groupId, currentDate]);

    return { mode, loading, metadata };
}

/**
 * AGGREGATE SYSTEM MODE - Multi-Group State
 * 
 * Fetches system mode for all active groups and returns the most critical state.
 * 
 * Priority order (most urgent first):
 * - AUTO_FAILED (not a SystemMode but handled as special case)
 * - RESOLUTION_PENDING (cutoff passed, requires check-in)
 * - EXECUTION_IN_PROGRESS (contract active)
 * - DECLARATION_REQUIRED (no goals declared)
 * - DAY_FINALIZED (all complete)
 * 
 * Returns:
 * - aggregateMode: The most critical mode across all groups
 * - drivingGroup: Which group is driving the current demand
 * - groupStates: Breakdown of state per group
 * - earliestCutoff: Earliest cutoff time across all groups
 */
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
    const { currentDate } = useDashboardContext();
    const { user, loading: userLoading } = require('./useUser').useUser();
    
    const [aggregateState, setAggregateState] = useState<AggregateState>({
        aggregateMode: 'DECLARATION_REQUIRED',
        drivingGroup: null,
        groupStates: [],
    });
    const [loading, setLoading] = useState(true);

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

                // Fetch state for all active groups in parallel
                const statePromises = user.memberships.map(async (membership: any) => {
                    try {
                        const response = await fetch(
                            `/api/state/${membership.groupId}/${currentDate}`,
                            { credentials: "include" }
                        );

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
                    } catch (err) {
                        console.error(`Error fetching state for group ${membership.groupId}:`, err);
                        return null;
                    }
                });

                const groupStates = (await Promise.all(statePromises)).filter(Boolean) as GroupState[];

                // Guard: if no group states loaded, return safe default
                if (groupStates.length === 0) {
                    setAggregateState({
                        aggregateMode: 'DECLARATION_REQUIRED',
                        drivingGroup: null,
                        groupStates: [],
                    });
                    setLoading(false);
                    return;
                }

                // Apply priority order to find most critical state
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

                // Find earliest cutoff time
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
            } catch (err) {
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
