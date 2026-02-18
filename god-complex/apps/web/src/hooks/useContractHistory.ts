"use client";
import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { ContractSummary } from "@/components/ContractHistory";
export function useContractHistory(excludeToday: boolean = true) {
    const { groupId, currentMonth, currentDate, loading: contextLoading } = useDashboardContext();
    const [contracts, setContracts] = useState<ContractSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchContractHistory() {
            if (!groupId) {
                setContracts([]);
                setLoading(false);
                setError(null);
                return;
            }
            try {
                setContracts([]);
                setLoading(true);
                const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch(`${apiURL}/api/history/${groupId}/${currentMonth}`, {
                    credentials: "include",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error("Failed to fetch contract history");
                }
                const data = await response.json();
                const contractList: ContractSummary[] = data.days
                    .filter((day: any) => {
                    if (!day.goals || day.goals.length === 0)
                        return false;
                    if (excludeToday && day.date === currentDate)
                        return false;
                    return true;
                })
                    .map((day: any) => {
                    const goalsTotal = day.goals.length;
                    const goalsCompleted = day.goals.filter((g: any) => g.status === 'COMPLETED').length;
                    const goalsMinEffort = day.goals.filter((g: any) => g.status === 'MIN_EFFORT').length;
                    const goalsFailed = day.goals.filter((g: any) => g.status === 'FAILED' || g.isAutoFail).length;
                    const completionScore = goalsTotal > 0
                        ? (goalsCompleted + goalsMinEffort * 0.7) / goalsTotal
                        : 0;
                    let status: "SUCCESS" | "FAILURE" | "PARTIAL";
                    if (completionScore >= 0.9) {
                        status = "SUCCESS";
                    }
                    else if (completionScore < 0.5) {
                        status = "FAILURE";
                    }
                    else {
                        status = "PARTIAL";
                    }
                    return {
                        date: day.date,
                        completionScore,
                        status,
                        goalsTotal,
                        goalsCompleted,
                        goalsFailed,
                        goalsMinEffort,
                        penalties: 0,
                        goals: day.goals.map((g: any) => ({
                            id: g.id,
                            title: g.title,
                            category: g.category,
                            status: g.status,
                            isUncomfortable: g.isUncomfortable,
                            failureReason: g.failureReason === 'SYSTEM_ASSIGNED' ? 'System Override (Repeated Excuse)' : g.failureReason,
                        })),
                    };
                })
                    .sort((a: ContractSummary, b: ContractSummary) => b.date.localeCompare(a.date));
                setContracts(contractList);
                setError(null);
            }
            catch (err) {
                if ((err as Error)?.name === 'AbortError') {
                    setError("Request timed out. Please check your connection and try again.");
                }
                else {
                    setError(err instanceof Error ? err.message : "Failed to load contracts");
                }
                setContracts([]);
            }
            finally {
                setLoading(false);
            }
        }
        if (!contextLoading) {
            fetchContractHistory();
        }
    }, [groupId, currentMonth, currentDate, excludeToday, contextLoading]);
    return { contracts, loading: loading || contextLoading, error };
}
export function useAggregateMetrics(contracts: ContractSummary[]) {
    const [metrics, setMetrics] = useState({
        rollingCompletion7Day: 0,
        rollingCompletion30Day: 0,
        currentStreak: 0,
        failureMomentum: 0,
    });
    useEffect(() => {
        if (contracts.length === 0) {
            setMetrics({
                rollingCompletion7Day: 0,
                rollingCompletion30Day: 0,
                currentStreak: 0,
                failureMomentum: 0,
            });
            return;
        }
        const sortedContracts = [...contracts].sort((a, b) => b.date.localeCompare(a.date));
        const last7 = sortedContracts.slice(0, 7);
        const rolling7 = last7.length > 0
            ? (last7.reduce((sum, c) => sum + c.completionScore, 0) / last7.length) * 100
            : 0;
        const last30 = sortedContracts.slice(0, 30);
        const rolling30 = last30.length > 0
            ? (last30.reduce((sum, c) => sum + c.completionScore, 0) / last30.length) * 100
            : 0;
        let streak = 0;
        for (const contract of sortedContracts) {
            if (contract.status === "SUCCESS") {
                streak++;
            }
            else {
                break;
            }
        }
        let momentum = 0;
        for (const contract of last7) {
            if (contract.status === "FAILURE") {
                momentum++;
            }
            else {
                break;
            }
        }
        setMetrics({
            rollingCompletion7Day: rolling7,
            rollingCompletion30Day: rolling30,
            currentStreak: streak,
            failureMomentum: momentum,
        });
    }, [contracts]);
    return metrics;
}
