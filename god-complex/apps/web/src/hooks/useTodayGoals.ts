"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { Goal } from "@/types/dashboard";

export function useTodayGoals() {
    const { groupId, currentDate, loading: contextLoading } = useDashboardContext();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetchTodayGoals = useCallback(async () => {
        if (!groupId) {
            setGoals([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `/api/daily-goals/${groupId}/${currentDate}`,
                { credentials: "include" }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    // No goals declared yet - this is valid empty state
                    setGoals([]);
                    setError(null);
                    return;
                }
                throw new Error("Failed to fetch today's goals");
            }

            const data = await response.json();
            setGoals(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load goals");
            setGoals([]);
        } finally {
            setLoading(false);
        }
    }, [groupId, currentDate]);

    useEffect(() => {
        if (!contextLoading) {
            fetchTodayGoals();
        }
    }, [contextLoading, fetchTodayGoals, refetchTrigger]);

    // Expose refetch function that re-runs the fetch and returns a promise
    const refetch = useCallback(async () => {
        setRefetchTrigger((prev) => prev + 1);
        await fetchTodayGoals();
    }, [fetchTodayGoals]);

    return { goals, loading: loading || contextLoading, error, refetch };
}
