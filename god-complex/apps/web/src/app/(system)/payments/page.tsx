"use client";
import { motion } from "framer-motion";

export default function PaymentsPage() {
    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans selection:bg-red-900/20 flex items-center justify-center">
            <div className="max-w-2xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border border-[#1E293B] bg-[#0B101A] p-12 md:p-16"
                >
                    <div className="mb-6">
                        <div className="text-6xl mb-4 opacity-50">🔨</div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-300 tracking-[0.2em] uppercase mb-4">
                            Feature in Progress
                        </h1>
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-8">
                            Payments & Financial Enforcement
                        </p>
                    </div>

                    <div className="space-y-4 text-left bg-[#050810] border-l-2 border-blue-500/50 p-6">
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The payments and financial enforcement system is currently under development. This feature will provide:
                        </p>
                        <ul className="text-sm text-gray-400 space-y-2 ml-4 list-disc">
                            <li>Real-time stake management and enforcement</li>
                            <li>Automated penalty execution</li>
                            <li>Payment method management</li>
                            <li>Transaction history and records</li>
                            <li>Multi-currency support</li>
                        </ul>
                        <p className="text-xs text-gray-600 mt-4 italic">
                            Expected availability: August 2026
                        </p>
                    </div>

                    <div className="mt-8">
                        <a
                            href="/dashboard"
                            className="inline-block px-6 py-3 bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            ← Back to Dashboard
                        </a>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
