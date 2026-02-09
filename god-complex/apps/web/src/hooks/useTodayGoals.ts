"use client";
import { useEffect, useState, useCallback } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { Goal } from "@/types/dashboard";
export function useTodayGoals() {
    const { groupId, currentDate, loading: contextLoading } = useDashboardContext();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const fetchTodayGoals = useCallback(async () => {
        if (!groupId) {
            setGoals([]);
            setLoading(false);
            setError(null);
            return;
        }
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(`/api/daily-goals/${groupId}/${currentDate}`, {
                credentials: "include",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                if (response.status === 404) {
                    setGoals([]);
                    setError(null);
                    return;
                }
                throw new Error("Failed to fetch today's goals");
            }
            const data = await response.json();
            setGoals(data);
            setError(null);
        }
        catch (err) {
            if ((err as Error)?.name === 'AbortError') {
                setError("Request timed out. Please check your connection and try again.");
            }
            else {
                setError(err instanceof Error ? err.message : "Failed to load goals");
            }
            setGoals([]);
        }
        finally {
            setLoading(false);
        }
    }, [groupId, currentDate]);
    useEffect(() => {
        if (!contextLoading) {
            fetchTodayGoals();
        }
    }, [contextLoading, fetchTodayGoals, refetchTrigger]);
    const refetch = useCallback(async () => {
        setRefetchTrigger((prev) => prev + 1);
        await fetchTodayGoals();
    }, [fetchTodayGoals]);
    return { goals, loading: loading || contextLoading, error, refetch };
}
