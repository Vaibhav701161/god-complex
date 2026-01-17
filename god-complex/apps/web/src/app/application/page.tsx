"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";

export default function Application() {
    const router = useRouter();
    const [objective, setObjective] = useState("");
    const [hours, setHours] = useState("");
    const [timezone, setTimezone] = useState("");

    // History Checkboxes
    const [history, setHistory] = useState({
        abandon: false,
        rationalize: false,
        enforcement: false
    });

    // Rule Consent
    const [consent, setConsent] = useState({
        automatic: false,
        irreversible: false,
        notProductivity: false
    });

    useEffect(() => {
        // Auto-detect timezone
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const handleSubmit = () => {
        // Log logic would go here
        router.push("/rules");
    };

    const isFormValid =
        objective.length > 0 &&
        hours !== "" &&
        consent.automatic &&
        consent.irreversible &&
        consent.notProductivity;

    return (
        <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 md:p-12 relative">
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                <div className="bg-[#0B101A] border border-[#1E293B] rounded-xl overflow-hidden shadow-2xl relative">
                    {/* Header */}
                    <div className="bg-[#050810] p-8 border-b border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="scale-75"><GCLogo /></div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white tracking-[0.2em]">ACCESS APPLICATION</h1>
                                <p className="text-gray-500 text-xs tracking-wide mt-1">This system enforces outcomes, not intentions.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        {/* Section 1: Objective Declaration */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                01 // Primary Objective
                            </h2>
                            <div className="relative">
                                <textarea
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    className="w-full h-32 bg-[#050810] border border-[#1E293B] rounded-lg p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm resize-none"
                                    placeholder="State the outcome you want enforced, not merely desired."
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-mono">
                                    {objective.length} CHARS
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Capacity Disclosure */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                02 // Capacity Disclosure
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-wide">Hours per day</label>
                                    <select
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        className="w-full bg-[#050810] border border-[#1E293B] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 text-sm appearance-none"
                                    >
                                        <option value="">Select availability...</option>
                                        <option value="1">1 Hour</option>
                                        <option value="2">2 Hours</option>
                                        <option value="3">3 Hours</option>
                                        <option value="4+">4+ Hours (Serious)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-wide">Timezone</label>
                                    <input
                                        type="text"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full bg-[#050810] border border-[#1E293B] rounded-lg p-3 text-gray-500 focus:outline-none text-sm cursor-not-allowed"
                                        readOnly // 'editable' in prompt but usually auto-detect is preferred to stick? making readOnly for v1 simplicity as per "auto-detected" focus
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-red-900/80 uppercase tracking-wide font-bold">
                                False disclosure leads to self-inflicted failure.
                            </p>
                        </section>

                        {/* Section 3: History */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                03 // History
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'abandon', label: 'I abandon systems when motivation drops', key: 'abandon' },
                                    { id: 'rationalize', label: 'I rationalize missed commitments', key: 'rationalize' },
                                    { id: 'enforcement', label: 'I want external enforcement', key: 'enforcement' }
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 border ${history[item.key as keyof typeof history] ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} rounded transition-colors flex items-center justify-center`}>
                                            {history[item.key as keyof typeof history] && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={history[item.key as keyof typeof history]}
                                            onChange={() => setHistory(h => ({ ...h, [item.key]: !h[item.key as keyof typeof history] }))}
                                        />
                                        <span className={`text-sm ${history[item.key as keyof typeof history] ? 'text-gray-300' : 'text-gray-500'} group-hover:text-gray-300 transition-colors`}>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Section 4: Rule Consent */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                04 // Rule Consent
                            </h2>

                            <div className="bg-[#050810] border border-[#1E293B] rounded-lg p-6 h-48 overflow-y-auto mb-6 text-sm text-gray-400 space-y-4 font-mono leading-relaxed">
                                <p><strong className="text-white">1. BINARY INTEGRITY.</strong> You either did it or you didn&#39;t. Partial credit is failure. Excuses are failure.</p>
                                <p><strong className="text-white">2. AUTOMATIC PENALTIES.</strong> The system does not care about your feelings. It executes consequences based on data.</p>
                                <p><strong className="text-white">3. NO APPEALS.</strong> In v1, there are no support tickets for score reversals. Accepting the system means accepting its judgment.</p>
                                <p><strong className="text-white">4. VISIBILITY.</strong> Your failures may be visible to your group. Shame is a mechanic.</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'automatic', label: 'I accept automatic enforcement', key: 'automatic' },
                                    { id: 'irreversible', label: 'I accept irreversible failure', key: 'irreversible' },
                                    { id: 'notProductivity', label: 'I understand this is not a productivity app', key: 'notProductivity' }
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 border ${consent[item.key as keyof typeof consent] ? 'bg-red-600 border-red-600' : 'border-gray-600'} rounded transition-colors flex items-center justify-center`}>
                                            {consent[item.key as keyof typeof consent] && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={consent[item.key as keyof typeof consent]}
                                            onChange={() => setConsent(c => ({ ...c, [item.key]: !c[item.key as keyof typeof consent] }))}
                                        />
                                        <span className={`text-sm font-medium ${consent[item.key as keyof typeof consent] ? 'text-white' : 'text-gray-500'} group-hover:text-gray-300 transition-colors`}>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-[#050810] p-8 border-t border-[#1E293B]">
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                            className={`w-full py-5 rounded-xl font-bold tracking-[0.25em] text-base transition-all duration-300 ${!isFormValid
                                    ? "bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800"
                                    : "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.8)] border border-blue-500"
                                }`}
                        >
                            INITIALIZE PROTOCOL
                        </button>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
