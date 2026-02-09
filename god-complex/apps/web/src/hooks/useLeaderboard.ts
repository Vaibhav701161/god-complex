"use client";
import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { LeaderboardEntry } from "@/types/dashboard";
export function useLeaderboard() {
    const { groupId, currentMonth, loading: contextLoading } = useDashboardContext();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchLeaderboard() {
            if (!groupId) {
                setLeaderboard([]);
                setLoading(false);
                setError(null);
                return;
            }
            try {
                setLoading(true);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch(`/api/leaderboard/leaderboard/${groupId}/${currentMonth}`, {
                    credentials: "include",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard");
                }
                const data = await response.json();
                const enrichedLeaderboard: LeaderboardEntry[] = data.map((entry: any, index: number) => ({
                    userId: entry.userId,
                    name: `User ${entry.userId.slice(0, 8)}`,
                    score: entry.score,
                    rank: index + 1,
                }));
                setLeaderboard(enrichedLeaderboard);
                setError(null);
            }
            catch (err) {
                if ((err as Error)?.name === 'AbortError') {
                    setError("Request timed out. Please check your connection and try again.");
                }
                else {
                    setError(err instanceof Error ? err.message : "Failed to load leaderboard");
                }
                setLeaderboard([]);
            }
            finally {
                setLoading(false);
            }
        }
        if (!contextLoading) {
            fetchLeaderboard();
        }
    }, [groupId, currentMonth, contextLoading]);
    return { leaderboard, loading: loading || contextLoading, error };
}
