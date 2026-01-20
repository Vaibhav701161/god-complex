"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { Goal } from "@/types/dashboard";

export function useTodayGoals() {
    const { groupId, currentDate, loading: contextLoading } = useDashboardContext();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTodayGoals() {
            if (!groupId) {
                setGoals([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:4000/api/daily-goals/${groupId}/${currentDate}`,
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
        }

        if (!contextLoading) {
            fetchTodayGoals();
        }
    }, [groupId, currentDate, contextLoading]);

    return { goals, loading: loading || contextLoading, error };
}
