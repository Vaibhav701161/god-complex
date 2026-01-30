"use client";

import { useState } from "react";
import { TopBar } from "@/components/DashboardComponents";
import { useUser } from "@/hooks/useUser";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { usePenalties } from "@/hooks/usePenalties";
import { PenaltyStatus, PenaltyVerdict } from "@/types/dashboard";
import { PENALTY_DEFINITIONS } from "@/lib/penalties";

/**
 * Step 5: Penalties Page
 * 
 * Comprehensive penalty management interface with ledger table,
 * status badges, completion actions, and appeal functionality
 */

// Status Badge Component
function StatusBadge({ status, verdict }: { status: PenaltyStatus; verdict?: PenaltyVerdict }) {
    const colorMap: Record<PenaltyStatus, { border: string; text: string; bg: string }> = {
        PENDING: { border: "border-yellow-500/50", text: "text-yellow-500", bg: "bg-yellow-950/10" },
        COMPLETED: { border: "border-green-500/50", text: "text-green-500", bg: "bg-green-950/10" },
        FAILED: { border: "border-red-500/50", text: "text-red-500", bg: "bg-red-950/10" },
        APPEALED: { border: "border-blue-500/50", text: "text-blue-500", bg: "bg-blue-950/10" },
        RESOLVED: { border: "border-gray-500/50", text: "text-gray-400", bg: "bg-gray-950/10" },
    };

    const colors = colorMap[status];

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 border ${colors.border} ${colors.bg}`}>
            <span className={`text-xs font-mono tracking-widest uppercase ${colors.text}`}>
                {status}
            </span>
            {status === 'RESOLVED' && verdict && (
                <span className={`text-[10px] font-mono tracking-widest uppercase ${
                    verdict === 'REVERSED' ? 'text-green-400' : 'text-red-400'
                }`}>
                    • {verdict}
                </span>
            )}
        </div>
    );
}

// Appeal Modal Component
function AppealModal({ 
    penaltyId, 
    onClose, 
    onSubmit 
}: { 
    penaltyId: string; 
    onClose: () => void; 
    onSubmit: (penaltyId: string, reason: string) => Promise<void>;
}) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (reason.trim().length < 20) {
            setError("Appeal reason must be at least 20 characters");
            return;
        }

        if (reason.length > 500) {
            setError("Appeal reason cannot exceed 500 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await onSubmit(penaltyId, reason);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit appeal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="max-w-2xl w-full mx-4 border border-[#1E293B] bg-[#0B101A] p-8">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase mb-2">
                        Appeal Penalty
                    </h2>
                    <p className="text-xs font-mono text-gray-500 uppercase">
                        Explain why this penalty should be reconsidered
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 border border-red-900/50 bg-red-950/20">
                        <p className="text-sm font-mono text-red-400">{error}</p>
                    </div>
                )}

                {/* Textarea */}
                <div className="mb-6">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Provide a detailed explanation for your appeal..."
                        className="w-full h-40 p-4 bg-[#0F172A] border border-[#334155] text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-blue-500/50"
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-600 font-mono">
                            {reason.length < 20 ? (
                                <span className="text-yellow-500">Minimum 20 characters required</span>
                            ) : (
                                <span className="text-green-500">✓ Valid length</span>
                            )}
                        </span>
                        <span className={`text-xs font-mono ${
                            reason.length > 500 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                            {reason.length} / 500
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || reason.trim().length < 20 || reason.length > 500}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "SUBMITTING..." : "SUBMIT APPEAL"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-3 border border-[#334155] hover:border-gray-500 text-gray-400 hover:text-gray-300 font-bold tracking-[0.2em] text-sm uppercase transition-colors"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Penalties Page
export default function PenaltiesPage() {
    const { user, loading: userLoading } = useUser();
    const { groupId, currentMonth, loading: contextLoading } = useDashboardContext();
    const { metrics, loading: metricsLoading } = useDashboardMetrics();
    const { penalties, loading: penaltiesLoading, markComplete, submitAppeal } = usePenalties(groupId, currentMonth);

    const [appealingPenaltyId, setAppealingPenaltyId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const loading = userLoading || contextLoading || metricsLoading || penaltiesLoading;

    // Calculate overdue penalties
    const now = new Date();
    const overduePenalties = penalties.filter(p => 
        p.status === 'PENDING' && new Date(p.dueDate) < now
    );

    // Format due date with countdown
    const formatDueDate = (dueDateStr: string) => {
        const dueDate = new Date(dueDateStr);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formatted = dueDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        if (diffDays < 0) {
            return `${formatted} (${Math.abs(diffDays)} days overdue)`;
        } else if (diffDays === 0) {
            return `${formatted} (Due today)`;
        } else if (diffDays === 1) {
            return `${formatted} (1 day remaining)`;
        } else {
            return `${formatted} (${diffDays} days remaining)`;
        }
    };

    // Handle mark complete
    const handleMarkComplete = async (penaltyId: string) => {
        try {
            setActionLoading(penaltyId);
            setActionError(null);
            await markComplete(penaltyId);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to mark complete");
        } finally {
            setActionLoading(null);
        }
    };

    // Handle appeal submit
    const handleAppealSubmit = async (penaltyId: string, reason: string) => {
        await submitAppeal(penaltyId, reason);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    LOADING PENALTIES...
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-red-500 font-mono text-sm tracking-widest">
                    ERROR: Failed to load user data
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            <TopBar user={user} />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Header with Metrics */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-[0.2em] uppercase mb-2">
                            Penalty Ledger
                        </h1>
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                            Track and manage assigned penalties
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-red-400 font-mono mb-1">
                            {metrics.activeLiabilities}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">
                            Active Liabilities
                        </div>
                    </div>
                </div>

                {/* Overdue Warning */}
                {overduePenalties.length > 0 && (
                    <div className="border-2 border-red-500/50 bg-red-950/10 p-6 mb-6">
                        <h3 className="text-red-500 font-bold tracking-widest text-sm uppercase mb-2">
                            ⚠️ OVERDUE PENALTIES DETECTED
                        </h3>
                        <p className="text-gray-400 font-mono text-xs">
                            {overduePenalties.length} {overduePenalties.length === 1 ? 'penalty' : 'penalties'} past due. Auto-fail imminent.
                        </p>
                    </div>
                )}

                {/* Action Error */}
                {actionError && (
                    <div className="mb-6 p-4 border border-red-900/50 bg-red-950/20">
                        <p className="text-sm font-mono text-red-400">{actionError}</p>
                        <button
                            onClick={() => setActionError(null)}
                            className="text-red-600 hover:text-red-400 font-mono text-xs mt-2"
                        >
                            [DISMISS]
                        </button>
                    </div>
                )}

                {/* Penalty Ledger Table */}
                {penalties.length === 0 ? (
                    <div className="border border-dashed border-[#1E293B] p-12 text-center">
                        <p className="text-gray-500 font-mono text-sm">NO PENALTIES ASSIGNED</p>
                        <p className="text-gray-700 text-xs mt-2">You are in good standing</p>
                    </div>
                ) : (
                    <div className="border border-[#1E293B] bg-[#0B101A]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#1E293B] bg-[#050810]">
                            <div className="col-span-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                Type
                            </div>
                            <div className="col-span-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                Due Date
                            </div>
                            <div className="col-span-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                Status
                            </div>
                            <div className="col-span-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                Actions
                            </div>
                        </div>

                        {/* Table Body */}
                        {penalties.map((penalty) => {
                            const definition = PENALTY_DEFINITIONS[penalty.penaltyType];
                            const isOverdue = penalty.status === 'PENDING' && new Date(penalty.dueDate) < now;
                            const isLoading = actionLoading === penalty.id;

                            return (
                                <div
                                    key={penalty.id}
                                    className={`grid grid-cols-12 gap-4 p-4 border-b border-[#1E293B] last:border-b-0 ${
                                        isOverdue ? 'bg-red-950/5' : 'hover:bg-[#0F172A]'
                                    } transition-colors`}
                                >
                                    {/* Type */}
                                    <div className="col-span-4 flex items-center gap-3">
                                        <span className="text-2xl">{definition?.icon || '📋'}</span>
                                        <div>
                                            <div className="text-sm text-white font-mono">
                                                {definition?.title || penalty.penaltyType}
                                            </div>
                                            <div className="text-xs text-gray-600 font-mono mt-1">
                                                {penalty.penaltyType}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="col-span-3 flex items-center">
                                        <div className="text-sm font-mono">
                                            <div className={isOverdue ? 'text-red-400' : 'text-gray-400'}>
                                                {formatDueDate(penalty.dueDate)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex items-center">
                                        <StatusBadge status={penalty.status} verdict={penalty.verdict} />
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-3 flex items-center gap-2">
                                        {penalty.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleMarkComplete(penalty.id)}
                                                    disabled={isLoading}
                                                    className="px-3 py-1 bg-green-900/30 hover:bg-green-900/50 border border-green-500/50 text-green-400 text-xs font-mono uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? 'MARKING...' : 'COMPLETE'}
                                                </button>
                                                <button
                                                    onClick={() => setAppealingPenaltyId(penalty.id)}
                                                    disabled={isLoading}
                                                    className="px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/50 text-blue-400 text-xs font-mono uppercase transition-colors"
                                                >
                                                    APPEAL
                                                </button>
                                            </>
                                        )}
                                        {penalty.status === 'FAILED' && (
                                            <button
                                                onClick={() => setAppealingPenaltyId(penalty.id)}
                                                disabled={isLoading}
                                                className="px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/50 text-blue-400 text-xs font-mono uppercase transition-colors"
                                            >
                                                APPEAL
                                            </button>
                                        )}
                                        {penalty.status === 'APPEALED' && (
                                            <div className="text-xs font-mono text-gray-600 uppercase">
                                                Pending Review
                                            </div>
                                        )}
                                        {(penalty.status === 'COMPLETED' || penalty.status === 'RESOLVED') && (
                                            <div className="text-xs font-mono text-gray-600 uppercase">
                                                No Actions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Appeal Modal */}
            {appealingPenaltyId && (
                <AppealModal
                    penaltyId={appealingPenaltyId}
                    onClose={() => setAppealingPenaltyId(null)}
                    onSubmit={handleAppealSubmit}
                />
            )}
        </main>
    );
}
