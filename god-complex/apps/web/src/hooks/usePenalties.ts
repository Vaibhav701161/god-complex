"use client";
import { useEffect, useState, useCallback } from "react";
import { PenaltyAssignment } from "@/types/dashboard";
export function usePenalties(groupId: string | null, month: string) {
    const [penalties, setPenalties] = useState<PenaltyAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchPenalties = useCallback(async () => {
        if (!groupId) {
            setPenalties([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/penalty/${groupId}/${month}`, {
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch penalties");
            }
            const data = await response.json();
            setPenalties(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load penalties");
            setPenalties([]);
        }
        finally {
            setLoading(false);
        }
    }, [groupId, month]);
    const markComplete = useCallback(async (penaltyId: string) => {
        try {
            const response = await fetch(`/api/penalty/${penaltyId}/complete`, {
                method: "POST",
                credentials: "include"
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || "Failed to mark penalty complete");
            }
            await fetchPenalties();
        }
        catch (err) {
            throw err;
        }
    }, [fetchPenalties]);
    const submitAppeal = useCallback(async (penaltyId: string, reason: string) => {
        try {
            const response = await fetch(`/api/penalty/${penaltyId}/appeal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ reason })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || "Failed to submit appeal");
            }
            await fetchPenalties();
        }
        catch (err) {
            throw err;
        }
    }, [fetchPenalties]);
    useEffect(() => {
        fetchPenalties();
    }, [fetchPenalties]);
    return {
        penalties,
        loading,
        error,
        markComplete,
        submitAppeal,
        refresh: fetchPenalties
    };
}
