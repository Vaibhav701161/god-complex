"use client";

import { TopBar, SystemDemandPanel, TodayGoalsPanel, HistoricalGrid, MonthlyGraph, Leaderboard } from "@/components/DashboardComponents";
import { useUser } from "@/hooks/useUser";
import { DashboardProvider, useDashboardContext } from "@/hooks/useDashboardContext";
import { useTodayGoals } from "@/hooks/useTodayGoals";
import { useSystemMode } from "@/hooks/useSystemMode";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useMonthlyHistory } from "@/hooks/useMonthlyHistory";
import { useLeaderboard } from "@/hooks/useLeaderboard";

function DashboardContent() {
    const { user, loading: userLoading, error: userError } = useUser();
    const { loading: contextLoading, error: contextError } = useDashboardContext();
    const { goals, loading: goalsLoading } = useTodayGoals();
    const { mode, loading: modeLoading } = useSystemMode();
    const { metrics, loading: metricsLoading } = useDashboardMetrics();
    const { history, loading: historyLoading } = useMonthlyHistory();
    const { leaderboard, loading: leaderboardLoading } = useLeaderboard();

    const loading = userLoading || contextLoading || goalsLoading || modeLoading || metricsLoading;
    const error = userError || contextError;

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    LOADING SYSTEM DATA...
                </div>
            </main>
        );
    }

    if (error || !user) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-red-500 font-mono text-sm tracking-widest">
                    ERROR: {error || "Failed to load user data"}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            <TopBar user={user} />

            {/* 1. SYSTEM DEMAND (Dominant) */}
            <section className="relative z-10">
                <SystemDemandPanel
                    mode={mode}
                    failureMomentum={metrics.failureMomentum}
                    pattern={metrics.pattern || undefined}
                />
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-12">

                {/* 2. TODAY'S DECLARATION / STATUS */}
                <TodayGoalsPanel goals={goals} declarationDelta={metrics.declarationDelta} />

                {/* 3. HISTORICAL ENFORCEMENT VIEW (Secondary) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8 border-t border-[#1E293B]">
                    <div className="lg:col-span-3">
                        <HistoricalGrid history={history} loading={historyLoading} />
                    </div>
                    <div className="lg:col-span-1 border-l border-[#1E293B] pl-0 lg:pl-12">
                        {/* Summary / Graph - demoted to sidebar feel */}
                        <div className="mb-8">
                            <div className="text-4xl font-bold text-white font-mono mb-2">
                                {metrics.efficiency.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Efficiency</div>

                            <div className="border-t border-[#1E293B] pt-4">
                                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Excuse Debt</div>
                                <div className="text-sm text-red-400 font-mono">
                                    {metrics.excuseDebt} active liabilities
                                </div>
                            </div>
                        </div>
                        <MonthlyGraph history={history} />
                    </div>
                </div>

                {/* 4. GROUP LEADERBOARD (Optional but visible) */}
                <div className="pt-8 border-t border-[#1E293B]">
                    <Leaderboard leaderboard={leaderboard} currentUserId={user.id} />
                </div>
            </div>
        </main>
    );
}

export default function Dashboard() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}
