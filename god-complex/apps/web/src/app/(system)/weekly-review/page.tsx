"use client";

import { motion } from "framer-motion";

// --- Types ---
type Verdict = "STABLE" | "UNSTABLE" | "FAILED";
type DayStatus = "COMPLIANT" | "FAILED" | "AUTO_FAILED";

// --- Components ---

const StatusBadge = ({ status }: { status: DayStatus }) => {
    const colors = {
        COMPLIANT: "text-blue-500",
        FAILED: "text-red-500",
        AUTO_FAILED: "text-red-700",
    };
    return <span className={`font-mono text-xs ${colors[status]}`}>{status.replace("_", " ")}</span>;
};

export default function WeeklyReview() {
    // Mock Data
    const verdict: Verdict = "UNSTABLE";
    const weekRange = "JAN 15 – JAN 21";
    const weekNumber = "WEEK 3";

    const dailyBreakdown = [
        { day: "MON", goals: 3, completed: 3, failed: 0, status: "COMPLIANT" },
        { day: "TUE", goals: 3, completed: 3, failed: 0, status: "COMPLIANT" },
        { day: "WED", goals: 3, completed: 1, failed: 2, status: "FAILED" },
        { day: "THU", goals: 3, completed: 3, failed: 0, status: "COMPLIANT" },
        { day: "FRI", goals: 3, completed: 0, failed: 3, status: "AUTO_FAILED" },
        { day: "SAT", goals: 3, completed: 3, failed: 0, status: "COMPLIANT" },
        { day: "SUN", goals: 3, completed: 2, failed: 1, status: "FAILED" },
    ] as const;

    // Use cold, judicial colors. Amber is removed.
    const verdictColor = {
        STABLE: "text-blue-300 border-blue-900/30 bg-blue-950/5",
        UNSTABLE: "text-slate-300 border-slate-700/50 bg-slate-900/20", // Muted gray-blue
        FAILED: "text-red-500 border-red-900/30 bg-red-950/5",
    };

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans selection:bg-blue-500/20">

            {/* Header */}
            <div className="flex justify-between items-end mb-20 border-b border-[#1E293B] pb-6 opacity-60 hover:opacity-100 transition-opacity">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-300 tracking-[0.2em] uppercase mb-1">Weekly Review</h1>
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Judicial Summary // {weekRange}</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-gray-400 tracking-widest">{weekNumber}</div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-24">

                {/* 1. VERDICT (Re-styled: Stamp-like, contained) */}
                <section className="flex flex-col items-center">
                    <div className={`px-10 py-6 border flex flex-col items-center justify-center text-center ${verdictColor[verdict]} backdrop-blur-sm`}>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase opacity-90 mb-2">{verdict}</h2>
                        <div className="w-full h-px bg-current opacity-20 mb-2"></div>
                        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                            System Classification
                        </p>
                    </div>
                </section>

                {/* 2. SYSTEM JUDGMENT (Dominant) */}
                <section className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e14] via-transparent to-[#0a0e14] z-10 pointer-events-none"></div>
                    <div className="border-y border-gray-800 py-16 text-center space-y-8 relative">
                        <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase absolute top-4 left-1/2 -translate-x-1/2">
                            Final Judgment
                        </h3>

                        <div className="space-y-4">
                            <div className="text-3xl md:text-4xl text-gray-200 font-bold tracking-widest uppercase">
                                Avoidance Escalation
                            </div>
                            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
                                Pattern detected in mid-week execution. Failure to correct course on Day 5 suggests breakdown of discipline.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                    {/* 3. FAILURE ANALYSIS (Demoted, Side-note) */}
                    <section className="md:col-span-4 md:col-start-2">
                        <div className="border-l border-red-900/20 pl-6 py-2 space-y-4">
                            <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-4">
                                Failure Factors
                            </h3>

                            <div className="space-y-1">
                                <div className="text-2xl font-mono text-red-500/80">6</div>
                                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Total Failures</div>
                            </div>

                            <div className="space-y-1 pt-2">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Primary Excuse</div>
                                <div className="text-xs font-mono text-gray-400">"Too Tired / Late"</div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-900">
                                <div className="text-[10px] text-red-700/70 font-mono uppercase tracking-widest">
                                    Momentum: +1 (Negative)
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. EVIDENCE RECORD (Archived/Collapsed feel) */}
                    <section className="md:col-span-6">
                        <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-4 text-right">
                            Evidence Log
                        </h3>

                        <div className="border-t border-b border-gray-800/50 bg-[#0B101A]/30">
                            {dailyBreakdown.map((day, i) => (
                                <div key={i} className="grid grid-cols-4 py-2 px-2 border-b border-gray-800/30 items-center hover:bg-[#0f1623]/50 transition-colors group">
                                    <div className="font-mono text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">{day.day}</div>
                                    <div className="font-mono text-[10px] text-gray-600 text-center">{day.completed}/{day.goals}</div>
                                    <div className="font-mono text-[10px] text-right col-span-2">
                                        <StatusBadge status={day.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-[9px] text-gray-700 font-mono uppercase tracking-widest opacity-50">
                                End of Record
                            </span>
                        </div>
                    </section>

                </div>

            </div>
        </main>
    );
}
