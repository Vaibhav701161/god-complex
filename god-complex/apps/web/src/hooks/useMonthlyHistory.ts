"use client";
import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { DayHistoryEntry, DailyStatus } from "@/types/dashboard";
export function useMonthlyHistory() {
    const { groupId, currentMonth, loading: contextLoading } = useDashboardContext();
    const [history, setHistory] = useState<Map<number, DayHistoryEntry>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchMonthlyHistory() {
            if (!groupId) {
                setHistory(new Map());
                setLoading(false);
                setError(null);
                return;
            }
            try {
                setHistory(new Map());
                setLoading(true);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch(`/api/history/${groupId}/${currentMonth}`, {
                    credentials: "include",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error("Failed to fetch monthly history");
                }
                const data = await response.json();
                const historyMap = new Map<number, DayHistoryEntry>();
                data.days.forEach((dayData: any) => {
                    historyMap.set(dayData.day, {
                        date: dayData.date,
                        goals: dayData.goals.map((g: any) => ({
                            goalId: g.id,
                            title: g.title,
                            status: mapBackendStatusToDailyStatus(g),
                        })),
                    });
                });
                setHistory(historyMap);
                setError(null);
            }
            catch (err) {
                if ((err as Error)?.name === 'AbortError') {
                    setError("Request timed out. Please check your connection and try again.");
                }
                else {
                    setError(err instanceof Error ? err.message : "Failed to load history");
                }
                setHistory(new Map());
            }
            finally {
                setLoading(false);
            }
        }
        if (!contextLoading) {
            fetchMonthlyHistory();
        }
    }, [groupId, currentMonth, contextLoading]);
    return { history, loading: loading || contextLoading, error };
}
function mapBackendStatusToDailyStatus(goal: any): DailyStatus {
    if (!goal.status)
        return 'none';
    if (goal.isAutoFail)
        return 'auto-fail';
    switch (goal.status) {
        case 'COMPLETED':
            return 'completed';
        case 'MIN_EFFORT':
            return 'min_effort';
        case 'FAILED':
            return 'failed';
        default:
            return 'none';
    }
}
