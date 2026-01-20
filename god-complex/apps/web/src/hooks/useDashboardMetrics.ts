"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { DashboardMetrics } from "@/types/dashboard";

/**
 * USE DASHBOARD METRICS
 * 
 * Fetches pre-computed metrics from backend.
 * NO client-side math allowed.
 */
export function useDashboardMetrics() {
    const { groupId, loading: contextLoading } = useDashboardContext();
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        efficiency: 0,
        excuseDebt: 0,
        failureMomentum: 0,
        pattern: null,
        declarationDelta: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMetrics() {
            if (!groupId) {
                setMetrics({ efficiency: 0, excuseDebt: 0, failureMomentum: 0, pattern: null, declarationDelta: null });
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // 🎯 SINGLE SOURCE OF TRUTH - Backend computes everything
                const response = await fetch(
                    `http://localhost:4000/api/metrics/${groupId}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Failed to load metrics");
                }

                const data = await response.json();
                setMetrics(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load metrics");
                setMetrics({ efficiency: 0, excuseDebt: 0, failureMomentum: 0, pattern: null, declarationDelta: null });
            } finally {
                setLoading(false);
            }
        }

        if (!contextLoading) {
            fetchMetrics();
        }
    }, [groupId, contextLoading]);

    return { metrics, loading: loading || contextLoading, error };
}
