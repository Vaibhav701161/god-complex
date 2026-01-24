"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { LeaderboardEntry } from "@/types/dashboard";

export function useLeaderboard() {
    const { groupId, currentMonth, loading: contextLoading } = useDashboardContext();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLeaderboard() {
            if (!groupId) {
                setLeaderboard([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `/api/leaderboard/leaderboard/${groupId}/${currentMonth}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard");
                }

                const data = await response.json();

                // Backend returns array of {userId, score}
                // We need to enrich with user names and rankings
                const enrichedLeaderboard: LeaderboardEntry[] = data.map((entry: any, index: number) => ({
                    userId: entry.userId,
                    name: `User ${entry.userId.slice(0, 8)}`, // Placeholder - need user names
                    score: entry.score,
                    rank: index + 1,
                }));

                setLeaderboard(enrichedLeaderboard);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load leaderboard");
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        }

        if (!contextLoading) {
            fetchLeaderboard();
        }
    }, [groupId, currentMonth, contextLoading]);

    return { leaderboard, loading: loading || contextLoading, error };
}
