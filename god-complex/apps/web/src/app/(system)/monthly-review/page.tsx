"use client";

// --- Types ---
type MonthVerdict = "CONSISTENT" | "FAILED";

export default function MonthlyReview() {
    // Mock Data
    const verdict: MonthVerdict = "FAILED";
    const month = "JANUARY 2026";
    const cycleStatus = "CLOSED";

    // Stats
    const totalDays = 31;
    const daysCompliant = 18;
    const daysFailed = 13;
    const autoFails = 4;
    const efficiency = 58; // %

    // Failure Threshold Mock
    const failureDay = 18;
    const remainingDays = totalDays - failureDay;

    const verdictColors = {
        CONSISTENT: "text-blue-300 border-blue-900/30 bg-blue-950/5",
        FAILED: "text-red-500 border-red-900/30 bg-red-950/5",
    };

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
                            Month Failed — Failure Threshold Breached on Day {failureDay}
                        </p>
                    </div>
                </section>

                {/* 2. FAILURE THRESHOLD REPORT */}
                <section className="md:w-3/4 mx-auto">
                    <div className="border border-red-900/20 bg-red-950/5 p-6 text-center space-y-2">
                        <div className="text-[10px] font-bold text-red-600 tracking-[0.2em] uppercase mb-2">
                            Irreversible Point
                        </div>
                        <p className="text-sm text-gray-400 font-mono">
                            Failure became irreversible on <span className="text-gray-200">Day {failureDay}</span>.
                        </p>
                        <p className="text-xs text-gray-600">
                            {remainingDays} days remaining were insufficient for recovery.
                        </p>
                    </div>
                </section>

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

                {/* 4. SYSTEM JUDGMENT */}
                <section className="py-12 border-y border-gray-800 text-center">
                    <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase mb-6">
                        System Conclusion
                    </h3>
                    <div className="text-2xl md:text-3xl text-gray-200 font-bold tracking-widest uppercase mb-4">
                        Pattern Confirmed: Chronic Avoidance
                    </div>
                    <div className="w-12 h-0.5 bg-red-900/50 mx-auto"></div>
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
