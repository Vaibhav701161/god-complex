"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "./useDashboardContext";
import { SystemMode } from "@/types/dashboard";

/**
 * BACKEND-OWNED SYSTEM MODE
 * 
 * Frontend NO LONGER derives time-based state.
 * All mode logic lives on backend where server time is authoritative.
 * 
 * This eliminates:
 * - Clock drift issues
 * - Stale tab problems
 * - Frontend time authority
 */
export function useSystemMode() {
    const { groupId, currentDate } = useDashboardContext();
    const [mode, setMode] = useState<SystemMode>('DECLARATION_REQUIRED');
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState<any>(null);

    useEffect(() => {
        async function fetchSystemMode() {
            if (!groupId) {
                setMode('DECLARATION_REQUIRED');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // 🎯 BACKEND AUTHORITY - Server determines mode
                const response = await fetch(
                    `/api/state/${groupId}/${currentDate}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch system state");
                }

                const state = await response.json();

                setMode(state.systemMode);
                setMetadata(state.metadata);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch system mode:', err);
                // Fallback to safe default
                setMode('DECLARATION_REQUIRED');
                setLoading(false);
            }
        }

        fetchSystemMode();
    }, [groupId, currentDate]);

    return { mode, loading, metadata };
}
