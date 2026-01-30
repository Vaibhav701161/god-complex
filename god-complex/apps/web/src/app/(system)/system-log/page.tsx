"use client";

import { useState } from "react";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import { AuditLogFilters, AuditSource } from "@/types/dashboard";

// --- Source Badge Component ---
function SourceBadge({ source }: { source: AuditSource }) {
    const colorMap = {
        SYSTEM: { bg: "bg-blue-950/10", border: "border-blue-500/50", text: "text-blue-400" },
        CRON: { bg: "bg-purple-950/10", border: "border-purple-500/50", text: "text-purple-400" },
        ADMIN: { bg: "bg-red-950/10", border: "border-red-500/50", text: "text-red-400" },
        USER: { bg: "bg-green-950/10", border: "border-green-500/50", text: "text-green-400" },
    };
    
    const colors = colorMap[source];
    
    return (
        <span className={`inline-block px-2 py-1 text-[9px] font-mono uppercase tracking-wider border rounded ${colors.bg} ${colors.border} ${colors.text}`}>
            {source}
        </span>
    );
}

export default function SystemLog() {
    const { selectedGroupId } = useDashboardContext();
    const [filters, setFilters] = useState<AuditLogFilters>({});
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const { logs, loading, error, total } = useAuditLog(selectedGroupId, filters);

    const handleDateRangeChange = (range: string) => {
        const now = new Date();
        let startDate: string | undefined;
        
        switch(range) {
            case "Last 24 Hours":
                startDate = new Date(now.getTime() - 24*60*60*1000).toISOString();
                break;
            case "Last 7 Days":
                startDate = new Date(now.getTime() - 7*24*60*60*1000).toISOString();
                break;
            case "This Month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                break;
            default:
                startDate = undefined;
        }
        
        setFilters(prev => ({ ...prev, startDate, endDate: undefined }));
    };

    const handleSourceChange = (source: string) => {
        setFilters(prev => ({ 
            ...prev, 
            source: source === "All Sources" ? undefined : source as AuditSource 
        }));
    };

    const handleCorrelationIdClick = (correlationId: string) => {
        // Filter by correlation ID
        setFilters(prev => ({ ...prev, correlationId }));
    };

    const formatTimestamp = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    LOADING AUDIT LOG...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans">

            {/* Header */}
            <div className="flex justify-between items-end mb-12 border-b border-[#1E293B] pb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-300 tracking-[0.2em] uppercase mb-1">System Log</h1>
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Immutable Enforcement Record // {total} Entries</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">UTC Timezone</div>
                </div>
            </div>

            {/* Immutability Notice */}
            <div className="mb-8 p-4 bg-[#0B101A] border border-[#1E293B] flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Log entries are immutable. Records cannot be edited or deleted.
                </span>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 border border-red-900/50 bg-red-950/20">
                    <p className="text-sm font-mono text-red-400">{error}</p>
                </div>
            )}

            {/* Filters (Functional, Minimal) */}
            <div className="flex gap-4 mb-8 flex-wrap">
                <select 
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    className="bg-[#050810] border border-[#1E293B] text-gray-400 text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-900"
                >
                    <option>All Dates</option>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>This Month</option>
                </select>
                <select 
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="bg-[#050810] border border-[#1E293B] text-gray-400 text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-900"
                >
                    <option>All Sources</option>
                    <option>SYSTEM</option>
                    <option>CRON</option>
                    <option>ADMIN</option>
                    <option>USER</option>
                </select>
                <select 
                    value={filters.action || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                    className="bg-[#050810] border border-[#1E293B] text-gray-400 text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-900"
                >
                    <option value="">All Actions</option>
                    <option value="GOAL_CREATED">GOAL_CREATED</option>
                    <option value="GOAL_UPDATED">GOAL_UPDATED</option>
                    <option value="GOAL_DELETED">GOAL_DELETED</option>
                    <option value="CHECKIN_RECORDED">CHECKIN_RECORDED</option>
                    <option value="DAY_FINALIZED">DAY_FINALIZED</option>
                    <option value="PENALTY_ASSIGNED">PENALTY_ASSIGNED</option>
                    <option value="PENALTY_COMPLETED">PENALTY_COMPLETED</option>
                    <option value="MONTH_CLOSED">MONTH_CLOSED</option>
                    <option value="GROUP_CREATED">GROUP_CREATED</option>
                    <option value="MEMBER_JOINED">MEMBER_JOINED</option>
                </select>
                {filters.correlationId && (
                    <div className="flex items-center gap-2 bg-blue-950/20 border border-blue-900/50 px-3 py-2 rounded-sm">
                        <span className="text-xs text-blue-400 font-mono">Correlation: {filters.correlationId.slice(0, 12)}...</span>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, correlationId: undefined }))}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {logs.length === 0 && !loading && (
                <div className="border border-dashed border-[#1E293B] p-12 text-center">
                    <p className="text-gray-500 font-mono text-sm">NO AUDIT ENTRIES FOUND</p>
                    <p className="text-gray-700 text-xs mt-2">
                        {filters.source || filters.startDate ? "Try adjusting filters" : "No activity recorded yet"}
                    </p>
                </div>
            )}

            {/* Log Stream */}
            {logs.length > 0 && (
                <div className="border-t border-[#1E293B]">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 py-3 border-b border-[#1E293B] bg-[#0B101A]/50 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                        <div className="col-span-2 px-4">Timestamp</div>
                        <div className="col-span-3 px-4">Action</div>
                        <div className="col-span-2 px-4">Actor</div>
                        <div className="col-span-2 px-4">Target</div>
                        <div className="col-span-2 px-4">Source</div>
                        <div className="col-span-1 px-4 text-right">Details</div>
                    </div>

                    {/* Log Entries */}
                    {logs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        const relatedCount = log.correlationId 
                            ? logs.filter(l => l.correlationId === log.correlationId).length 
                            : 0;

                        return (
                            <div key={log.id}>
                                {/* Main Row */}
                                <div 
                                    className="grid grid-cols-12 py-3 border-b border-[#1E293B]/30 hover:bg-[#0B101A]/50 transition-colors cursor-pointer"
                                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                >
                                    {/* Timestamp */}
                                    <div className="col-span-2 px-4">
                                        <span className="text-xs text-gray-500 font-mono">
                                            {formatTimestamp(log.createdAt)}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-3 px-4">
                                        <span className="text-xs text-gray-400 font-mono">
                                            {log.action}
                                        </span>
                                    </div>

                                    {/* Actor */}
                                    <div className="col-span-2 px-4">
                                        <span className="text-xs text-gray-500 font-mono truncate block">
                                            {log.actorId ? log.actorId.slice(0, 8) + '...' : 'SYSTEM'}
                                        </span>
                                    </div>

                                    {/* Target */}
                                    <div className="col-span-2 px-4">
                                        <span className="text-xs text-gray-500 font-mono truncate block">
                                            {log.targetType}:{log.targetId.slice(0, 6)}
                                        </span>
                                    </div>

                                    {/* Source */}
                                    <div className="col-span-2 px-4">
                                        <SourceBadge source={log.source} />
                                    </div>

                                    {/* Expand Icon */}
                                    <div className="col-span-1 px-4 text-right">
                                        <svg 
                                            className={`w-4 h-4 text-gray-600 inline-block transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Expanded Detail Section */}
                                {isExpanded && (
                                    <div className="border-t border-[#1E293B] bg-[#050810] p-6">
                                        {/* Metadata section */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <span className="text-xs text-gray-600 block mb-1">Reason:</span>
                                                <span className="text-sm text-gray-400">{log.reason || "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-600 block mb-1">Correlation ID:</span>
                                                {log.correlationId ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCorrelationIdClick(log.correlationId!);
                                                        }}
                                                        className="text-sm text-blue-400 font-mono hover:text-blue-300 underline"
                                                    >
                                                        {log.correlationId}
                                                        {relatedCount > 1 && (
                                                            <span className="ml-2 text-xs text-gray-600">({relatedCount} related)</span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-gray-400">N/A</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Changes JSON display */}
                                        {log.changes && (
                                            <div>
                                                <div className="text-xs text-gray-600 mb-2">Changes:</div>
                                                <pre className="bg-[#0a0e14] border border-[#1E293B] p-4 text-xs text-gray-400 overflow-x-auto rounded">
                                                    {JSON.stringify(log.changes, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
