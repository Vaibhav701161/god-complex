"use client";

import { useEffect, useState, useCallback } from "react";
import { AuditLogEntry, AuditLogFilters } from "@/types/dashboard";

export function useAuditLog(groupId: string | null, filters?: AuditLogFilters) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchLogs = useCallback(async () => {
        if (!groupId) {
            setLogs([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Build query string from filters
            const params = new URLSearchParams();
            if (filters?.action) params.append('action', filters.action);
            if (filters?.source) params.append('source', filters.source);
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);
            if (filters?.correlationId) params.append('correlationId', filters.correlationId);

            const queryString = params.toString();
            const url = `/api/groups/audit/${groupId}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                credentials: "include",
            });

            if (response.status === 403) {
                throw new Error("You are not a member of this group");
            }

            if (!response.ok) {
                throw new Error("Failed to fetch audit logs");
            }

            const data = await response.json();
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load audit logs");
            setLogs([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [groupId, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { logs, loading, error, total, refresh: fetchLogs };
}
