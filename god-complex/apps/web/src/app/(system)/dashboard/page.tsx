"use client";
import { useState, useEffect } from "react";
import { TopBar, SystemDemandPanel, TodayGoalsPanel, MonthlyGraph, Leaderboard } from "@/components/DashboardComponents";
import { ContractHistoryList, AggregatePerformanceWidget } from "@/components/ContractHistory";
import GroupSelector from "@/components/GroupSelector";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useTodayGoals } from "@/hooks/useTodayGoals";
import { useSystemMode, useAggregateSystemMode } from "@/hooks/useSystemMode";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useContractHistory, useAggregateMetrics } from "@/hooks/useContractHistory";
import { useLeaderboard } from "@/hooks/useLeaderboard";
function DashboardContent() {
    const { user, userLoading, loading: contextLoading, error: contextError, requiresSelection, availableGroups, hasNoGroups, groupId } = useDashboardContext();
    const { goals, loading: goalsLoading } = useTodayGoals();
    const { mode, loading: modeLoading } = useSystemMode();
    const { aggregateMode, drivingGroup, groupStates, loading: aggregateLoading } = useAggregateSystemMode();
    const { metrics, loading: metricsLoading } = useDashboardMetrics();
    const { contracts, loading: contractHistoryLoading } = useContractHistory();
    const aggregateMetrics = useAggregateMetrics(contracts);
    const { leaderboard, loading: leaderboardLoading } = useLeaderboard();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const waitingForGroupData = !hasNoGroups && !requiresSelection && groupId;
    useEffect(() => {
        const isLoading = userLoading || contextLoading || (waitingForGroupData && (goalsLoading || modeLoading || metricsLoading || aggregateLoading));
        if (isLoading) {
            const timer = setTimeout(() => {
                setLoadingTimeout(true);
            }, 15000);
            return () => clearTimeout(timer);
        }
        else {
            setLoadingTimeout(false);
        }
    }, [userLoading, contextLoading, goalsLoading, modeLoading, metricsLoading, aggregateLoading, waitingForGroupData]);
    const loading = userLoading || contextLoading || (waitingForGroupData && (goalsLoading || modeLoading || metricsLoading || aggregateLoading));
    const error = contextError;
    const hasMultipleGroups = availableGroups.length > 1;
    const displayMode = hasMultipleGroups ? aggregateMode : mode;
    if (loading) {
        return (<main className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center gap-6">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    LOADING SYSTEM DATA...
                </div>
                <div className="text-xs font-mono text-gray-700 flex flex-col gap-1 items-center">
                   <span>User: {userLoading ? "Loading..." : "Done"}</span>
                   <span>Context: {contextLoading ? "Loading..." : "Done"}</span>
                   {waitingForGroupData && (<>
                           <span>Goals: {goalsLoading ? "Loading..." : "Done"}</span>
                           <span>Mode: {modeLoading ? "Loading..." : "Done"}</span>
                           <span>Metrics: {metricsLoading ? "Loading..." : "Done"}</span>
                           <span>Aggregate: {aggregateLoading ? "Loading..." : "Done"}</span>
                           <span>Contracts: {contractHistoryLoading ? "Loading..." : "Done"}</span>
                           <span>Leaderboard: {leaderboardLoading ? "Loading..." : "Done"}</span>
                       </>)}
                </div>
                {loadingTimeout && (<div className="text-center space-y-4">
                        <p className="text-yellow-500 font-mono text-xs">
                            Loading is taking longer than expected...
                        </p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono tracking-widest rounded">
                            RETRY
                        </button>
                        <p className="text-gray-600 font-mono text-[10px]">
                            If this persists, check if backend is running on port 4000
                        </p>
                    </div>)}
            </main>);
    }
    if (error || !user) {
        return (<main className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center gap-6">
                <div className="text-red-500 font-mono text-sm tracking-widest">
                    ERROR: {error || "Failed to load user data"}
                </div>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono tracking-widest rounded">
                    RETRY
                </button>
            </main>);
    }
    if (hasNoGroups) {
        return (<main className="min-h-screen bg-[#0a0e14] pb-32">
                <TopBar user={user}/>
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
                        <a href="/groups" className="inline-block px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold tracking-[0.2em] text-sm uppercase transition-colors shadow-[0_0_30px_-5px_rgba(234,179,8,0.6)]">
                            Join or Create Group
                        </a>
                    </div>
                </div>
            </main>);
    }
    if (requiresSelection) {
        return (<main className="min-h-screen bg-[#0a0e14]">
                <GroupSelector />
            </main>);
    }
    return (<main className="min-h-screen bg-[#0a0e14] pb-32">
            <TopBar user={user}/>

            
            <section className="relative z-10">
                <SystemDemandPanel mode={displayMode} failureMomentum={metrics.failureMomentum} pattern={metrics.pattern || undefined} aggregateState={hasMultipleGroups ? {
            drivingGroup,
            groupStates
        } : undefined}/>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-12">

                
                <TodayGoalsPanel goals={goals} declarationDelta={metrics.declarationDelta} systemMode={hasMultipleGroups ? aggregateMode : mode} groupId={groupId || undefined} currentDate={user ? new Date().toISOString().split('T')[0] : undefined} onRefresh={() => window.location.reload()}/>

                
                <AggregatePerformanceWidget rollingCompletion7Day={aggregateMetrics.rollingCompletion7Day} rollingCompletion30Day={aggregateMetrics.rollingCompletion30Day} currentStreak={aggregateMetrics.currentStreak} failureMomentum={aggregateMetrics.failureMomentum}/>

                
                <ContractHistoryList contracts={contracts} loading={contractHistoryLoading}/>

                
                <div className="pt-8 border-t border-[#1E293B]">
                    <Leaderboard leaderboard={leaderboard} currentUserId={user.id}/>
                </div>
            </div>
        </main>);
}
export default function Dashboard() {
    return <DashboardContent />;
}
