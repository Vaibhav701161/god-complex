"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
export interface ContractSummary {
    date: string;
    completionScore: number;
    status: "SUCCESS" | "FAILURE" | "PARTIAL";
    goalsTotal: number;
    goalsCompleted: number;
    goalsFailed: number;
    goalsMinEffort: number;
    penalties: number;
    goals: Array<{
        id: string;
        title: string;
        category: string;
        status: "COMPLETED" | "MIN_EFFORT" | "FAILED" | "PENDING" | null;
        isUncomfortable: boolean;
        failureReason?: string;
    }>;
}
export interface ContractDetail extends ContractSummary {
    goals: Array<{
        id: string;
        title: string;
        category: string;
        status: "COMPLETED" | "MIN_EFFORT" | "FAILED" | "PENDING" | null;
        isUncomfortable: boolean;
        result?: {
            failureReason?: string;
            recordedAt: string;
        };
    }>;
}
export function ContractHistoryList({ contracts, loading, }: {
    contracts: ContractSummary[];
    loading: boolean;
}) {
    const [expandedContractDate, setExpandedContractDate] = useState<string | null>(null);
    if (loading) {
        return (<div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">
                        Recent Contracts
                    </h2>
                    <div className="h-px bg-[#1E293B] flex-1"></div>
                </div>
                <div className="text-gray-500 font-mono text-sm text-center py-12">
                    LOADING CONTRACT HISTORY...
                </div>
            </div>);
    }
    if (contracts.length === 0) {
        return (<div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">
                        Recent Contracts
                    </h2>
                    <div className="h-px bg-[#1E293B] flex-1"></div>
                </div>
                <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm p-12 text-center">
                    <p className="text-gray-600 font-mono text-sm">NO PAST CONTRACTS</p>
                    <p className="text-gray-800 text-xs mt-2">Complete today's contract to build your history</p>
                </div>
            </div>);
    }
    return (<div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">
                    Past Contracts (Last {Math.min(contracts.length, 7)})
                </h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="space-y-3">
                {contracts.slice(0, 7).map((contract) => (<ContractHistoryCard key={contract.date} contract={contract} isExpanded={expandedContractDate === contract.date} onToggle={() => setExpandedContractDate(expandedContractDate === contract.date ? null : contract.date)}/>))}
            </div>
        </div>);
}
function ContractHistoryCard({ contract, isExpanded, onToggle, }: {
    contract: ContractSummary;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const statusConfig = {
        SUCCESS: {
            color: "text-green-500",
            bg: "bg-green-950/20",
            border: "border-green-900/50",
            label: "SUCCESS",
        },
        FAILURE: {
            color: "text-red-500",
            bg: "bg-red-950/20",
            border: "border-red-900/50",
            label: "FAILURE",
        },
        PARTIAL: {
            color: "text-yellow-500",
            bg: "bg-yellow-950/20",
            border: "border-yellow-900/50",
            label: "PARTIAL",
        },
    };
    const config = statusConfig[contract.status];
    const completionPercent = Math.round(contract.completionScore * 100);
    return (<div className={`border ${config.border} ${config.bg} rounded-sm overflow-hidden transition-all hover:border-opacity-100`}>
            
            <button onClick={onToggle} className="w-full p-4 flex items-center justify-between text-left hover:bg-black/20 transition-colors">
                <div className="flex items-center gap-6 flex-1">
                    
                    <div className="min-w-[100px]">
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                            Contract
                        </div>
                        <div className="text-sm font-mono text-white">{contract.date}</div>
                    </div>

                    
                    <div className={`px-3 py-1 ${config.bg} border ${config.border} ${config.color} text-[10px] font-bold tracking-widest uppercase`}>
                        {config.label}
                    </div>

                    
                    <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                            Completion
                        </div>
                        <div className={`text-lg font-bold font-mono ${config.color}`}>
                            {completionPercent}%
                        </div>
                    </div>

                    
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-green-500">✓ {contract.goalsCompleted}</span>
                        <span className="text-yellow-500">~ {contract.goalsMinEffort}</span>
                        <span className="text-red-500">✗ {contract.goalsFailed}</span>
                    </div>

                    
                    {contract.penalties > 0 && (<div className="text-[10px] text-red-400 font-mono">
                            Penalty: {formatCurrency(contract.penalties)}
                        </div>)}
                </div>

                
                <div className={`text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                    ▼
                </div>
            </button>

            
            <AnimatePresence>
                {isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-current overflow-hidden">
                        <div className="p-4 space-y-2 bg-black/30">
                            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">
                                Goal Details ({contract.goals.length})
                            </div>
                            {contract.goals.length > 0 ? (<div className="space-y-2">
                                    {contract.goals.map((goal, idx) => {
                    const statusConfig = {
                        COMPLETED: { icon: "✓", color: "text-green-500" },
                        MIN_EFFORT: { icon: "~", color: "text-yellow-500" },
                        FAILED: { icon: "✗", color: "text-red-500" },
                        PENDING: { icon: "○", color: "text-gray-600" },
                    };
                    const goalStatus = goal.status || "PENDING";
                    const statusStyle = statusConfig[goalStatus];
                    return (<div key={goal.id} className="p-3 bg-[#0B101A] border border-[#1E293B] rounded-sm">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-sm font-mono ${statusStyle.color}`}>
                                                                {statusStyle.icon}
                                                            </span>
                                                            <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">
                                                                {goal.category}
                                                            </span>
                                                            {goal.isUncomfortable && (<span className="text-[8px] text-red-500 border border-red-900 px-1 py-0.5 uppercase">
                                                                    DISCOMFORT
                                                                </span>)}
                                                        </div>
                                                        <div className="text-sm text-white font-mono">
                                                            {goal.title}
                                                        </div>
                                                        {goal.failureReason && (<div className="text-[10px] text-gray-500 mt-1">
                                                                Reason: {goal.failureReason}
                                                            </div>)}
                                                    </div>
                                                    <div className={`text-[10px] font-bold uppercase ${statusStyle.color} whitespace-nowrap`}>
                                                        {goalStatus}
                                                    </div>
                                                </div>
                                            </div>);
                })}
                                </div>) : (<div className="text-xs text-gray-500 font-mono italic text-center py-4">
                                    No goals recorded
                                </div>)}
                        </div>
                    </motion.div>)}
            </AnimatePresence>
        </div>);
}
export function AggregatePerformanceWidget({ rollingCompletion7Day, rollingCompletion30Day, currentStreak, failureMomentum, }: {
    rollingCompletion7Day: number;
    rollingCompletion30Day: number;
    currentStreak: number;
    failureMomentum: number;
}) {
    return (<div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">
                    Aggregate Performance
                </h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#0B101A] border border-[#1E293B] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                        7-Day Rolling
                    </div>
                    <div className="text-2xl font-bold text-blue-500 font-mono">
                        {Math.round(rollingCompletion7Day)}%
                    </div>
                </div>

                
                <div className="bg-[#0B101A] border border-[#1E293B] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                        30-Day Average
                    </div>
                    <div className="text-2xl font-bold text-blue-400 font-mono">
                        {Math.round(rollingCompletion30Day)}%
                    </div>
                </div>

                
                <div className="bg-[#0B101A] border border-[#1E293B] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                        Success Streak
                    </div>
                    <div className={`text-2xl font-bold font-mono ${currentStreak > 0 ? "text-green-500" : "text-gray-600"}`}>
                        {currentStreak} days
                    </div>
                </div>

                
                <div className="bg-[#0B101A] border border-[#1E293B] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                        Failure Momentum
                    </div>
                    <div className={`text-2xl font-bold font-mono ${failureMomentum > 0 ? "text-red-500" : "text-gray-600"}`}>
                        +{failureMomentum}
                    </div>
                </div>
            </div>
        </div>);
}
