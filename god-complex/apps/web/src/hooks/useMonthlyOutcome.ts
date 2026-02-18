"use client";
import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
interface UserOutcome {
    finalScore: number;
    rank: number;
    averageDailyScore: number;
    activeDays: number;
    payoutAmount: number;
    penaltyAmount: number;
}
interface MonthlyOutcome {
    userOutcome: UserOutcome;
    totalParticipants: number;
    allRankings: any[];
}
export function useMonthlyOutcome() {
    const { groupId, currentMonth } = useDashboardContext();
    const [outcome, setOutcome] = useState<MonthlyOutcome | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClosed, setIsClosed] = useState(false);
    useEffect(() => {
        async function fetchMonthlyOutcome() {
            if (!groupId) {
                setOutcome(null);
                setIsClosed(false);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
                const response = await fetch(`${apiURL}/api/monthly/${groupId}/${currentMonth}`, { credentials: "include" });
                if (response.status === 404) {
                    setOutcome(null);
                    setIsClosed(false);
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch monthly outcome");
                }
                const data = await response.json();
                setOutcome(data);
                setIsClosed(true);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load monthly outcome");
                setOutcome(null);
                setIsClosed(false);
            }
            finally {
                setLoading(false);
            }
        }
        fetchMonthlyOutcome();
    }, [groupId, currentMonth]);
    return { outcome, loading, error, isClosed };
}
