"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Constants ---
type PageState = "DECLARATION" | "EXECUTION" | "RESOLUTION" | "FAILED";

type Goal = {
    id: string;
    text: string;
    metricType: string;
    metricValue: string;
    discomfort: boolean;
    status?: "PENDING" | "COMPLETED" | "FAILED";
    excuse?: string;
};

// --- Contract Page ---
export default function DailyContract() {
    // DEV: Toggle for testing states
    const [state, setState] = useState<PageState>("DECLARATION");

    // Data State
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoal, setNewGoal] = useState({ text: "", metricType: "BINARY", metricValue: "", discomfort: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Actions ---

    const addGoal = () => {
        if (goals.length >= 3) return;
        if (!newGoal.text) return;

        setGoals([...goals, { ...newGoal, id: Math.random().toString(), status: "PENDING" }]);
        setNewGoal({ text: "", metricType: "BINARY", metricValue: "", discomfort: false });
    };

    const removeGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const lockContract = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setState("EXECUTION");
            setIsSubmitting(false);
        }, 1500);
    };

    // --- Components ---

    const Header = () => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 py-8 border-b border-[#1E293B]">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-[0.2em] uppercase mb-2">Daily Contract</h1>
                <p className="text-xs font-mono text-gray-500 uppercase">Valid for one day only // {new Date().toLocaleDateString()}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
                {/* Dev State Toggler */}
                <div className="flex gap-2 mb-2 justify-end opacity-20 hover:opacity-100 transition-opacity">
                    {(["DECLARATION", "EXECUTION", "RESOLUTION", "FAILED"] as PageState[]).map(s => (
                        <button key={s} onClick={() => setState(s)} className={`text-[9px] border p-1 ${state === s ? 'bg-white text-black' : 'text-gray-500'}`}>{s[0]}</button>
                    ))}
                </div>
                <div className="text-xl font-mono text-white font-bold tracking-widest">
                    {state === "DECLARATION" && "04:12:33 REMAINING"}
                    {state === "EXECUTION" && "EXECUTION LOCKED"}
                    {state === "RESOLUTION" && "RESOLUTION OPEN"}
                    {state === "FAILED" && "CONTRACT VOID"}
                </div>
            </div>
        </div>
    );

    const SystemNotice = () => {
        const notices: Record<PageState, { title: string; subtitle: string; color: string }> = {
            DECLARATION: { title: "DECLARATION REQUIRED", subtitle: "Define clear, falsifiable outcomes.", color: "text-blue-500" },
            EXECUTION: { title: "EXECUTION LOCKED", subtitle: "No intervention permitted.", color: "text-gray-500" },
            RESOLUTION: { title: "RESOLUTION REQUIRED", subtitle: "Report outcomes truthfully.", color: "text-yellow-500" },
            FAILED: { title: "DAY FAILED", subtitle: "System record updated.", color: "text-red-500" }
        };

        const current = notices[state];

        return (
            <div className="mb-12 border-l-2 border-[#1E293B] pl-6 py-2">
                <h2 className={`text-sm font-bold tracking-[0.2em] uppercase mb-1 ${current.color}`}>{current.title}</h2>
                <p className="text-xs font-mono text-gray-400">{current.subtitle}</p>
            </div>
        );
    };

    // --- Render based on State ---

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <Header />
                <SystemNotice />

                {/* DECLARATION STATE */}
                {state === "DECLARATION" && (
                    <div className="space-y-12">
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Contract Terms</h3>
                                <span className="text-[10px] font-mono text-gray-600">{goals.length} / 3 OBLIGATIONS</span>
                            </div>

                            <div className="space-y-4">
                                {goals.map((goal, i) => (
                                    <motion.div layout key={goal.id} className="p-6 border border-[#1E293B] bg-[#0B101A] flex justify-between items-center group">
                                        <div>
                                            <div className="text-[10px] text-blue-500 font-bold tracking-widest mb-1">CLAUSE 0{i + 1}</div>
                                            <div className="text-white font-mono text-sm">{goal.text}</div>
                                            <div className="text-[10px] text-gray-600 mt-1 uppercase">{goal.metricValue} {goal.metricType} {goal.discomfort && "// DISCOMFORT"}</div>
                                        </div>
                                        <button onClick={() => removeGoal(goal.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-mono text-xs">[DELETE]</button>
                                    </motion.div>
                                ))}

                                {goals.length < 3 && (
                                    <div className="p-6 border border-dashed border-[#1E293B] bg-[#0B101A]/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                value={newGoal.text}
                                                onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                                                placeholder="Goal Description (e.g. Complete Backend API)"
                                                className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none w-full"
                                            />
                                            <div className="flex gap-4">
                                                <select
                                                    value={newGoal.metricType}
                                                    onChange={(e) => setNewGoal({ ...newGoal, metricType: e.target.value })}
                                                    className="bg-[#050810] border border-[#334155] text-xs text-gray-400 p-2 font-mono outline-none"
                                                >
                                                    <option value="BINARY">Binary (Done/Not)</option>
                                                    <option value="HOURS">Hours</option>
                                                    <option value="COUNT">Count</option>
                                                </select>
                                                <input
                                                    value={newGoal.metricValue}
                                                    onChange={(e) => setNewGoal({ ...newGoal, metricValue: e.target.value })}
                                                    placeholder="Val"
                                                    className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none w-20"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newGoal.discomfort}
                                                    onChange={(e) => setNewGoal({ ...newGoal, discomfort: e.target.checked })}
                                                    className="w-3 h-3 border border-gray-600 bg-transparent"
                                                />
                                                <span className="text-[10px] text-gray-500 tracking-widest uppercase">Discomfort Protocol</span>
                                            </label>
                                            <button onClick={addGoal} disabled={!newGoal.text} className="disabled:opacity-30 px-4 py-2 bg-[#1E293B] hover:bg-blue-900 text-white text-[10px] tracking-widest uppercase transition-colors">
                                                Add Clause
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="pt-8 border-t border-[#1E293B] text-center">
                            <button
                                onClick={lockContract}
                                disabled={goals.length === 0 || isSubmitting}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-12 py-4 font-bold tracking-[0.2em] text-sm uppercase transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]"
                            >
                                {isSubmitting ? "Locking..." : "Lock Contract For Today"}
                            </button>
                            <p className="mt-4 text-[10px] text-gray-500 font-mono">
                                This contract cannot be altered once submitted.
                            </p>
                        </div>
                    </div>
                )}

                {/* EXECUTION STATE */}
                {state === "EXECUTION" && (
                    <div className="space-y-12">
                        <div className="p-12 border border-[#1E293B] bg-[#0B101A] flex flex-col items-center justify-center text-center">
                            <div className="w-3 h-3 bg-blue-500 animate-pulse mb-4"></div>
                            <h2 className="text-xl font-bold text-white tracking-[0.3em] uppercase mb-2">Contract Active</h2>
                            <p className="text-xs font-mono text-gray-500">Execution in progress. No intervention permitted.</p>
                        </div>

                        <div className="opacity-50 pointer-events-none">
                            {goals.length === 0 && <div className="text-center text-gray-600 font-mono text-xs">No goals declared (Debug View)</div>}
                            {goals.map((goal, i) => (
                                <div key={goal.id} className="p-6 border-b border-[#1E293B] flex justify-between items-center">
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">CLAUSE 0{i + 1}</div>
                                        <div className="text-white font-mono text-sm">{goal.text}</div>
                                    </div>
                                    <div className="text-[10px] text-gray-600 uppercase border border-gray-800 px-2 py-1">LOCKED</div>
                                </div>
                            ))}
                        </div>

                        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-[#0a0e14] border-t border-[#1E293B] flex justify-center z-40">
                            <button disabled className="w-full md:w-auto px-8 py-3 bg-[#1E293B] text-gray-500 font-bold tracking-[0.2em] text-[10px] uppercase cursor-not-allowed">
                                Action Locked By System
                            </button>
                        </div>
                    </div>
                )}

                {/* RESOLUTION STATE */}
                {state === "RESOLUTION" && (
                    <div className="space-y-8">
                        {goals.map((goal, i) => (
                            <div key={goal.id} className="p-8 border border-[#1E293B] bg-[#0B101A]">
                                <div className="mb-6">
                                    <div className="text-[10px] text-yellow-600 font-bold tracking-widest mb-1">RESOLUTION REQUIRED // CLAUSE 0{i + 1}</div>
                                    <div className="text-xl text-white font-mono">{goal.text}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="py-4 border border-[#334155] hover:bg-green-900/20 hover:border-green-800 text-gray-400 hover:text-green-500 font-bold tracking-[0.2em] text-xs uppercase transition-all">
                                        Completed
                                    </button>
                                    <button className="py-4 border border-[#334155] hover:bg-red-900/20 hover:border-red-800 text-gray-400 hover:text-red-500 font-bold tracking-[0.2em] text-xs uppercase transition-all group relative overflow-hidden">
                                        Failed
                                        <div className="absolute inset-0 bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-[#0a0e14] border-t border-[#1E293B] flex justify-center z-40">
                            <button className="w-full md:w-auto px-12 py-4 bg-white text-black hover:bg-gray-200 font-bold tracking-[0.2em] text-xs uppercase transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                                Submit Outcomes
                            </button>
                        </div>
                    </div>
                )}

                {/* FAILED STATE */}
                {state === "FAILED" && (
                    <div className="flex flex-col items-center justify-center py-24 border border-red-900/30 bg-red-950/5">
                        <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter uppercase mb-4">DAY FAILED</h1>
                        <p className="text-red-400 font-mono text-sm tracking-widest uppercase">System Record Updated</p>
                        <div className="mt-12 p-4 border border-red-900/50 bg-[#0a0e14]">
                            <code className="text-xs text-red-700 font-mono">ERR_PROTOCOL_VIOLATION_0X1</code>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
