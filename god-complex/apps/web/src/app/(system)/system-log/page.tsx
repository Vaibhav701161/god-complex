"use client";

import { useState } from "react";

// --- Types ---
type Severity = "INFO" | "WARNING" | "CRITICAL";
type EventType =
    | "DECLARATION_SUBMITTED"
    | "DECLARATION_MISSED"
    | "CONTRACT_LOCKED"
    | "GOAL_FAILED"
    | "AUTO_FAIL_TRIGGERED"
    | "EXCUSE_RECORDED"
    | "FAILURE_THRESHOLD_BREACHED"
    | "WEEK_CLASSIFIED"
    | "MONTH_FAILED"
    | "SYSTEM_INIT";

interface LogEntry {
    id: string;
    timestamp: string;
    type: EventType;
    description: string;
    severity: Severity;
}

export default function SystemLog() {
    // Mock Data - Raw and boring
    const logs: LogEntry[] = [
        { id: "log_102", timestamp: "2026-01-18T09:00:00Z", type: "SYSTEM_INIT", description: "Daily cycle initiated. Waiting for declaration.", severity: "INFO" },
        { id: "log_101", timestamp: "2026-01-17T23:59:59Z", type: "WEEK_CLASSIFIED", description: "Week 3 classification: UNSTABLE. Failure cluster detected (Day 5-6).", severity: "WARNING" },
        { id: "log_100", timestamp: "2026-01-17T20:00:00Z", type: "GOAL_FAILED", description: "Goal 'Morning Run' verification failed. No proof submitted.", severity: "CRITICAL" },
        { id: "log_099", timestamp: "2026-01-17T09:15:00Z", type: "CONTRACT_LOCKED", description: "Daily contract locked. 3 directives active.", severity: "INFO" },
        { id: "log_098", timestamp: "2026-01-17T08:30:00Z", type: "DECLARATION_SUBMITTED", description: "Goals declared for 2026-01-17.", severity: "INFO" },
        { id: "log_097", timestamp: "2026-01-16T23:59:59Z", type: "AUTO_FAIL_TRIGGERED", description: "Check-in missed. Automatic failure recorded.", severity: "CRITICAL" },
        { id: "log_096", timestamp: "2026-01-16T18:00:00Z", type: "FAILURE_THRESHOLD_BREACHED", description: "Monthly failure threshold crossed (Day 18). Recovery impossible.", severity: "CRITICAL" },
        { id: "log_095", timestamp: "2026-01-16T09:00:00Z", type: "SYSTEM_INIT", description: "Daily cycle initiated.", severity: "INFO" },
    ];

    const severityColors = {
        INFO: "text-blue-400",
        WARNING: "text-amber-500",
        CRITICAL: "text-red-500",
    };

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12 font-sans">

            {/* Header */}
            <div className="flex justify-between items-end mb-12 border-b border-[#1E293B] pb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-300 tracking-[0.2em] uppercase mb-1">System Log</h1>
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Immutable Enforcement Record // Protocol v1.0.4</p>
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

            {/* Filters (Functional, Minimal) */}
            <div className="flex gap-4 mb-8">
                <select className="bg-[#050810] border border-[#1E293B] text-gray-400 text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-900">
                    <option>All Dates</option>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>This Month</option>
                </select>
                <select className="bg-[#050810] border border-[#1E293B] text-gray-400 text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-900">
                    <option>All Events</option>
                    <option>System</option>
                    <option>User Action</option>
                    <option>Violation</option>
                </select>
                <select className="bg-[#050810] border border-[#1E293B] text-gray-400 text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-900">
                    <option>All Severities</option>
                    <option>Info</option>
                    <option>Warning</option>
                    <option>Critical</option>
                </select>
            </div>

            {/* Log Stream */}
            <div className="border-t border-[#1E293B]">
                {/* Header Row */}
                <div className="grid grid-cols-12 py-3 border-b border-[#1E293B] bg-[#0B101A]/50 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    <div className="col-span-3 md:col-span-2 px-4">Timestamp</div>
                    <div className="col-span-4 md:col-span-3 px-4">Event Type</div>
                    <div className="col-span-4 md:col-span-6 px-4">Description</div>
                    <div className="col-span-1 md:col-span-1 px-4 text-right">Sev</div>
                </div>

                {/* Rows */}
                <div className="font-mono text-xs">
                    {logs.map((log) => (
                        <div key={log.id} className="grid grid-cols-12 py-3 border-b border-[#1E293B]/30 hover:bg-[#0f1623] transition-colors items-center group">
                            <div className="col-span-3 md:col-span-2 px-4 text-gray-500 text-[10px] md:text-xs truncate">
                                {log.timestamp}
                            </div>
                            <div className="col-span-4 md:col-span-3 px-4 text-gray-400 truncate" title={log.type}>
                                {log.type}
                            </div>
                            <div className="col-span-4 md:col-span-6 px-4 text-gray-500 group-hover:text-gray-300 truncate transition-colors">
                                {log.description}
                            </div>
                            <div className={`col-span-1 md:col-span-1 px-4 text-right ${severityColors[log.severity]}`}>
                                {log.severity.charAt(0)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </main>
    );
}
