"use client";
import { useEffect, useState, useCallback } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { DashboardMetrics } from "@/types/dashboard";
export function useDashboardMetrics() {
    const { groupId, loading: contextLoading } = useDashboardContext();
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        efficiency: 0,
        activeLiabilities: 0,
        failureMomentum: 0,
        pattern: null,
        declarationDelta: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchMetrics = useCallback(async () => {
        if (!groupId) {
            setMetrics({ efficiency: 0, activeLiabilities: 0, failureMomentum: 0, pattern: null, declarationDelta: null });
            setLoading(false);
            setError(null);
            return;
        }
        try {
            setLoading(true);
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(`${apiURL}/api/metrics/${groupId}`, {
                credentials: "include",
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error");
                console.error(`[useDashboardMetrics] Failed to load metrics: ${response.status}`, errorText);
                throw new Error(`Failed to load metrics (${response.status})`);
            }
            const data = await response.json();
            console.log("[useDashboardMetrics] Loaded metrics:", data);
            setMetrics(data);
            setError(null);
        }
        catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                console.error("[useDashboardMetrics] Request timed out after 10 seconds");
                setError("Request timed out - backend may be unresponsive");
            }
            else {
                console.error("[useDashboardMetrics] Error:", err);
                setError(err instanceof Error ? err.message : "Failed to load metrics");
            }
            setMetrics({ efficiency: 0, activeLiabilities: 0, failureMomentum: 0, pattern: null, declarationDelta: null });
        }
        finally {
            setLoading(false);
        }
    }, [groupId]);
    useEffect(() => {
        if (!contextLoading) {
            fetchMetrics();
        }
    }, [contextLoading, fetchMetrics]);
    return { metrics, loading: loading || contextLoading, error };
}
