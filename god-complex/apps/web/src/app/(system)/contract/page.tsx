"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useTodayGoals } from "@/hooks/useTodayGoals";
import { useSystemMode } from "@/hooks/useSystemMode";
import { Goal, SystemMode } from "@/types/dashboard";
type GoalCategory = "STUDY" | "HEALTH" | "CAREER" | "BUILD" | "SOCIAL";
interface LocalGoal {
    id: string;
    text: string;
    category: GoalCategory;
    finishCondition: string;
    minEffort: string;
    isUncomfortable: boolean;
}
const CATEGORY_LABELS: Record<GoalCategory, string> = {
    STUDY: "Study",
    HEALTH: "Health",
    CAREER: "Career",
    BUILD: "Build",
    SOCIAL: "Social",
};
type FailureReason = "POOR_PLANNING" | "LOW_ENERGY" | "DISTRACTION" | "EXTERNAL_DEPENDENCY" | "FEAR_AVOIDANCE";
const FAILURE_REASON_LABELS: Record<FailureReason, string> = {
    POOR_PLANNING: "Poor Planning",
    LOW_ENERGY: "Low Energy",
    DISTRACTION: "Distraction",
    EXTERNAL_DEPENDENCY: "External Dependency",
    FEAR_AVOIDANCE: "Fear/Avoidance",
};
type GoalOutcomeStatus = "COMPLETED" | "MIN_EFFORT" | "FAILED";
interface GoalOutcome {
    status: GoalOutcomeStatus;
    failureReason?: FailureReason;
}
type PageState = "DECLARATION" | "EXECUTION" | "RESOLUTION" | "FAILED";
function mapSystemModeToPageState(mode: SystemMode): PageState {
    switch (mode) {
        case "DECLARATION_REQUIRED":
            return "DECLARATION";
        case "EXECUTION_IN_PROGRESS":
            return "EXECUTION";
        case "RESOLUTION_PENDING":
            return "RESOLUTION";
        case "DAY_FINALIZED":
            return "FAILED";
        default:
            return "DECLARATION";
    }
}
export default function DailyContract() {
    const router = useRouter();
    const { groupId, currentDate, loading: contextLoading, error: contextError, refetch, availableGroups, selectedGroupId, requiresSelection } = useDashboardContext();
    const { goals: existingGoals, loading: goalsLoading, error: goalsError, refetch: refetchGoals } = useTodayGoals();
    const { mode: systemMode, loading: modeLoading, refetch: refetchSystemMode } = useSystemMode();
    const currentGroup = availableGroups.find(g => g.id === selectedGroupId);
    const hasMultipleGroups = availableGroups.length > 1;
    const [pageState, setPageState] = useState<PageState>("DECLARATION");
    const [localGoals, setLocalGoals] = useState<LocalGoal[]>([]);
    const [newGoal, setNewGoal] = useState<{
        text: string;
        category: GoalCategory;
        finishCondition: string;
        minEffort: string;
        isUncomfortable: boolean;
    }>({
        text: "",
        category: "BUILD",
        finishCondition: "",
        minEffort: "",
        isUncomfortable: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    useEffect(() => {
        if (modeLoading)
            return;
        if (existingGoals.length > 0) {
            setPageState("RESOLUTION");
        }
        else {
            setPageState(mapSystemModeToPageState(systemMode));
        }
    }, [systemMode, existingGoals, modeLoading]);
    const addGoal = () => {
        if (localGoals.length >= 10)
            return;
        if (!newGoal.text.trim())
            return;
        if (!newGoal.finishCondition.trim())
            return;
        if (!newGoal.minEffort.trim())
            return;
        setLocalGoals([
            ...localGoals,
            {
                id: Math.random().toString(36).substr(2, 9),
                text: newGoal.text.trim(),
                category: newGoal.category,
                finishCondition: newGoal.finishCondition.trim(),
                minEffort: newGoal.minEffort.trim(),
                isUncomfortable: newGoal.isUncomfortable,
            },
        ]);
        setNewGoal({
            text: "",
            category: "BUILD",
            finishCondition: "",
            minEffort: "",
            isUncomfortable: false,
        });
        setSubmitError(null);
    };
    const removeGoal = (id: string) => {
        setLocalGoals(localGoals.filter((g) => g.id !== id));
    };
    const lockContract = async () => {
        if (!groupId) {
            setSubmitError("No active group. Please join a group first.");
            return;
        }
        if (localGoals.length < 3) {
            setSubmitError("At least 3 goals are required.");
            return;
        }
        if (localGoals.length > 10) {
            setSubmitError("Maximum 10 goals allowed.");
            return;
        }
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
            const response = await fetch(`${apiURL}/api/daily-goals/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    groupId,
                    date: currentDate,
                    goals: localGoals.map(g => ({
                        title: g.text,
                        category: g.category,
                        finishCondition: g.finishCondition,
                        minEffort: g.minEffort,
                        isUncomfortable: g.isUncomfortable,
                    })),
                }),
            });
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorMessage = `Failed to lock contract (${response.status})`;
                if (contentType && contentType.includes("application/json")) {
                    try {
                        const error = await response.json();
                        errorMessage = error.message || error.error || errorMessage;
                    }
                    catch {
                    }
                }
                else {
                    const text = await response.text();
                    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
                        errorMessage = "Backend error - check if server is running on port 4000";
                    }
                    else {
                        errorMessage = text.substring(0, 100);
                    }
                }
                throw new Error(errorMessage);
            }
            await refetchGoals();
            setLocalGoals([]);
            window.location.href = '/dashboard';
        }
        catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to lock contract");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (contextLoading || goalsLoading || modeLoading) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
            <div className="text-gray-500 font-mono text-sm tracking-widest">
                LOADING CONTRACT...
            </div>
        </main>);
    }
    if (contextError || goalsError) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
            <div className="text-red-500 font-mono text-sm tracking-widest">
                ERROR: {contextError || goalsError}
            </div>
        </main>);
    }
    if (requiresSelection) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
            <div className="max-w-lg text-center">
                <h1 className="text-2xl font-bold text-white tracking-[0.2em] uppercase mb-4">
                    Select Active Group
                </h1>
                <p className="text-gray-500 font-mono text-sm mb-6">
                    You have multiple groups. Please select one to access the Daily Contract.
                </p>
                <a href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-sm uppercase transition-colors">
                    Go to Dashboard
                </a>
            </div>
        </main>);
    }
    if (!groupId) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
            <div className="max-w-lg text-center">
                <h1 className="text-2xl font-bold text-white tracking-[0.2em] uppercase mb-4">
                    No Active Group
                </h1>
                <p className="text-gray-500 font-mono text-sm mb-6">
                    You must join or create a group to access the Daily Contract.
                </p>
                <a href="/groups" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-sm uppercase transition-colors">
                    View Groups
                </a>
            </div>
        </main>);
    }
    return (<main className="min-h-screen bg-[#0a0e14] pb-32">

        <div className="border-b border-[#1E293B] bg-[#050810] py-6 px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-white tracking-[0.2em] uppercase">
                        Daily Contract
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        {currentGroup && (<>
                            <span className="text-xs font-mono text-gray-500 uppercase">
                                Group: {currentGroup.name}
                            </span>
                            <span className="text-gray-700">•</span>
                            <span className="text-xs font-mono text-gray-500">
                                {currentGroup.timezone} • Cutoff: {currentGroup.cutoffHour}:00
                            </span>
                        </>)}
                    </div>
                </div>
                {hasMultipleGroups && (<a href="/groups" className="text-xs font-mono text-blue-400 hover:text-blue-300 underline transition-colors">
                    Switch Group →
                </a>)}
            </div>
        </div>


        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">

            {submitError && (<div className="mb-8 p-4 border border-red-900/50 bg-red-950/20 flex justify-between items-start">
                <div>
                    <p className="text-sm font-mono text-red-400">{submitError}</p>
                </div>
                <button onClick={() => setSubmitError(null)} className="text-red-600 hover:text-red-400 font-mono text-xs ml-4">
                    [DISMISS]
                </button>
            </div>)}


            {goalsError && (<div className="mb-8 p-4 border border-orange-900/50 bg-orange-950/20">
                <p className="text-sm font-mono text-orange-400">️ {goalsError}</p>
            </div>)}


            {pageState === "DECLARATION" && existingGoals.length === 0 && (<DeclarationState localGoals={localGoals} newGoal={newGoal} setNewGoal={setNewGoal} addGoal={addGoal} removeGoal={removeGoal} lockContract={lockContract} isSubmitting={isSubmitting} existingGoals={existingGoals} />)}





            {existingGoals.length > 0 && (<ResolutionState goals={existingGoals} groupId={groupId!} currentDate={currentDate} refetch={refetch} refetchGoals={refetchGoals} refetchSystemMode={refetchSystemMode} setPageState={setPageState} />)}


            {pageState === "FAILED" && <FailedState />}
        </div>
    </main>);
}
function Header({ pageState, hasExistingGoals }: {
    pageState: PageState;
    hasExistingGoals: boolean;
}) {
    const getStateInfo = () => {
        if (hasExistingGoals) {
            return {
                title: "CHECK-IN AVAILABLE",
                subtitle: "Mark your goals as complete or incomplete",
            };
        }
        switch (pageState) {
            case "DECLARATION":
                return {
                    title: "DECLARATION REQUIRED",
                    subtitle: "Define your obligations for today",
                };
            default:
                return {
                    title: "CONTRACT STATUS",
                    subtitle: "System processing",
                };
        }
    };
    const stateInfo = getStateInfo();
    return (<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 py-8 border-b border-[#1E293B]">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-[0.2em] uppercase mb-2">
                Daily Contract
            </h1>
            <p className="text-xs font-mono text-gray-500 uppercase">
                Valid for one day only // {new Date().toLocaleDateString()}
            </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
            <div className="text-xl font-mono text-white font-bold tracking-widest">
                {hasExistingGoals ? "CHECK-IN OPEN" : (pageState === "DECLARATION" ? "DECLARATION OPEN" :
                    pageState === "RESOLUTION" ? "CHECK-IN OPEN" :
                        "CONTRACT LOCKED")}
            </div>
            <span className="text-xs text-gray-600 font-mono">{stateInfo.subtitle}</span>
        </div>
    </div>);
}
function SystemNotice({ pageState }: {
    pageState: PageState;
}) {
    const notices: Record<PageState, {
        title: string;
        subtitle: string;
        color: string;
    }> = {
        DECLARATION: {
            title: "DECLARATION REQUIRED",
            subtitle: "Define clear, falsifiable outcomes.",
            color: "text-blue-500",
        },
        EXECUTION: {
            title: "EXECUTION LOCKED",
            subtitle: "No intervention permitted.",
            color: "text-gray-500",
        },
        RESOLUTION: {
            title: "RESOLUTION REQUIRED",
            subtitle: "Report outcomes truthfully.",
            color: "text-yellow-500",
        },
        FAILED: {
            title: "DAY FAILED",
            subtitle: "System record updated.",
            color: "text-red-500",
        },
    };
    const current = notices[pageState];
    return (<div className="mb-12 border-l-2 border-[#1E293B] pl-6 py-2">
        <h2 className={`text-sm font-bold tracking-[0.2em] uppercase mb-1 ${current.color}`}>
            {current.title}
        </h2>
        <p className="text-xs font-mono text-gray-400">{current.subtitle}</p>
    </div>);
}
function DeclarationState({ localGoals, newGoal, setNewGoal, addGoal, removeGoal, lockContract, isSubmitting, existingGoals, }: {
    localGoals: LocalGoal[];
    newGoal: {
        text: string;
        category: GoalCategory;
        finishCondition: string;
        minEffort: string;
        isUncomfortable: boolean;
    };
    setNewGoal: (goal: {
        text: string;
        category: GoalCategory;
        finishCondition: string;
        minEffort: string;
        isUncomfortable: boolean;
    }) => void;
    addGoal: () => void;
    removeGoal: (id: string) => void;
    lockContract: () => void;
    isSubmitting: boolean;
    existingGoals: Goal[];
}) {
    if (existingGoals.length > 0) {
        return (<div className="space-y-12">
            <div className="p-6 border border-green-900/50 bg-green-950/10 text-center">
                <h3 className="text-sm font-bold text-green-500 tracking-[0.2em] uppercase mb-2">
                    Contract Already Locked
                </h3>
                <p className="text-xs font-mono text-green-600/80">
                    Goals have been submitted for today. No modifications allowed.
                </p>
            </div>
            <div className="space-y-4 opacity-50">
                {existingGoals.map((goal, i) => (<div key={goal.id} className="p-6 border border-[#1E293B] bg-[#0B101A] flex justify-between items-center">
                    <div>
                        <div className="text-[10px] text-green-500 font-bold tracking-widest mb-1">
                            CLAUSE 0{i + 1} • {goal.category}
                        </div>
                        <div className="text-white font-mono text-sm">{goal.title}</div>
                        <div className="text-[10px] text-gray-600 mt-1 uppercase">
                            {goal.finishCondition} • Min: {goal.minEffort}
                            {goal.isUncomfortable && " // DISCOMFORT"}
                        </div>
                    </div>
                    <div className="text-[10px] text-green-600 uppercase border border-green-800 px-2 py-1">
                        LOCKED
                    </div>
                </div>))}
            </div>
        </div>);
    }
    return (<div className="space-y-12">
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">
                    Contract Terms
                </h3>
                <span className="text-[10px] font-mono text-gray-600">
                    {localGoals.length} / 10 OBLIGATIONS (Min: 3)
                </span>
            </div>

            <div className="space-y-4">
                {localGoals.map((goal, i) => (<motion.div layout key={goal.id} className="p-6 border border-[#1E293B] bg-[#0B101A] flex justify-between items-center group">
                    <div>
                        <div className="text-[10px] text-blue-500 font-bold tracking-widest mb-1">
                            CLAUSE 0{i + 1} • {CATEGORY_LABELS[goal.category]}
                        </div>
                        <div className="text-white font-mono text-sm">{goal.text}</div>
                        <div className="text-[10px] text-gray-600 mt-1 uppercase">
                            {goal.finishCondition} • Min: {goal.minEffort}
                            {goal.isUncomfortable && " // DISCOMFORT"}
                        </div>
                    </div>
                    <button onClick={() => removeGoal(goal.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-mono text-xs">
                        [DELETE]
                    </button>
                </motion.div>))}

                {localGoals.length < 10 && (<div className="p-6 border border-dashed border-[#1E293B] bg-[#0B101A]/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input value={newGoal.text} onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })} placeholder="Goal Description (e.g. Complete Backend API)" className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none w-full" />
                        <div className="flex gap-4">
                            <select value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })} className="bg-[#050810] border border-[#334155] text-xs text-gray-400 p-2 font-mono outline-none">
                                <option value="STUDY">Study</option>
                                <option value="HEALTH">Health</option>
                                <option value="CAREER">Career</option>
                                <option value="BUILD">Build</option>
                                <option value="SOCIAL">Social</option>
                            </select>
                            <input value={newGoal.finishCondition} onChange={(e) => setNewGoal({ ...newGoal, finishCondition: e.target.value })} placeholder="Finish Condition" className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none flex-1" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <input value={newGoal.minEffort} onChange={(e) => setNewGoal({ ...newGoal, minEffort: e.target.value })} placeholder="Minimum Effort Required" className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none w-full" />
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={newGoal.isUncomfortable} onChange={(e) => setNewGoal({ ...newGoal, isUncomfortable: e.target.checked })} className="w-3 h-3 border border-gray-600 bg-transparent" />
                            <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                                Discomfort Protocol
                            </span>
                        </label>
                        <button onClick={addGoal} disabled={!newGoal.text.trim() || !newGoal.finishCondition.trim() || !newGoal.minEffort.trim()} className="disabled:opacity-30 px-4 py-2 bg-[#1E293B] hover:bg-blue-900 text-white text-[10px] tracking-widest uppercase transition-colors">
                            Add Clause
                        </button>
                    </div>
                </div>)}
            </div>
        </section>

        <div className="pt-8 border-t border-[#1E293B] text-center">
            <button onClick={lockContract} disabled={localGoals.length === 0 || isSubmitting} className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-12 py-4 font-bold tracking-[0.2em] text-sm uppercase transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]">
                {isSubmitting ? (<span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white animate-pulse"></span>
                    Locking...
                </span>) : ("Lock Contract For Today")}
            </button>
            <p className="mt-4 text-[10px] text-gray-500 font-mono">
                This contract cannot be altered once submitted.
            </p>
        </div>
    </div>);
}
function ResolutionState({ goals, groupId, currentDate, refetch, refetchGoals, refetchSystemMode, setPageState }: {
    goals: Goal[];
    groupId: string;
    currentDate: string;
    refetch: () => void;
    refetchGoals: () => Promise<void>;
    refetchSystemMode: () => Promise<void>;
    setPageState: (state: PageState) => void;
}) {
    const [goalOutcomes, setGoalOutcomes] = useState<Map<string, GoalOutcome>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [excuseThrottleWarnings, setExcuseThrottleWarnings] = useState<string[]>([]);
    const hasLockedResults = goals.some(goal => goal.result);
    useEffect(() => {
        if (!hasLockedResults)
            return;
        setGoalOutcomes(prev => {
            const next = new Map(prev);
            for (const goal of goals) {
                if (goal.result) {
                    next.set(goal.id, {
                        status: goal.result.status,
                        failureReason: goal.result.failureReason as FailureReason | undefined,
                    });
                }
            }
            return next;
        });
    }, [goals, hasLockedResults]);
    const setGoalStatus = (goalId: string, status: GoalOutcomeStatus) => {
        if (hasLockedResults)
            return;
        setGoalOutcomes(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(goalId);
            if (status === "FAILED") {
                newMap.set(goalId, { status, failureReason: existing?.failureReason });
            }
            else {
                newMap.set(goalId, { status });
            }
            return newMap;
        });
        setSubmitError(null);
    };
    const setFailureReason = (goalId: string, reason: FailureReason) => {
        if (hasLockedResults)
            return;
        setGoalOutcomes(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(goalId);
            if (existing?.status === "FAILED") {
                newMap.set(goalId, { ...existing, failureReason: reason });
            }
            return newMap;
        });
        setSubmitError(null);
    };
    const allGoalsCheckedIn = goals.every(goal => goalOutcomes.has(goal.id));
    const allFailedGoalsHaveReasons = goals.every(goal => {
        const outcome = goalOutcomes.get(goal.id);
        if (outcome?.status === "FAILED") {
            return !!outcome.failureReason;
        }
        return true;
    });
    const canSubmit = !hasLockedResults && allGoalsCheckedIn && allFailedGoalsHaveReasons;
    const getValidationErrors = (): string[] => {
        const errors: string[] = [];
        if (!allGoalsCheckedIn) {
            errors.push("All goals must have an outcome selected");
        }
        if (!allFailedGoalsHaveReasons) {
            errors.push("All failed goals must have a failure reason");
        }
        return errors;
    };
    const submitCheckin = async () => {
        if (!canSubmit) {
            const errors = getValidationErrors();
            setSubmitError(`️ VALIDATION FAILED: ${errors.join(", ")}`);
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const results = goals.map(goal => {
                const outcome = goalOutcomes.get(goal.id)!;
                return {
                    goalId: goal.id,
                    status: outcome.status,
                    ...(outcome.status === "FAILED" && outcome.failureReason
                        ? { failureReason: outcome.failureReason }
                        : {})
                };
            });
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
            const response = await fetch(`${apiURL}/api/daily-checkin/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    groupId,
                    date: currentDate,
                    results,
                }),
            });
            if (response.status === 201) {
                try {
                    const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
                    const statusResponse = await fetch(`${apiURL}/api/daily-checkin/status/${groupId}/${currentDate}`, { credentials: "include" });
                    if (statusResponse.ok) {
                        const statusResults = await statusResponse.json();
                        const throttledGoals: string[] = [];
                        for (const result of statusResults || []) {
                            const originalOutcome = goalOutcomes.get(result.goalId);
                            if (originalOutcome?.status === "FAILED" &&
                                originalOutcome?.failureReason &&
                                result.failureReason === "SYSTEM_ASSIGNED") {
                                const goal = goals.find(g => g.id === result.goalId);
                                throttledGoals.push(goal?.title || result.goalId);
                            }
                        }
                        if (throttledGoals.length > 0) {
                            setExcuseThrottleWarnings(throttledGoals);
                        }
                    }
                }
                catch (e) {
                    console.warn("Failed to check excuse throttling status:", e);
                }
                await refetchGoals();
                await refetchSystemMode();
                refetch();
                return;
            }
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            const errorMessage = errorData.message || errorData.error || "Check-in submission failed";
            if (response.status === 403) {
                setSubmitError(`️ ${errorMessage}`);
            }
            else if (response.status === 400) {
                const lowerMessage = errorMessage.toLowerCase();
                if (lowerMessage.includes("all goals must be checked in")) {
                    setSubmitError("️ INCOMPLETE: All goals must be checked in");
                }
                else if (lowerMessage.includes("failure reason required")) {
                    setSubmitError("️ MISSING REASON: Failure reason required for failed goals");
                }
                else if (lowerMessage.includes("no goals found")) {
                    setSubmitError("️ NO GOALS: No goals found for this day");
                }
                else if (lowerMessage.includes("already been checked in")) {
                    setSubmitError("️ DUPLICATE: One or more goals have already been checked in");
                }
                else {
                    setSubmitError(`️ VALIDATION ERROR: ${errorMessage}`);
                }
            }
            else if (response.status === 500) {
                setSubmitError("️ SYSTEM ERROR: Server error. Please try again or contact support.");
            }
            else {
                setSubmitError(`️ ERROR: ${errorMessage}`);
            }
        }
        catch (err) {
            console.error("Check-in submission error:", err);
            setSubmitError("️ CONNECTION FAILED: Unable to reach server. Check your connection and retry.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="space-y-8">

        {excuseThrottleWarnings.length > 0 && (<div className="p-4 border border-yellow-900/50 bg-yellow-950/20 flex justify-between items-start">
            <div>
                <div className="text-sm font-bold text-yellow-500 tracking-widest uppercase mb-1">
                    ️ EXCUSE THROTTLING
                </div>
                <p className="text-sm font-mono text-yellow-400">
                    One or more failure reasons were overridden by the system due to repeated use (3+ times in 7 days)
                </p>
                <ul className="mt-2 text-xs font-mono text-yellow-600">
                    {excuseThrottleWarnings.map((goalTitle, i) => (<li key={i}>• {goalTitle}</li>))}
                </ul>
            </div>
            <button onClick={() => setExcuseThrottleWarnings([])} className="text-yellow-600 hover:text-yellow-400 font-mono text-xs ml-4">
                [DISMISS]
            </button>
        </div>)}

        {hasLockedResults && (<div className="p-4 border border-green-900/50 bg-green-950/10 flex justify-between items-start">
            <div>
                <div className="text-sm font-bold text-green-500 tracking-widest uppercase mb-1">
                    ✓ OUTCOMES SUBMITTED
                </div>
                <p className="text-sm font-mono text-green-600/80">
                    This contract has already been checked in. Changes are locked.
                </p>
            </div>
        </div>)}


        {submitError && (<div className="p-4 border border-red-900/50 bg-red-950/20 flex justify-between items-start">
            <div>
                <p className="text-sm font-mono text-red-400">{submitError}</p>
            </div>
            <button onClick={() => setSubmitError(null)} className="text-red-600 hover:text-red-400 font-mono text-xs ml-4">
                [DISMISS]
            </button>
        </div>)}

        {goals.length === 0 && (<div className="text-center text-gray-600 font-mono text-xs py-12">
            No goals to resolve
        </div>)}

        {goals.map((goal, i) => {
            const outcome = goalOutcomes.get(goal.id);
            const isCompleted = outcome?.status === "COMPLETED";
            const isMinEffort = outcome?.status === "MIN_EFFORT";
            const isFailed = outcome?.status === "FAILED";
            return (<div key={goal.id} className="p-8 border border-[#1E293B] bg-[#0B101A]">
                <div className="mb-6">
                    <div className="text-[10px] text-yellow-600 font-bold tracking-widest mb-1">
                        RESOLUTION REQUIRED // CLAUSE 0{i + 1}
                    </div>
                    <div className="text-xl text-white font-mono">{goal.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {goal.category} • {goal.finishCondition}
                    </div>
                </div>


                <div className="grid grid-cols-3 gap-4 mb-4">
                    <button onClick={() => setGoalStatus(goal.id, "COMPLETED")} disabled={hasLockedResults} className={`py-4 border font-bold tracking-[0.2em] text-xs uppercase transition-all ${isCompleted
                        ? "border-green-600 bg-green-900/30 text-green-500"
                        : "border-[#334155] hover:bg-green-900/20 hover:border-green-800 text-gray-400 hover:text-green-500"} ${hasLockedResults ? "opacity-60 cursor-not-allowed" : ""}`}>
                        Completed
                    </button>
                    <button onClick={() => setGoalStatus(goal.id, "MIN_EFFORT")} disabled={hasLockedResults} className={`py-4 border font-bold tracking-[0.2em] text-xs uppercase transition-all ${isMinEffort
                        ? "border-yellow-600 bg-yellow-900/30 text-yellow-500"
                        : "border-[#334155] hover:bg-yellow-900/20 hover:border-yellow-800 text-gray-400 hover:text-yellow-500"} ${hasLockedResults ? "opacity-60 cursor-not-allowed" : ""}`}>
                        Min Effort
                    </button>
                    <button onClick={() => setGoalStatus(goal.id, "FAILED")} disabled={hasLockedResults} className={`py-4 border font-bold tracking-[0.2em] text-xs uppercase transition-all relative overflow-hidden ${isFailed
                        ? "border-red-600 bg-red-900/30 text-red-500"
                        : "border-[#334155] hover:bg-red-900/20 hover:border-red-800 text-gray-400 hover:text-red-500"} ${hasLockedResults ? "opacity-60 cursor-not-allowed" : ""}`}>
                        Failed
                        {!isFailed && (<div className="absolute inset-0 bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>)}
                    </button>
                </div>


                {isFailed && (<div className="mt-4">
                    <label className="text-[10px] text-red-500 font-bold tracking-widest mb-2 block">
                        FAILURE REASON REQUIRED
                    </label>
                    <select value={outcome?.failureReason || ""} onChange={(e) => setFailureReason(goal.id, e.target.value as FailureReason)} disabled={hasLockedResults} className="w-full bg-[#050810] border border-[#334155] text-xs text-gray-400 p-3 font-mono outline-none focus:border-red-600">
                        <option value="">Select failure reason...</option>
                        {(Object.keys(FAILURE_REASON_LABELS) as FailureReason[]).map((reason) => (<option key={reason} value={reason}>
                            {FAILURE_REASON_LABELS[reason]}
                        </option>))}
                    </select>
                </div>)}


                {outcome && (<div className="mt-4 text-[10px] font-mono text-gray-500 uppercase">
                    Status: <span className={isCompleted ? "text-green-500" :
                        isMinEffort ? "text-yellow-500" :
                            "text-red-500"}>
                        {outcome.status.replace("_", " ")}
                    </span>
                    {isFailed && outcome.failureReason && (<span className="text-red-400"> • {FAILURE_REASON_LABELS[outcome.failureReason]}</span>)}
                </div>)}
            </div>);
        })}

        {goals.length > 0 && (<div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-[#0a0e14] border-t border-[#1E293B] flex justify-center z-40">
            <button onClick={submitCheckin} disabled={!canSubmit || isSubmitting} className={`w-full md:w-auto px-12 py-4 font-bold tracking-[0.2em] text-xs uppercase transition-colors ${canSubmit && !isSubmitting
                ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                : "bg-[#1E293B] text-gray-500 cursor-not-allowed"}`}>
                {isSubmitting ? (<span className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-gray-400 animate-pulse"></span>
                    Submitting...
                </span>) : hasLockedResults ? ("Outcomes Submitted") : ("Submit Outcomes")}
            </button>
        </div>)}
    </div>);
}
function FailedState() {
    return (<div className="flex flex-col items-center justify-center py-24 border border-red-900/30 bg-red-950/5">
        <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter uppercase mb-4">
            DAY FAILED
        </h1>
        <p className="text-red-400 font-mono text-sm tracking-widest uppercase">
            System Record Updated
        </p>
        <div className="mt-12 p-4 border border-red-900/50 bg-[#0a0e14]">
            <code className="text-xs text-red-700 font-mono">ERR_PROTOCOL_VIOLATION_0X1</code>
        </div>
    </div>);
}
