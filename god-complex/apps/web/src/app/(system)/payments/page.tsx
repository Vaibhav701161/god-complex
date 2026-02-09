"use client";
import { motion } from "framer-motion";
type EnforcementStatus = "ACTIVE" | "NO_STAKE" | "SUSPENDED";
type TransactionResult = "DEBITED" | "HELD" | "FORFEITED";
interface Transaction {
    id: string;
    timestamp: string;
    event: string;
    amount: number;
    result: TransactionResult;
}
export default function PaymentsPage() {
    const status: EnforcementStatus = "ACTIVE";
    const stakeAmount = 5000;
    const currency = "₹";
    const cycle = "January 2026";
    const scope = "Group Contract (Alpha Squad)";
    const transactions: Transaction[] = [
        { id: "tx_103", timestamp: "Jan 18 09:00", event: "AUTO_FAIL_TRIGGERED (Day 18)", amount: 500, result: "DEBITED" },
        { id: "tx_102", timestamp: "Jan 15 23:59", event: "MISSED_DECLARATION", amount: 200, result: "DEBITED" },
        { id: "tx_101", timestamp: "Jan 10 09:00", event: "GOAL_FAILED", amount: 100, result: "DEBITED" },
        { id: "tx_100", timestamp: "Jan 01 00:00", event: "CYCLE_STAKE_LOCKED", amount: 5000, result: "HELD" },
    ];
    const resultColors = {
        DEBITED: "text-red-500",
        HELD: "text-blue-400",
        FORFEITED: "text-red-600 font-bold",
    };
    return (<main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans selection:bg-red-900/20">

            
            <div className="flex justify-between items-end mb-16 border-b border-[#1E293B] pb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-300 tracking-[0.2em] uppercase mb-1">Payments</h1>
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Financial Enforcement Record</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">Status</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-sm font-bold text-white tracking-widest">{status}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-16">

                
                <section>
                    <div className="bg-[#0B101A] border border-[#1E293B] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <svg className="w-16 h-16 text-[#1E293B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="2" y="5" width="20" height="14" rx="2"/>
                                <line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                        </div>

                        <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-6"> Active Stake // {cycle}</h2>

                        <div className="flex flex-col md:flex-row items-baseline gap-2 mb-4">
                            <span className="text-5xl md:text-6xl font-mono text-white font-bold tracking-tighter">{currency}{stakeAmount.toLocaleString()}</span>
                            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest border border-blue-900/30 bg-blue-950/10 px-2 py-1 rounded-sm">Locked</span>
                        </div>

                        <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            Bound to: {scope}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                            Penalty Schedule
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                        </h3>
                        <div className="bg-[#0B101A]/50 border-l-2 border-[#1E293B] pl-6 py-2 space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-gray-400">Missed Declaration</span>
                                <span className="text-xs font-mono text-red-500">₹200</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-gray-400">Auto-Failed Day</span>
                                <span className="text-xs font-mono text-red-500">₹500</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-gray-400">Monthly Failure</span>
                                <span className="text-xs font-mono text-red-600 font-bold">FORFEIT ALL</span>
                            </div>

                            <div className="pt-4 mt-2">
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
                                    Penalties are executed automatically.<br />No manual overrides.
                                </p>
                            </div>
                        </div>
                    </section>

                    
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                            Source Method
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                        </h3>
                        <div className="border border-[#1E293B] bg-[#050810] p-6 text-center">
                            <div className="text-sm text-gray-300 font-mono mb-2">•••• •••• •••• 4242</div>
                            <div className="text-[10px] text-green-500 uppercase tracking-widest mb-6 flex items-center justify-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Verified
                            </div>

                            <button className="w-full py-3 bg-[#1E293B]/20 border border-[#1E293B] hover:bg-[#1E293B]/40 text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                                Update Method
                            </button>
                            <p className="text-[9px] text-gray-600 mt-3">
                                Changes apply next cycle only.
                            </p>
                        </div>
                    </section>

                </div>

                
                <section>
                    <h3 className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                        Transaction Record
                        <div className="h-px bg-[#1E293B] flex-1"></div>
                    </h3>

                    <div className="border border-[#1E293B] bg-[#0B101A]">
                        <div className="grid grid-cols-12 py-3 px-4 border-b border-[#1E293B] text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                            <div className="col-span-3">Timestamp</div>
                            <div className="col-span-5">Event</div>
                            <div className="col-span-2 text-right">Amount</div>
                            <div className="col-span-2 text-right">Result</div>
                        </div>

                        {transactions.map((tx) => (<div key={tx.id} className="grid grid-cols-12 py-4 px-4 border-b border-[#1E293B]/30 items-center hover:bg-[#0f1623] transition-colors">
                                <div className="col-span-3 text-xs font-mono text-gray-500">{tx.timestamp}</div>
                                <div className="col-span-5 text-xs text-gray-300">{tx.event}</div>
                                <div className="col-span-2 text-xs font-mono text-gray-400 text-right">{currency}{tx.amount}</div>
                                <div className={`col-span-2 text-[10px] font-bold text-right tracking-wider ${resultColors[tx.result]}`}>
                                    {tx.result}
                                </div>
                            </div>))}
                    </div>
                </section>

            </div>
        </main>);
}
