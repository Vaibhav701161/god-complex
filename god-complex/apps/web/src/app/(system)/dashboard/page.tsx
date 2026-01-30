"use client";

import { TopBar, SystemDemandPanel, TodayGoalsPanel, HistoricalGrid, MonthlyGraph, Leaderboard } from "@/components/DashboardComponents";
import GroupSelector from "@/components/GroupSelector";
import { useUser } from "@/hooks/useUser";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useTodayGoals } from "@/hooks/useTodayGoals";
import { useSystemMode, useAggregateSystemMode } from "@/hooks/useSystemMode";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useMonthlyHistory } from "@/hooks/useMonthlyHistory";
import { useLeaderboard } from "@/hooks/useLeaderboard";

function DashboardContent() {
    const { user, loading: userLoading, error: userError } = useUser();
    const { loading: contextLoading, error: contextError, requiresSelection, availableGroups, hasNoGroups } = useDashboardContext();
    const { goals, loading: goalsLoading } = useTodayGoals();
    const { mode, loading: modeLoading } = useSystemMode();
    const { aggregateMode, drivingGroup, groupStates, loading: aggregateLoading } = useAggregateSystemMode();
    const { metrics, loading: metricsLoading } = useDashboardMetrics();
    const { history, loading: historyLoading } = useMonthlyHistory();
    const { leaderboard, loading: leaderboardLoading } = useLeaderboard();

    // Consolidate all loading/error flags including aggregateLoading
    const loading = userLoading || contextLoading || goalsLoading || modeLoading || metricsLoading || aggregateLoading;
    const error = userError || contextError;
    
    // Use aggregate mode if multiple groups exist, otherwise use single group mode
    const hasMultipleGroups = availableGroups.length > 1;
    const displayMode = hasMultipleGroups ? aggregateMode : mode;

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

    // Show unbound mode banner when user has no groups
    if (hasNoGroups) {
        return (
            <main className="min-h-screen bg-[#0a0e14] pb-32">
                <TopBar user={user} />
                <div className="max-w-4xl mx-auto px-6 md:px-12 py-24">
                    <div className="border-2 border-yellow-500/50 bg-yellow-950/10 p-12 text-center">
                        <h1 className="text-3xl font-bold text-yellow-500 tracking-[0.2em] uppercase mb-4">
                            Unbound Mode
                        </h1>
                        <p className="text-gray-400 font-mono text-sm mb-2">
                            No active group membership detected.
                        </p>
                        <p className="text-gray-500 font-mono text-xs mb-8">
                            You must join or create a group to access the Daily Contract system.
                        </p>
                        <a
                            href="/groups"
                            className="inline-block px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold tracking-[0.2em] text-sm uppercase transition-colors shadow-[0_0_30px_-5px_rgba(234,179,8,0.6)]"
                        >
                            Join or Create Group
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    // Show group selector if user has multiple groups and hasn't selected one
    if (requiresSelection) {
        return (
            <main className="min-h-screen bg-[#0a0e14]">
                <GroupSelector />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            <TopBar user={user} />

            {/* 1. SYSTEM DEMAND (Dominant) */}
            <section className="relative z-10">
                <SystemDemandPanel
                    mode={displayMode}
                    failureMomentum={metrics.failureMomentum}
                    pattern={metrics.pattern || undefined}
                    aggregateState={hasMultipleGroups ? {
                        drivingGroup,
                        groupStates
                    } : undefined}
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
                                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Active Liabilities</div>
                                <div className="text-sm text-red-400 font-mono">
                                    {metrics.activeLiabilities} pending penalties
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
    return <DashboardContent />;
}
