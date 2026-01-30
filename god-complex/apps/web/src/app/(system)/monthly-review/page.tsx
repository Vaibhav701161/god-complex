"use client";

import { useMemo } from "react";
import { useDashboardContext } from "@/context/DashboardContext";
import { useMonthlyHistory } from "@/hooks/useMonthlyHistory";
import { useMonthlyOutcome } from "@/hooks/useMonthlyOutcome";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { calculateFailureThresholdDay, getDaysInMonth, formatMonth } from "@/lib/dateUtils";

// --- Types ---
type MonthVerdict = "CONSISTENT" | "FAILED";

export default function MonthlyReview() {
    const { selectedGroupId, currentMonth } = useDashboardContext();
    const { history, loading: historyLoading, error: historyError } = useMonthlyHistory();
    const { outcome, loading: outcomeLoading, isClosed } = useMonthlyOutcome();
    const { metrics, loading: metricsLoading } = useDashboardMetrics();

    // Calculate month stats
    const { verdict, totalDays, daysCompliant, daysFailed, autoFails, efficiency, failureDay } = useMemo(() => {
        const totalDays = getDaysInMonth(currentMonth);
        
        let daysCompliant = 0;
        let daysFailed = 0;
        let autoFails = 0;

        history.forEach((day) => {
            const hasAutoFail = day.goals.some(g => g.status === 'auto-fail');
            const hasFailure = day.goals.some(g => g.status === 'failed' || g.status === 'auto-fail');
            
            if (hasAutoFail) {
                autoFails++;
            }
            
            if (hasFailure) {
                daysFailed++;
            } else {
                daysCompliant++;
            }
        });

        const efficiency = history.size > 0 ? Math.round((daysCompliant / history.size) * 100) : 0;

        // Calculate failure threshold day if month is closed
        let failureDay: number | null = null;
        if (isClosed && outcome?.userOutcome) {
            const requiredScore = 80; // From contract
            const maxDailyScore = 10; // From contract
            failureDay = calculateFailureThresholdDay(history, totalDays, requiredScore, maxDailyScore);
        }

        // Determine verdict
        const verdict: MonthVerdict = isClosed && outcome?.userOutcome?.finalScore 
            ? (outcome.userOutcome.finalScore >= 80 ? "CONSISTENT" : "FAILED")
            : "FAILED";

        return { verdict, totalDays, daysCompliant, daysFailed, autoFails, efficiency, failureDay };
    }, [history, currentMonth, isClosed, outcome]);

    const loading = historyLoading || outcomeLoading || metricsLoading;
    const month = formatMonth(currentMonth);
    const cycleStatus = isClosed ? "CLOSED" : "IN PROGRESS";

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans">
                <div className="max-w-3xl mx-auto text-center pt-24">
                    <p className="text-gray-500 font-mono text-sm">Loading monthly review...</p>
                </div>
            </main>
        );
    }

    if (historyError) {
        return (
            <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans">
                <div className="max-w-3xl mx-auto text-center pt-24">
                    <p className="text-red-500 font-mono text-sm">Failed to load monthly data</p>
                </div>
            </main>
        );
    }

    if (!isClosed) {
        return (
            <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans">
                <div className="max-w-3xl mx-auto text-center pt-24">
                    <div className="border border-gray-700 p-8 inline-block">
                        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-2">Month In Progress</p>
                        <p className="text-gray-600 font-mono text-xs">Monthly review will be available after {month} closes</p>
                        <div className="mt-6 grid grid-cols-3 gap-6">
                            <div>
                                <div className="text-2xl font-mono text-gray-300">{daysCompliant}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Compliant</div>
                            </div>
                            <div>
                                <div className="text-2xl font-mono text-red-500">{daysFailed}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Failed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-mono text-gray-500">{efficiency}%</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Current</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const verdictColors = {
        CONSISTENT: "text-blue-300 border-blue-900/30 bg-blue-950/5",
        FAILED: "text-red-500 border-red-900/30 bg-red-950/5",
    };

    const remainingDays = failureDay ? totalDays - failureDay : 0;
    const failureMessage = failureDay 
        ? `Failure became irreversible on Day ${failureDay}.`
        : "Month still in progress";


    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans selection:bg-red-900/20">

            {/* Header */}
            <div className="flex justify-between items-end mb-24 border-b border-[#1E293B] pb-6 opacity-60 hover:opacity-100 transition-opacity">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-300 tracking-[0.2em] uppercase mb-1">Monthly Review</h1>
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Final Enforcement Record // Cycle {cycleStatus}</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-gray-400 tracking-widest">{month}</div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-24">

                {/* 1. MONTH VERDICT (Dominant) */}
                <section className="flex flex-col items-center">
                    <div className={`px-16 py-10 border flex flex-col items-center justify-center text-center ${verdictColors[verdict]} backdrop-blur-sm`}>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase opacity-90 mb-4">{verdict}</h2>
                        <div className="w-full h-px bg-current opacity-20 mb-4"></div>
                        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                            {verdict === "FAILED" && failureDay 
                                ? `Month Failed — Failure Threshold Breached on Day ${failureDay}`
                                : verdict === "CONSISTENT"
                                ? "Month Passed — Contract Fulfilled"
                                : "Final Verdict Pending"}
                        </p>
                    </div>
                </section>

                {/* 2. FAILURE THRESHOLD REPORT */}
                {failureDay && (
                    <section className="md:w-3/4 mx-auto">
                        <div className="border border-red-900/20 bg-red-950/5 p-6 text-center space-y-2">
                            <div className="text-[10px] font-bold text-red-600 tracking-[0.2em] uppercase mb-2">
                                Irreversible Point
                            </div>
                            <p className="text-sm text-gray-400 font-mono">
                                {failureMessage}
                            </p>
                            <p className="text-xs text-gray-600">
                                {remainingDays} days remaining were insufficient for recovery.
                            </p>
                        </div>
                    </section>
                )}

                {/* 3. MONTH SUMMARY (Evidence) */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1E293B] border border-[#1E293B]">
                        <div className="bg-[#0B101A] p-6 text-center">
                            <div className="text-2xl font-mono text-gray-300 mb-1">{totalDays}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest">Total Days</div>
                        </div>
                        <div className="bg-[#0B101A] p-6 text-center">
                            <div className="text-2xl font-mono text-blue-400 mb-1">{daysCompliant}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest">Compliant</div>
                        </div>
                        <div className="bg-[#0B101A] p-6 text-center">
                            <div className="text-2xl font-mono text-red-500 mb-1">{daysFailed}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest">Failed</div>
                        </div>
                        <div className="bg-[#0B101A] p-6 text-center">
                            <div className="text-2xl font-mono text-red-700 mb-1">{autoFails}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest">Auto-Fails</div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-2">
                        <div className="text-[10px] text-gray-700 uppercase tracking-widest">
                            Efficiency Rating
                        </div>
                        <div className="text-lg font-mono text-gray-500">{efficiency}%</div>
                    </div>
                </section>

                {/* 3.5 MONTHLY OUTCOME DATA */}
                {isClosed && outcome?.userOutcome && (
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-4 text-center">
                            Monthly Results
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#1E293B] border border-[#1E293B]">
                            <div className="bg-[#0B101A] p-6 text-center">
                                <div className="text-2xl font-mono text-blue-400 mb-1">{outcome.userOutcome.finalScore}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Final Score</div>
                            </div>
                            <div className="bg-[#0B101A] p-6 text-center">
                                <div className="text-2xl font-mono text-gray-300 mb-1">#{outcome.userOutcome.rank}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Rank</div>
                            </div>
                            <div className="bg-[#0B101A] p-6 text-center">
                                <div className="text-2xl font-mono text-gray-400 mb-1">{outcome.userOutcome.averageDailyScore.toFixed(1)}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Avg Daily</div>
                            </div>
                            <div className="bg-[#0B101A] p-6 text-center">
                                <div className="text-2xl font-mono text-gray-400 mb-1">{outcome.userOutcome.activeDays}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Active Days</div>
                            </div>
                            <div className="bg-[#0B101A] p-6 text-center">
                                <div className="text-2xl font-mono text-green-500 mb-1">${outcome.userOutcome.payoutAmount}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Payout</div>
                            </div>
                            <div className="bg-[#0B101A] p-6 text-center">
                                <div className="text-2xl font-mono text-red-500 mb-1">${outcome.userOutcome.penaltyAmount}</div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Penalty</div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. SYSTEM JUDGMENT */}
                <section className="py-12 border-y border-gray-800 text-center">
                    <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase mb-6">
                        System Conclusion
                    </h3>
                    <div className="text-2xl md:text-3xl text-gray-200 font-bold tracking-widest uppercase mb-4">
                        {metrics.pattern ? `Pattern Confirmed: ${metrics.pattern}` : "Pattern Analysis Complete"}
                    </div>
                    <div className="w-12 h-0.5 bg-red-900/50 mx-auto"></div>
                    
                    {/* Metrics Display */}
                    <div className="mt-8 grid grid-cols-2 gap-6 max-w-md mx-auto">
                        <div className="text-center">
                            <div className="text-xl font-mono text-gray-400 mb-1">{metrics.failureMomentum > 0 ? '+' : ''}{metrics.failureMomentum}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest">Failure Momentum</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-mono text-gray-400 mb-1">{metrics.efficiency}%</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest">Monthly Efficiency</div>
                        </div>
                    </div>
                </section>

                {/* 5. ARCHIVAL NOTICE */}
                <section className="text-center opacity-40">
                    <div className="inline-block border border-gray-700 p-4">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                            This record is archived
                        </p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">
                            Monthly verdicts cannot be altered
                        </p>
                    </div>
                </section>

            </div>
        </main>
    );
}
