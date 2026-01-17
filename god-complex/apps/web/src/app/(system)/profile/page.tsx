"use client";

import { motion } from "framer-motion";
import { TopBar } from "@/components/DashboardComponents"; // Reuse top bar or create simpler header

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-12">
            <h2 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-6 flex items-center gap-4">
                {title}
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </h2>
            {children}
        </section>
    );
}

function ReadOnlyField({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex flex-col gap-2 p-4 border border-[#1E293B] bg-[#0B101A]/50 rounded-sm">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
            <span className={`font-mono text-sm ${highlight ? 'text-green-500' : 'text-white'}`}>{value}</span>
        </div>
    );
}

export default function Profile() {
    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            {/* Header - Simpler than dashboard */}
            <div className="px-8 py-8 md:px-12 md:py-12 border-b border-[#1E293B] bg-[#050810]">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase mb-2">My Profile</h1>
                <p className="text-xs font-mono text-gray-500">Identity and system constraints</p>
            </div>

            <div className="max-w-4xl mx-auto p-8 md:p-12">

                {/* 4.1 SYSTEM IDENTITY */}
                <Section title="01 // System Identity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="Email Identity" value="user@example.com" />
                        <ReadOnlyField label="Account ID" value="GC-8812-X9" />
                        <ReadOnlyField label="Protocol Version" value="v1.0.4 - BETA" />
                        <ReadOnlyField label="System Status" value="ACTIVE" highlight />
                    </div>
                </Section>

                {/* 4.2 BASELINE CAPACITY */}
                <Section title="02 // Baseline Capacity">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Daily Capacity</label>
                            <select disabled className="bg-[#0B101A] border border-[#1E293B] text-white p-3 font-mono text-sm opacity-50 cursor-not-allowed">
                                <option>4 Hours / Day</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Timezone</label>
                            <input disabled type="text" value="Asia/Kolkata (IST)" className="bg-[#0B101A] border border-[#1E293B] text-white p-3 font-mono text-sm opacity-50 cursor-not-allowed" />
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono">
                        * Capacity changes take effect next cycle. Past obligations remain.
                    </p>
                </Section>

                {/* 4.3 COMMITMENT BASELINE */}
                <Section title="03 // Commitment Baseline">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ReadOnlyField label="Avg Daily Goals" value="5.2" />
                        <ReadOnlyField label="Avg Difficulty" value="HIGH" />
                        <div className="flex flex-col gap-2 p-4 border border-[#1E293B] bg-[#0B101A]/50 rounded-sm">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Delta Trend</span>
                            <span className="font-mono text-sm text-red-500">▼ 12%</span>
                        </div>
                    </div>
                </Section>

                {/* 4.4 SYSTEM HISTORY */}
                <Section title="04 // System History">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ReadOnlyField label="Days Active" value="14" />
                        <ReadOnlyField label="Failed Days" value="3" />
                        <ReadOnlyField label="Longest Streak" value="9 Days" />
                        <ReadOnlyField label="Total Excuses" value="4" />
                    </div>
                </Section>

                {/* 4.5 ACCOUNT CONTROL */}
                <div className="mt-24 pt-12 border-t border-red-900/30">
                    <h2 className="text-red-700 font-bold tracking-[0.2em] text-sm uppercase mb-4">Danger Zone</h2>
                    <div className="flex items-center justify-between p-6 border border-red-900/30 bg-red-950/5 rounded-sm">
                        <div>
                            <div className="text-white font-bold text-sm mb-1">Deactivate Account</div>
                            <div className="text-[10px] text-red-400 font-mono">Deactivation does not erase enforcement records.</div>
                        </div>
                        <button className="px-6 py-3 border border-red-800 text-red-600 hover:bg-red-950/30 text-xs font-bold tracking-[0.2em] uppercase transition-colors">
                            Deactivate
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
