"use client";

import { TopBar, SystemDemandPanel, TodayGoalsPanel, HistoricalGrid, MonthlyGraph } from "@/components/DashboardComponents";

export default function Dashboard() {
    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            <TopBar />

            {/* 1. SYSTEM DEMAND (Dominant) */}
            <section className="relative z-10">
                <SystemDemandPanel />
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-12">

                {/* 2. TODAY'S DECLARATION / STATUS */}
                <TodayGoalsPanel />

                {/* 3. HISTORICAL ENFORCEMENT VIEW (Secondary) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8 border-t border-[#1E293B]">
                    <div className="lg:col-span-3">
                        <HistoricalGrid />
                    </div>
                    <div className="lg:col-span-1 border-l border-[#1E293B] pl-0 lg:pl-12">
                        {/* Summary / Graph - demoted to sidebar feel */}
                        <div className="mb-8">
                            <div className="text-4xl font-bold text-white font-mono mb-2">41.5%</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Efficiency</div>

                            <div className="border-t border-[#1E293B] pt-4">
                                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Excuse Debt</div>
                                <div className="text-sm text-red-400 font-mono">4 active liabilities</div>
                            </div>
                        </div>
                        <MonthlyGraph />
                    </div>
                </div>
            </div>
        </main>
    );
}
