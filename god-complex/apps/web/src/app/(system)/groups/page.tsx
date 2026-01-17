"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type MemberStatus = "COMPLIANT" | "AT_RISK" | "FAILED";

interface Member {
    id: string;
    identifier: string; // Initials or ID
    status: MemberStatus;
    complianceScore: number;
}

interface Contract {
    id: string;
    name: string;
    memberCount: number;
    cycleStatus: "ACTIVE" | "FAILED" | "COMPLETED";
    visibility: "PRIVATE" | "GROUP";
    members: Member[];
}

// --- Mock Data ---
const MOCK_CONTRACTS: Contract[] = [
    {
        id: "c1",
        name: "Q1 Enforcement Pact",
        memberCount: 4,
        cycleStatus: "ACTIVE",
        visibility: "GROUP",
        members: [
            { id: "m1", identifier: "YOU", status: "COMPLIANT", complianceScore: 92 },
            { id: "m2", identifier: "AK", status: "AT_RISK", complianceScore: 78 },
            { id: "m3", identifier: "JR", status: "COMPLIANT", complianceScore: 88 },
            { id: "m4", identifier: "MS", status: "FAILED", complianceScore: 45 },
        ]
    },
    {
        id: "c2",
        name: "Fitness Protocol Alpha",
        memberCount: 3,
        cycleStatus: "ACTIVE",
        visibility: "PRIVATE",
        members: [
            { id: "m1", identifier: "YOU", status: "COMPLIANT", complianceScore: 100 },
            { id: "m5", identifier: "DL", status: "COMPLIANT", complianceScore: 95 },
            { id: "m6", identifier: "CP", status: "AT_RISK", complianceScore: 80 },
        ]
    }
];

export default function GroupsPage() {
    const [view, setView] = useState<"LIST" | "CREATE">("LIST");
    const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

    // --- Components ---

    const StatusBadge = ({ status }: { status: MemberStatus }) => {
        const colors = {
            COMPLIANT: "text-blue-500 border-blue-900/30 bg-blue-900/10",
            AT_RISK: "text-yellow-500 border-yellow-900/30 bg-yellow-900/10",
            FAILED: "text-red-500 border-red-900/30 bg-red-900/10",
        };
        return (
            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 border ${colors[status]}`}>
                {status.replace("_", " ")}
            </span>
        );
    };

    const CreateForm = () => (
        <div className="max-w-xl mx-auto border border-[#1E293B] bg-[#0B101A] p-8 md:p-12">
            <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase mb-8">Define New Protocol</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Contract Identifier</label>
                    <input type="text" placeholder="e.g. Q1 Operational Bind" className="w-full bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Duration (Days)</label>
                        <input type="number" defaultValue={30} className="w-full bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Max Members</label>
                        <input type="number" defaultValue={5} className="w-full bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Penalty / Stake</label>
                    <input disabled type="text" value="Standard Excuse Tax (Immutable)" className="w-full bg-[#050810] border border-[#334155] text-gray-500 p-3 font-mono text-xs opacity-70 cursor-not-allowed" />
                    <p className="mt-2 text-[10px] text-gray-600 font-mono">
                        * Contracts override individual excuses. Protocol is absolute.
                    </p>
                </div>
            </div>

            <div className="mt-12 flex gap-4">
                <button onClick={() => setView("LIST")} className="flex-1 py-4 border border-[#334155] text-gray-400 hover:text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors">
                    Cancel
                </button>
                <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]">
                    Initiate Contract
                </button>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12">

            {/* Header */}
            <div className="flex justify-between items-end mb-12 border-b border-[#1E293B] pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-[0.2em] uppercase mb-2">Group Contracts</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase">Enforcement is stronger when witnessed.</p>
                </div>
                {view === "LIST" && (
                    <button onClick={() => setView("CREATE")} className="px-6 py-3 border border-blue-900/50 text-blue-500 hover:bg-blue-900/10 font-bold tracking-[0.2em] text-[10px] uppercase transition-colors">
                        Create New Contract
                    </button>
                )}
            </div>

            {/* Content */}
            {view === "CREATE" ? (
                <CreateForm />
            ) : (
                <div className="space-y-6 max-w-5xl">
                    {MOCK_CONTRACTS.map((contract) => {
                        const isExpanded = expandedContractId === contract.id;

                        return (
                            <div key={contract.id} className={`border transition-all duration-300 ${isExpanded ? 'border-blue-900/50 bg-[#0B101A]' : 'border-[#1E293B] bg-[#0B101A]/50 hover:border-gray-700'}`}>
                                {/* Card Header / Summary */}
                                <div
                                    onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                                    className="p-6 cursor-pointer flex items-center justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">{contract.name}</h3>
                                            <span className="text-[9px] text-gray-500 border border-gray-800 px-1">{contract.visibility}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-500">
                                            MEMBERS: {contract.memberCount} // STATUS: <span className="text-green-500">{contract.cycleStatus}</span>
                                        </div>
                                    </div>
                                    <div className={`text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
                                </div>

                                {/* Expanded Detail (Judgement Table) */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-[#1E293B]"
                                        >
                                            <div className="p-6 bg-[#050810]/50">
                                                <div className="grid grid-cols-3 gap-4 mb-4 px-4 text-[9px] text-gray-600 font-bold tracking-widest uppercase">
                                                    <div>Identify</div>
                                                    <div>Compliance</div>
                                                    <div className="text-right">Status</div>
                                                </div>

                                                <div className="space-y-2">
                                                    {contract.members.map(member => (
                                                        <div key={member.id} className="grid grid-cols-3 gap-4 items-center p-4 border border-[#1E293B]/50 bg-[#0B101A]">
                                                            <div className="font-mono text-sm text-gray-300">{member.identifier}</div>
                                                            <div className="font-mono text-xs text-gray-500">{member.complianceScore}%</div>
                                                            <div className="text-right">
                                                                <StatusBadge status={member.status} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-8 text-center">
                                                    <p className="text-[10px] text-gray-600 font-mono italic">
                                                        "System evaluates group integrity daily."
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

        </main>
    );
}
