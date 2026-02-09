"use client";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";
import { useState } from "react";
import { GroupSelectorDropdown } from "@/components/GroupSelector";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useRouter } from "next/navigation";
export type DailyStatus = 'completed' | 'min_effort' | 'failed' | 'pending' | 'locked' | 'auto-fail' | 'none';
export interface Goal {
    id: string;
    name: string;
    discomfort: boolean;
    status: DailyStatus[];
}
export function TopBar({ user }: {
    user: any;
}) {
    const { availableGroups } = useDashboardContext();
    return (<div className="flex items-center justify-between py-6 px-8 bg-[#050810] border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
                <div className="scale-75 opacity-80"><GCLogo /></div>
                <div className="flex flex-col">
                    <span className="text-white font-bold tracking-[0.2em] text-sm">GOD COMPLEX</span>
                    <span className="text-gray-600 text-[10px] tracking-widest">SYSTEM DASHBOARD</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-gray-500 text-xs font-mono tracking-widest">
                    {user?.displayName || user?.name || "USER"}
                </div>
                
                {availableGroups.length > 0 && (<div className="border-l border-[#1E293B] pl-4">
                        <GroupSelectorDropdown />
                    </div>)}
                <div className="text-gray-500 text-xs font-mono tracking-widest">
                    JANUARY 2026
                </div>
            </div>
        </div>);
}
export function SystemDemandPanel({ mode, failureMomentum, pattern, aggregateState }: {
    mode: 'DECLARATION_REQUIRED' | 'EXECUTION_IN_PROGRESS' | 'RESOLUTION_PENDING' | 'DAY_FINALIZED' | 'AUTO_FAILED';
    failureMomentum: number;
    pattern?: string;
    aggregateState?: {
        drivingGroup: {
            groupName: string;
        } | null;
        groupStates: any[];
    };
}) {
    const router = useRouter();
    const modeConfig: Record<typeof mode, {
        title: string;
        message: string;
        buttonText: string;
    }> = {
        DECLARATION_REQUIRED: {
            title: 'Declaration Required',
            message: 'No goals declared for today. Outcomes must be recorded to initiate the protocol.',
            buttonText: 'Declare Goals',
        },
        EXECUTION_IN_PROGRESS: {
            title: 'Execution In Progress',
            message: 'Contract active. Execution window open until cutoff.',
            buttonText: 'View Contract',
        },
        RESOLUTION_PENDING: {
            title: 'Resolution Pending',
            message: 'Cutoff passed. Check-in required to record outcomes.',
            buttonText: 'Submit Check-In',
        },
        DAY_FINALIZED: {
            title: 'Day Finalized',
            message: 'All outcomes recorded. System verdict logged.',
            buttonText: 'View Results',
        },
        AUTO_FAILED: {
            title: 'Automatic Failure',
            message: 'Contract violation detected. Penalty enforcement in effect.',
            buttonText: 'View Status',
        },
    };
    const config = modeConfig[mode] || {
        title: 'System Status Unknown',
        message: 'Unable to determine current system state.',
        buttonText: 'Refresh',
    };
    const hasMultipleGroups = aggregateState && aggregateState.groupStates.length > 1;
    return (<div className="w-full bg-[#050810] border-y border-[#3B82F6] shadow-[0_0_50px_-20px_rgba(59,130,246,0.5)] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            
            <div className="absolute inset-0 bg-blue-900/5 animate-pulse"></div>

            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 animate-ping"></div>
                    <span className="text-blue-500 font-bold tracking-[0.2em] text-sm uppercase">System Demand</span>
                    {hasMultipleGroups && (<span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                            Across {aggregateState.groupStates.length} Groups
                        </span>)}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
                    {config.title}
                </h1>
                <p className="text-gray-400 font-mono text-xs md:text-sm max-w-xl mt-2">
                    {config.message}
                </p>
                {hasMultipleGroups && aggregateState.drivingGroup && (<p className="text-blue-400 font-mono text-xs mt-1">
                        Driven by: {aggregateState.drivingGroup.groupName}
                    </p>)}

                <div className="flex flex-col gap-1 mt-4 border-l-2 border-red-900/30 pl-4">
                    <div className="text-[10px] text-red-500 font-mono tracking-widest uppercase">
                        Failure Momentum: +{failureMomentum}
                    </div>
                    {pattern && (<div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                            Pattern: {pattern}
                        </div>)}
                </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
                <button onClick={() => {
            switch (mode) {
                case 'DECLARATION_REQUIRED':
                    router.push('/contract');
                    break;
                case 'EXECUTION_IN_PROGRESS':
                    router.push('/contract');
                    break;
                case 'RESOLUTION_PENDING':
                    router.push('/contract');
                    break;
                case 'DAY_FINALIZED':
                    router.push('/history');
                    break;
                case 'AUTO_FAILED':
                    router.push('/penalties');
                    break;
            }
        }} className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-sm shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] transition-all uppercase cursor-pointer">
                    {config.buttonText}
                </button>
            </div>
        </div>);
}
export function TodayGoalsPanel({ goals, declarationDelta, systemMode, groupId, currentDate, onRefresh }: {
    goals: any[];
    declarationDelta?: number | null;
    systemMode?: string;
    groupId?: string;
    currentDate?: string;
    onRefresh?: () => void;
}) {
    const router = useRouter();
    const [checkingIn, setCheckingIn] = useState(false);
    if (goals.length === 0) {
        return (<div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-gray-500 tracking-[0.2em] uppercase">Today&#39;s Contract</h2>
                    <div className="h-px bg-[#1E293B] flex-1"></div>
                </div>

                <div className="border border-dashed border-[#1E293B] rounded-lg p-12 flex flex-col items-center justify-center text-center bg-[#0B101A]/50">
                    <p className="text-gray-500 font-mono text-sm mb-2">NO ACTIVE CONTRACT</p>
                    <p className="text-gray-700 text-xs">Directives must be declared daily.</p>
                </div>

                <div className="mt-4 text-center">
                    {declarationDelta !== null && declarationDelta !== undefined ? (<span className={`text-[10px] font-mono tracking-widest uppercase ${declarationDelta < 0 ? 'text-red-500' : declarationDelta > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                            Declaration Delta: {declarationDelta > 0 ? '+' : ''}{declarationDelta}% vs 7-day average
                        </span>) : (<span className="text-[10px] text-gray-700 font-mono tracking-widest uppercase">
                            Establishing Baseline
                        </span>)}
                </div>
            </div>);
    }
    return (<div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Today&#39;s Contract</h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">
                        {goals.length} Goals Declared
                    </div>
                    <div className="flex gap-2">
                        {(systemMode === 'EXECUTION_IN_PROGRESS' || systemMode === 'RESOLUTION_PENDING') && (<button onClick={() => router.push('/contract')} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold tracking-widest uppercase transition-colors">
                                Submit Check-In
                            </button>)}
                        <button onClick={() => router.push('/contract')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold tracking-widest uppercase transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {goals.map((goal, i) => (<div key={goal.id} className="p-3 bg-[#050810] border border-[#1E293B] rounded-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] text-blue-400 font-bold tracking-widest mb-1">
                                        CLAUSE 0{i + 1} • {goal.category}
                                    </div>
                                    <div className="text-sm text-white font-mono">{goal.title}</div>
                                    {goal.isUncomfortable && (<div className="text-[8px] text-red-500 mt-1 uppercase">
                                            DISCOMFORT PROTOCOL
                                        </div>)}
                                </div>
                            </div>
                        </div>))}
                </div>
            </div>

            <div className="mt-4 text-center">
                {declarationDelta !== null && declarationDelta !== undefined ? (<span className={`text-[10px] font-mono tracking-widest uppercase ${declarationDelta < 0 ? 'text-red-500' : declarationDelta > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                        Declaration Delta: {declarationDelta > 0 ? '+' : ''}{declarationDelta}% vs 7-day average
                    </span>) : (<span className="text-[10px] text-gray-700 font-mono tracking-widest uppercase">
                        Establishing Baseline
                    </span>)}
            </div>
        </div>);
}
export function HistoricalGrid({ history, loading }: {
    history: Map<number, any>;
    loading: boolean;
}) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const allGoalTitles = new Set<string>();
    history.forEach(entry => {
        entry.goals?.forEach((g: any) => allGoalTitles.add(g.title));
    });
    const historyGoals = Array.from(allGoalTitles);
    if (historyGoals.length === 0 && !loading) {
        return (<div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">Enforcement History</h2>
                    <div className="h-px bg-[#1E293B] flex-1"></div>
                </div>
                <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm p-12 text-center">
                    <p className="text-gray-600 font-mono text-sm">NO ENFORCEMENT HISTORY</p>
                    <p className="text-gray-800 text-xs mt-2">Baseline forming</p>
                </div>
            </div>);
    }
    const getStatusForGoalOnDay = (goalTitle: string, day: number): DailyStatus => {
        const dayEntry = history.get(day);
        if (!dayEntry)
            return 'none';
        const goal = dayEntry.goals?.find((g: any) => g.title === goalTitle);
        if (!goal)
            return 'none';
        return goal.status || 'none';
    };
    return (<div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">Enforcement History</h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm overflow-x-auto">
                <div className="min-w-[800px]">
                    
                    <div className="grid grid-cols-[200px_repeat(31,minmax(24px,1fr))] border-b border-[#1E293B]">
                        <div className="p-3 text-[10px] font-bold text-gray-600 bg-[#050810] sticky left-0 z-10 border-r border-[#1E293B]">EVIDENCE</div>
                        {days.map(d => (<div key={d} className={`p-2 text-[10px] text-center font-mono border-r border-[#1E293B]/30 ${d === 15 ? 'text-red-500 bg-red-900/10' : 'text-gray-700'}`}>
                                {d}
                            </div>))}
                    </div>

                    
                    {historyGoals.map((goal, i) => (<div key={i} className="grid grid-cols-[200px_repeat(31,minmax(24px,1fr))] border-b border-[#1E293B]/30 hover:bg-[#0f1623] transition-colors">
                            <div className="p-3 text-xs text-gray-400 font-mono border-r border-[#1E293B] bg-[#0B101A] sticky left-0 z-10 truncate">
                                {goal}
                            </div>

                            {days.map(d => {
                const status = getStatusForGoalOnDay(goal, d);
                return (<div key={d} className="border-r border-[#1E293B]/20 flex items-center justify-center h-10">
                                        {status === 'completed' && <div className="w-2.5 h-2.5 bg-blue-600/60 rounded-[1px]"></div>}
                                        {status === 'min_effort' && <div className="w-2.5 h-2.5 bg-yellow-600/60 rounded-[1px]"></div>}
                                        {status === 'failed' && <div className="w-2.5 h-2.5 bg-red-900/60 border border-red-800/50 rounded-[1px]"></div>}
                                        {status === 'auto-fail' && <div className="w-2.5 h-2.5 bg-red-500/80 border border-red-400/50 rounded-[1px]"></div>}
                                        {status === 'none' && <div className="w-0.5 h-0.5 bg-gray-800 rounded-full"></div>}
                                    </div>);
            })}
                        </div>))}
                </div>
            </div>
        </div>);
}
export function MonthlyGraph({ history }: {
    history: Map<number, any>;
}) {
    const rawData = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        const dayEntry = history.get(day);
        if (!dayEntry || !dayEntry.goals || dayEntry.goals.length === 0) {
            return 0;
        }
        const completedCount = dayEntry.goals.filter((g: any) => g.status === 'completed' || g.status === 'min_effort').length;
        return (completedCount / dayEntry.goals.length) * 100;
    });
    return (<div className="w-full">
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
                        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={`M0 100 ${rawData.map((val, i) => `L${i * 10} ${100 - val}`).join(" ")} L310 100`} fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.5"/>
                        <motion.path initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 1, delay: 0.5 }} d={`M0 100 ${rawData.map((val, i) => `L${i * 10} ${100 - val}`).join(" ")} L310 100 Z`} fill="#3B82F6"/>
                    </svg>
                </div>
            </div>
            <div className="text-[10px] text-red-900/80 font-mono tracking-widest uppercase text-right">
                Failure Threshold: 3 days remaining before MONTH FAILURE
            </div>
        </div>);
}
export function Leaderboard({ leaderboard, currentUserId }: {
    leaderboard: Array<{
        userId: string;
        name: string;
        score: number;
        rank: number;
    }>;
    currentUserId: string;
}) {
    if (leaderboard.length === 0) {
        return (<div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase">Group Rankings</h2>
                    <div className="h-px bg-[#1E293B] flex-1"></div>
                </div>
                <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm p-12 text-center">
                    <p className="text-gray-600 font-mono text-sm">NO RANKINGS AVAILABLE</p>
                    <p className="text-gray-800 text-xs mt-2">Insufficient data for group comparison</p>
                </div>
            </div>);
    }
    return (<div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Group Rankings</h2>
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </div>

            <div className="bg-[#0B101A] border border-[#1E293B] rounded-sm">
                {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isTopRank = entry.rank === 1;
            const isBottomRank = entry.rank === leaderboard.length;
            return (<div key={entry.userId} className={`
                                grid grid-cols-[60px_1fr_120px] gap-4 p-4 border-b border-[#1E293B]/30 last:border-b-0
                                ${isCurrentUser ? 'bg-blue-900/10 border-l-2 border-l-blue-600' : ''}
                                ${isTopRank ? 'bg-green-900/5' : ''}
                                ${isBottomRank ? 'bg-red-900/5' : ''}
                                hover:bg-[#0f1623] transition-colors
                            `}>
                            <div className="flex items-center justify-center">
                                <div className={`
                                    text-2xl font-bold font-mono
                                    ${isTopRank ? 'text-green-500' : isBottomRank ? 'text-red-500' : 'text-gray-600'}
                                `}>
                                    #{entry.rank}
                                </div>
                            </div>

                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono text-sm ${isCurrentUser ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                                        {entry.name}
                                    </span>
                                    {isCurrentUser && (<span className="text-[10px] text-blue-500 uppercase tracking-widest">(You)</span>)}
                                </div>
                                <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase mt-1">
                                    User ID: {entry.userId.slice(0, 8)}
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center">
                                <div className="text-xl font-bold text-white font-mono">
                                    {entry.score.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                                    Score
                                </div>
                            </div>
                        </div>);
        })}
            </div>

            <div className="mt-4 text-center">
                <span className="text-[10px] text-gray-700 font-mono tracking-widest uppercase">
                    Rankings updated in real-time based on monthly performance
                </span>
            </div>
        </div>);
}
