"use client";

import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";
import { useState } from "react";

// --- Types ---
export type DailyStatus = 'completed' | 'failed' | 'pending' | 'locked' | 'auto-fail' | 'none';

export interface Goal {
    id: string;
    name: string;
    discomfort: boolean;
    status: DailyStatus[];
}

// --- Components ---

export function TopBar() {
    return (
        <div className="flex items-center justify-between py-6 px-8 bg-[#050810] border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
                <div className="scale-75 opacity-80"><GCLogo /></div>
                <div className="flex flex-col">
                    <span className="text-white font-bold tracking-[0.2em] text-sm">GOD COMPLEX</span>
                    <span className="text-gray-600 text-[10px] tracking-widest">SYSTEM DASHBOARD</span>
                </div>
            </div>
            <div className="text-gray-500 text-xs font-mono tracking-widest">
                JANUARY 2026
            </div>
        </div>
    );
}

export function SystemDemandPanel() {
    // Dominant panel states: 'DECLARATION_REQUIRED' | 'EXECUTION_LOCKED' | 'RESOLUTION_REQUIRED' | 'DAY_FAILED'
    const state = 'DECLARATION_REQUIRED'; // Mock state

    return (
        <div className="w-full bg-[#050810] border-y border-[#3B82F6] shadow-[0_0_50px_-20px_rgba(59,130,246,0.5)] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Background glow animation */}
            <div className="absolute inset-0 bg-blue-900/5 animate-pulse"></div>

            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 animate-ping"></div>
                    <span className="text-blue-500 font-bold tracking-[0.2em] text-sm uppercase">System Demand</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
                    Declaration Required
                </h1>
                <p className="text-gray-400 font-mono text-xs md:text-sm max-w-xl mt-2">
                    No goals declared for today. Outcomes must be recorded to initiate the protocol.
                </p>

                <div className="flex flex-col gap-1 mt-4 border-l-2 border-red-900/30 pl-4">
                    <div className="text-[10px] text-red-500 font-mono tracking-widest uppercase">
                        Failure Momentum: +2
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                        Pattern: Inconsistent Execution
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-sm shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] transition-all uppercase">
                    Declare Goals
                </button>
            </div>
        </div>
    );
}

export function TodayGoalsPanel() {
    // Mock: No goals declared yet
    const goals: any[] = [];

    if (goals.length === 0) {
        return (
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-gray-500 tracking-[0.2em] uppercase">Today&#39;s Contract</h2>
                    <div className="h-px bg-[#1E293B] flex-1"></div>
                </div>

                <div className="border border-dashed border-[#1E293B] rounded-lg p-12 flex flex-col items-center justify-center text-center bg-[#0B101A]/50">
                    <p className="text-gray-500 font-mono text-sm mb-2">NO ACTIVE CONTRACT</p>
                    <p className="text-gray-700 text-xs">Directives must be declared daily.</p>
                </div>

                <div className="mt-4 text-center">
                    <span className="text-[10px] text-yellow-600/70 font-mono tracking-widest uppercase">
                        Declaration Delta: −12% vs 7-day average
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Today&#39;s Contract</h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contract Card */}
                {/* Will mock this later when state exists */}
            </div>
        </div>
    );
}

export function HistoricalGrid() {
    // 31 days in Jan
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Goals only show if they were active in history
    const historyGoals = [
        "God Complex [PROJECT]",
        "Neetcode 150 [DSA]",
        "Public Learning",
        "GYM",
        "Protien intake [100g]",
        "Water intake [3L]",
    ];

    // Status logic: 
    // - Days 1-14: Random data
    // - Day 15 (Fails)
    // - >15: Neutral dots (Not Declared)
    const getStatus = (day: number, goalIndex: number): DailyStatus => {
        if (day > 15) return 'none'; // Future/Not Declared -> Neutral dot
        if (day === 15) return 'failed'; // Recent fail
        // Deterministic pseudo-random for history to avoid hydration errors
        const isFailure = (day + goalIndex * 2) % 10 === 0;
        return isFailure ? 'failed' : 'completed';
    };

    return (
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">Enforcement History</h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-[200px_repeat(31,minmax(24px,1fr))] border-b border-[#1E293B]">
                        <div className="p-3 text-[10px] font-bold text-gray-600 bg-[#050810] sticky left-0 z-10 border-r border-[#1E293B]">EVIDENCE</div>
                        {days.map(d => (
                            <div key={d} className={`p-2 text-[10px] text-center font-mono border-r border-[#1E293B]/30 ${d === 15 ? 'text-red-500 bg-red-900/10' : 'text-gray-700'}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {historyGoals.map((goal, i) => (
                        <div key={i} className="grid grid-cols-[200px_repeat(31,minmax(24px,1fr))] border-b border-[#1E293B]/30 hover:bg-[#0f1623] transition-colors">
                            <div className="p-3 text-xs text-gray-400 font-mono border-r border-[#1E293B] bg-[#0B101A] sticky left-0 z-10 truncate">
                                {goal}
                            </div>

                            {days.map(d => {
                                const status = getStatus(d, i);
                                return (
                                    <div key={d} className="border-r border-[#1E293B]/20 flex items-center justify-center h-10">
                                        {status === 'completed' && <div className="w-2.5 h-2.5 bg-blue-600/60 rounded-[1px]"></div>}
                                        {status === 'failed' && <div className="w-2.5 h-2.5 bg-red-900/60 border border-red-800/50 rounded-[1px]"></div>}
                                        {status === 'none' && <div className="w-0.5 h-0.5 bg-gray-800 rounded-full"></div>}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function MonthlyGraph() {
    // Moved contextual header outside component or updated text
    const rawData = [
        60, 75, 78, 30, 80, 85, 82, 45, 90, 82, 35, 80, 85, 82, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="text-xs text-gray-500 font-mono tracking-widest uppercase">
                    Consistency Over Time
                </div>
                <div className="text-[10px] text-gray-700 uppercase tracking-widest">
                    No Interpretation
                </div>
            </div>

            <div className="h-32 bg-[#0B101A] border border-[#1E293B] rounded-sm p-0 relative overflow-hidden mb-2">
                <div className="h-full w-full flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 310 100" preserveAspectRatio="none">
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            d={`M0 100 ${rawData.map((val, i) => `L${i * 10} ${100 - val}`).join(" ")} L310 100`}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            d={`M0 100 ${rawData.map((val, i) => `L${i * 10} ${100 - val}`).join(" ")} L310 100 Z`}
                            fill="#3B82F6"
                        />
                    </svg>
                </div>
            </div>
            <div className="text-[10px] text-red-900/80 font-mono tracking-widest uppercase text-right">
                Failure Threshold: 3 days remaining before MONTH FAILURE
            </div>
        </div>
    );
}
