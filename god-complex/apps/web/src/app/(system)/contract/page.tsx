"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useTodayGoals } from "@/hooks/useTodayGoals";
import { useSystemMode } from "@/hooks/useSystemMode";
import { Goal, SystemMode } from "@/types/dashboard";

// --- Types & Constants ---
type GoalCategory = "STUDY" | "HEALTH" | "CAREER" | "BUILD" | "SOCIAL";

interface LocalGoal {
    id: string;
    text: string;
    category: GoalCategory;
    finishCondition: string;
    isUncomfortable: boolean;
}

const CATEGORY_LABELS: Record<GoalCategory, string> = {
    STUDY: "Study",
    HEALTH: "Health",
    CAREER: "Career",
    BUILD: "Build",
    SOCIAL: "Social",
};

// Failure reason types matching Prisma schema (excluding SYSTEM_ASSIGNED which is backend-only)
type FailureReason = 
    | "POOR_PLANNING" 
    | "LOW_ENERGY" 
    | "DISTRACTION" 
    | "EXTERNAL_DEPENDENCY" 
    | "FEAR_AVOIDANCE";

const FAILURE_REASON_LABELS: Record<FailureReason, string> = {
    POOR_PLANNING: "Poor Planning",
    LOW_ENERGY: "Low Energy",
    DISTRACTION: "Distraction",
    EXTERNAL_DEPENDENCY: "External Dependency",
    FEAR_AVOIDANCE: "Fear/Avoidance",
};

// Goal outcome status for resolution
type GoalOutcomeStatus = "COMPLETED" | "MIN_EFFORT" | "FAILED";

interface GoalOutcome {
    status: GoalOutcomeStatus;
    failureReason?: FailureReason;
}

// Map backend SystemMode to page display state
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
            return "FAILED"; // Or could show a different "completed" state
        default:
            return "DECLARATION";
    }
}

// --- Contract Page ---
export default function DailyContract() {
    // Context and hooks
    const { groupId, currentDate, loading: contextLoading, error: contextError, refetch } = useDashboardContext();
    const { goals: existingGoals, loading: goalsLoading, error: goalsError, refetch: refetchGoals } = useTodayGoals();
    const { mode: systemMode, loading: modeLoading } = useSystemMode();

    // Derive page state from system mode
    const [pageState, setPageState] = useState<PageState>("DECLARATION");

    // Local form state for goal creation
    const [localGoals, setLocalGoals] = useState<LocalGoal[]>([]);
    const [newGoal, setNewGoal] = useState<{
        text: string;
        category: GoalCategory;
        finishCondition: string;
        isUncomfortable: boolean;
    }>({
        text: "",
        category: "BUILD",
        finishCondition: "",
        isUncomfortable: false,
    });

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Update page state based on system mode and existing goals
    useEffect(() => {
        if (modeLoading) return;

        // If goals already exist, we're past declaration
        if (existingGoals.length > 0) {
            const mappedState = mapSystemModeToPageState(systemMode);
            // If system says DECLARATION but we have goals, show EXECUTION
            if (mappedState === "DECLARATION") {
                setPageState("EXECUTION");
            } else {
                setPageState(mappedState);
            }
        } else {
            setPageState(mapSystemModeToPageState(systemMode));
        }
    }, [systemMode, existingGoals, modeLoading]);

    // --- Actions ---

    const addGoal = () => {
        if (localGoals.length >= 3) return;
        if (!newGoal.text.trim()) return;
        if (!newGoal.finishCondition.trim()) return;

        setLocalGoals([
            ...localGoals,
            {
                id: Math.random().toString(36).substr(2, 9),
                text: newGoal.text.trim(),
                category: newGoal.category,
                finishCondition: newGoal.finishCondition.trim(),
                isUncomfortable: newGoal.isUncomfortable,
            },
        ]);
        setNewGoal({
            text: "",
            category: "BUILD",
            finishCondition: "",
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

        if (localGoals.length === 0) {
            setSubmitError("⚠️ VALIDATION FAILED: At least 1 goal required");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Map frontend goals to backend DailyGoalInput format
            const mappedGoals = localGoals.map((goal) => ({
                title: goal.text,
                category: goal.category,
                finishCondition: goal.finishCondition,
                minEffort: goal.finishCondition, // Use same value for both
                isUncomfortable: goal.isUncomfortable,
            }));

            const response = await fetch("/api/daily-goals/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    groupId,
                    date: currentDate,
                    goals: mappedGoals,
                }),
            });

            if (response.status === 201) {
                // Success - refresh goals data, then transition state
                // Don't clear localGoals until server goals are loaded
                setPageState("EXECUTION");
                await refetchGoals();
                refetch();
                // Now that server goals are loaded, clear local state
                setLocalGoals([]);
                return;
            }

            // Handle error responses
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            const errorMessage = errorData.message || errorData.error || "Submission failed";

            // Map specific error messages to user-friendly versions
            if (response.status === 403 || errorMessage.toLowerCase().includes("cutoff")) {
                setSubmitError("⚠️ CUTOFF PASSED: Cannot submit goals after the daily cutoff time");
            } else if (errorMessage.toLowerCase().includes("already submitted") || errorMessage.toLowerCase().includes("duplicate")) {
                setSubmitError("⚠️ DUPLICATE SUBMISSION: Contract already locked for today");
            } else if (errorMessage.toLowerCase().includes("uncomfortable") || errorMessage.toLowerCase().includes("discomfort")) {
                setSubmitError("⚠️ DISCOMFORT PROTOCOL: At least 1 uncomfortable goal required this week");
            } else if (errorMessage.toLowerCase().includes("at least one goal")) {
                setSubmitError("⚠️ VALIDATION FAILED: At least 1 goal required");
            } else if (response.status === 500) {
                setSubmitError("⚠️ SYSTEM ERROR: Server error. Please try again or contact support.");
            } else {
                setSubmitError(`⚠️ ERROR: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Goal submission error:", err);
            setSubmitError("⚠️ CONNECTION FAILED: Unable to reach server. Check your connection and retry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Loading States ---

    const isLoading = contextLoading || goalsLoading || modeLoading;

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#0a0e14] pb-32">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-3 h-3 bg-blue-500 animate-pulse mb-4"></div>
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                            Loading Contract Data...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // --- No Active Group State ---

    if (!groupId) {
        return (
            <main className="min-h-screen bg-[#0a0e14] pb-32">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <Header pageState="DECLARATION" />
                    <div className="p-8 border border-yellow-900/50 bg-yellow-950/10 text-center">
                        <h2 className="text-xl font-bold text-yellow-500 tracking-[0.2em] uppercase mb-2">
                            No Active Group
                        </h2>
                        <p className="text-sm font-mono text-yellow-600/80">
                            {contextError || "You must join a group before creating daily contracts."}
                        </p>
                        <a
                            href="/groups"
                            className="inline-block mt-6 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold tracking-[0.2em] text-xs uppercase transition-colors"
                        >
                            Join a Group
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    // --- Components ---

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <Header pageState={pageState} />
                <SystemNotice pageState={pageState} />

                {/* Error Banner */}
                {submitError && (
                    <div className="mb-8 p-4 border border-red-900/50 bg-red-950/20 flex justify-between items-start">
                        <div>
                            <p className="text-sm font-mono text-red-400">{submitError}</p>
                        </div>
                        <button
                            onClick={() => setSubmitError(null)}
                            className="text-red-600 hover:text-red-400 font-mono text-xs ml-4"
                        >
                            [DISMISS]
                        </button>
                    </div>
                )}

                {/* Goals Error */}
                {goalsError && (
                    <div className="mb-8 p-4 border border-orange-900/50 bg-orange-950/20">
                        <p className="text-sm font-mono text-orange-400">⚠️ {goalsError}</p>
                    </div>
                )}

                {/* DECLARATION STATE */}
                {pageState === "DECLARATION" && (
                    <DeclarationState
                        localGoals={localGoals}
                        newGoal={newGoal}
                        setNewGoal={setNewGoal}
                        addGoal={addGoal}
                        removeGoal={removeGoal}
                        lockContract={lockContract}
                        isSubmitting={isSubmitting}
                        existingGoals={existingGoals}
                    />
                )}

                {/* EXECUTION STATE */}
                {pageState === "EXECUTION" && (
                    <ExecutionState goals={existingGoals} localGoals={localGoals} />
                )}

                {/* RESOLUTION STATE */}
                {pageState === "RESOLUTION" && (
                    <ResolutionState 
                        goals={existingGoals} 
                        groupId={groupId!}
                        currentDate={currentDate}
                        refetch={refetch}
                        refetchGoals={refetchGoals}
                        setPageState={setPageState}
                    />
                )}

                {/* FAILED STATE */}
                {pageState === "FAILED" && <FailedState />}
            </div>
        </main>
    );
}

// --- Sub-Components ---

function Header({ pageState }: { pageState: PageState }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 py-8 border-b border-[#1E293B]">
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
                    {pageState === "DECLARATION" && "DECLARATION OPEN"}
                    {pageState === "EXECUTION" && "EXECUTION LOCKED"}
                    {pageState === "RESOLUTION" && "RESOLUTION OPEN"}
                    {pageState === "FAILED" && "CONTRACT VOID"}
                </div>
            </div>
        </div>
    );
}

function SystemNotice({ pageState }: { pageState: PageState }) {
    const notices: Record<PageState, { title: string; subtitle: string; color: string }> = {
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

    return (
        <div className="mb-12 border-l-2 border-[#1E293B] pl-6 py-2">
            <h2 className={`text-sm font-bold tracking-[0.2em] uppercase mb-1 ${current.color}`}>
                {current.title}
            </h2>
            <p className="text-xs font-mono text-gray-400">{current.subtitle}</p>
        </div>
    );
}

function DeclarationState({
    localGoals,
    newGoal,
    setNewGoal,
    addGoal,
    removeGoal,
    lockContract,
    isSubmitting,
    existingGoals,
}: {
    localGoals: LocalGoal[];
    newGoal: { text: string; category: GoalCategory; finishCondition: string; isUncomfortable: boolean };
    setNewGoal: (goal: { text: string; category: GoalCategory; finishCondition: string; isUncomfortable: boolean }) => void;
    addGoal: () => void;
    removeGoal: (id: string) => void;
    lockContract: () => void;
    isSubmitting: boolean;
    existingGoals: Goal[];
}) {
    // If goals already exist, show them as locked
    if (existingGoals.length > 0) {
        return (
            <div className="space-y-12">
                <div className="p-6 border border-green-900/50 bg-green-950/10 text-center">
                    <h3 className="text-sm font-bold text-green-500 tracking-[0.2em] uppercase mb-2">
                        Contract Already Locked
                    </h3>
                    <p className="text-xs font-mono text-green-600/80">
                        Goals have been submitted for today. No modifications allowed.
                    </p>
                </div>
                <div className="space-y-4 opacity-50">
                    {existingGoals.map((goal, i) => (
                        <div
                            key={goal.id}
                            className="p-6 border border-[#1E293B] bg-[#0B101A] flex justify-between items-center"
                        >
                            <div>
                                <div className="text-[10px] text-green-500 font-bold tracking-widest mb-1">
                                    CLAUSE 0{i + 1} • {goal.category}
                                </div>
                                <div className="text-white font-mono text-sm">{goal.title}</div>
                                <div className="text-[10px] text-gray-600 mt-1 uppercase">
                                    {goal.finishCondition}
                                    {goal.isUncomfortable && " // DISCOMFORT"}
                                </div>
                            </div>
                            <div className="text-[10px] text-green-600 uppercase border border-green-800 px-2 py-1">
                                LOCKED
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">
                        Contract Terms
                    </h3>
                    <span className="text-[10px] font-mono text-gray-600">
                        {localGoals.length} / 3 OBLIGATIONS
                    </span>
                </div>

                <div className="space-y-4">
                    {localGoals.map((goal, i) => (
                        <motion.div
                            layout
                            key={goal.id}
                            className="p-6 border border-[#1E293B] bg-[#0B101A] flex justify-between items-center group"
                        >
                            <div>
                                <div className="text-[10px] text-blue-500 font-bold tracking-widest mb-1">
                                    CLAUSE 0{i + 1} • {CATEGORY_LABELS[goal.category]}
                                </div>
                                <div className="text-white font-mono text-sm">{goal.text}</div>
                                <div className="text-[10px] text-gray-600 mt-1 uppercase">
                                    {goal.finishCondition}
                                    {goal.isUncomfortable && " // DISCOMFORT"}
                                </div>
                            </div>
                            <button
                                onClick={() => removeGoal(goal.id)}
                                className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-mono text-xs"
                            >
                                [DELETE]
                            </button>
                        </motion.div>
                    ))}

                    {localGoals.length < 3 && (
                        <div className="p-6 border border-dashed border-[#1E293B] bg-[#0B101A]/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    value={newGoal.text}
                                    onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                                    placeholder="Goal Description (e.g. Complete Backend API)"
                                    className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none w-full"
                                />
                                <div className="flex gap-4">
                                    <select
                                        value={newGoal.category}
                                        onChange={(e) =>
                                            setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })
                                        }
                                        className="bg-[#050810] border border-[#334155] text-xs text-gray-400 p-2 font-mono outline-none"
                                    >
                                        <option value="STUDY">Study</option>
                                        <option value="HEALTH">Health</option>
                                        <option value="CAREER">Career</option>
                                        <option value="BUILD">Build</option>
                                        <option value="SOCIAL">Social</option>
                                    </select>
                                    <input
                                        value={newGoal.finishCondition}
                                        onChange={(e) =>
                                            setNewGoal({ ...newGoal, finishCondition: e.target.value })
                                        }
                                        placeholder="Finish Condition"
                                        className="bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none flex-1"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newGoal.isUncomfortable}
                                        onChange={(e) =>
                                            setNewGoal({ ...newGoal, isUncomfortable: e.target.checked })
                                        }
                                        className="w-3 h-3 border border-gray-600 bg-transparent"
                                    />
                                    <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                                        Discomfort Protocol
                                    </span>
                                </label>
                                <button
                                    onClick={addGoal}
                                    disabled={!newGoal.text.trim() || !newGoal.finishCondition.trim()}
                                    className="disabled:opacity-30 px-4 py-2 bg-[#1E293B] hover:bg-blue-900 text-white text-[10px] tracking-widest uppercase transition-colors"
                                >
                                    Add Clause
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className="pt-8 border-t border-[#1E293B] text-center">
                <button
                    onClick={lockContract}
                    disabled={localGoals.length === 0 || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-12 py-4 font-bold tracking-[0.2em] text-sm uppercase transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-white animate-pulse"></span>
                            Locking...
                        </span>
                    ) : (
                        "Lock Contract For Today"
                    )}
                </button>
                <p className="mt-4 text-[10px] text-gray-500 font-mono">
                    This contract cannot be altered once submitted.
                </p>
            </div>
        </div>
    );
}

function ExecutionState({ goals, localGoals }: { goals: Goal[]; localGoals: LocalGoal[] }) {
    // Use existing goals from API, fall back to local goals for immediate UI update
    const displayGoals = goals.length > 0 ? goals : localGoals;

    return (
        <div className="space-y-12">
            <div className="p-12 border border-[#1E293B] bg-[#0B101A] flex flex-col items-center justify-center text-center">
                <div className="w-3 h-3 bg-blue-500 animate-pulse mb-4"></div>
                <h2 className="text-xl font-bold text-white tracking-[0.3em] uppercase mb-2">
                    Contract Active
                </h2>
                <p className="text-xs font-mono text-gray-500">
                    Execution in progress. No intervention permitted.
                </p>
            </div>

            <div className="opacity-50 pointer-events-none">
                {displayGoals.length === 0 && (
                    <div className="text-center text-gray-600 font-mono text-xs">
                        No goals declared
                    </div>
                )}
                {displayGoals.map((goal, i) => {
                    // Handle both Goal and LocalGoal types
                    const title = "title" in goal ? goal.title : goal.text;
                    const category = goal.category;
                    const isUncomfortable = "isUncomfortable" in goal ? goal.isUncomfortable : false;

                    return (
                        <div
                            key={goal.id}
                            className="p-6 border-b border-[#1E293B] flex justify-between items-center"
                        >
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">
                                    CLAUSE 0{i + 1} • {category}
                                    {isUncomfortable && " • DISCOMFORT"}
                                </div>
                                <div className="text-white font-mono text-sm">{title}</div>
                            </div>
                            <div className="text-[10px] text-gray-600 uppercase border border-gray-800 px-2 py-1">
                                LOCKED
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-[#0a0e14] border-t border-[#1E293B] flex justify-center z-40">
                <button
                    disabled
                    className="w-full md:w-auto px-8 py-3 bg-[#1E293B] text-gray-500 font-bold tracking-[0.2em] text-[10px] uppercase cursor-not-allowed"
                >
                    Action Locked By System
                </button>
            </div>
        </div>
    );
}

function ResolutionState({ 
    goals, 
    groupId, 
    currentDate, 
    refetch, 
    refetchGoals,
    setPageState 
}: { 
    goals: Goal[]; 
    groupId: string;
    currentDate: string;
    refetch: () => void;
    refetchGoals: () => Promise<void>;
    setPageState: (state: PageState) => void;
}) {
    // State for tracking goal outcomes
    const [goalOutcomes, setGoalOutcomes] = useState<Map<string, GoalOutcome>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [excuseThrottleWarnings, setExcuseThrottleWarnings] = useState<string[]>([]);

    // Set outcome for a goal
    const setGoalStatus = (goalId: string, status: GoalOutcomeStatus) => {
        setGoalOutcomes(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(goalId);
            if (status === "FAILED") {
                // Keep existing failure reason if any
                newMap.set(goalId, { status, failureReason: existing?.failureReason });
            } else {
                // Clear failure reason for non-failed goals
                newMap.set(goalId, { status });
            }
            return newMap;
        });
        setSubmitError(null);
    };

    // Set failure reason for a goal
    const setFailureReason = (goalId: string, reason: FailureReason) => {
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

    // Validation
    const allGoalsCheckedIn = goals.every(goal => goalOutcomes.has(goal.id));
    const allFailedGoalsHaveReasons = goals.every(goal => {
        const outcome = goalOutcomes.get(goal.id);
        if (outcome?.status === "FAILED") {
            return !!outcome.failureReason;
        }
        return true;
    });
    const canSubmit = allGoalsCheckedIn && allFailedGoalsHaveReasons;

    // Get validation errors for display
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

    // Submit check-in
    const submitCheckin = async () => {
        if (!canSubmit) {
            const errors = getValidationErrors();
            setSubmitError(`⚠️ VALIDATION FAILED: ${errors.join(", ")}`);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Build results payload
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

            const response = await fetch("/api/daily-checkin/", {
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
                // Success - check for excuse throttling
                try {
                    const statusResponse = await fetch(
                        `/api/daily-checkin/status/${groupId}/${currentDate}`,
                        { credentials: "include" }
                    );
                    
                    if (statusResponse.ok) {
                        // API returns array directly, not wrapped in { results: [...] }
                        const statusResults = await statusResponse.json();
                        // Check if any submitted reasons were changed to SYSTEM_ASSIGNED
                        const throttledGoals: string[] = [];
                        for (const result of statusResults || []) {
                            const originalOutcome = goalOutcomes.get(result.goalId);
                            if (
                                originalOutcome?.status === "FAILED" &&
                                originalOutcome?.failureReason &&
                                result.failureReason === "SYSTEM_ASSIGNED"
                            ) {
                                const goal = goals.find(g => g.id === result.goalId);
                                throttledGoals.push(goal?.title || result.goalId);
                            }
                        }
                        if (throttledGoals.length > 0) {
                            setExcuseThrottleWarnings(throttledGoals);
                        }
                    }
                } catch (e) {
                    // Ignore status check errors - main submission succeeded
                    console.warn("Failed to check excuse throttling status:", e);
                }

                // Refresh data and let system mode determine page state
                await refetchGoals();
                refetch();
                // Don't force FAILED state - let the useEffect derive state from refreshed system mode
                return;
            }

            // Handle error responses
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            const errorMessage = errorData.message || errorData.error || "Check-in submission failed";

            if (response.status === 403) {
                setSubmitError("⚠️ CHECK-IN WINDOW CLOSED: This day has passed or is not yet active");
            } else if (response.status === 400) {
                // Map specific validation errors
                const lowerMessage = errorMessage.toLowerCase();
                if (lowerMessage.includes("all goals must be checked in")) {
                    setSubmitError("⚠️ INCOMPLETE: All goals must be checked in");
                } else if (lowerMessage.includes("failure reason required")) {
                    setSubmitError("⚠️ MISSING REASON: Failure reason required for failed goals");
                } else if (lowerMessage.includes("no goals found")) {
                    setSubmitError("⚠️ NO GOALS: No goals found for this day");
                } else if (lowerMessage.includes("already been checked in")) {
                    setSubmitError("⚠️ DUPLICATE: One or more goals have already been checked in");
                } else {
                    setSubmitError(`⚠️ VALIDATION ERROR: ${errorMessage}`);
                }
            } else if (response.status === 500) {
                setSubmitError("⚠️ SYSTEM ERROR: Server error. Please try again or contact support.");
            } else {
                setSubmitError(`⚠️ ERROR: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Check-in submission error:", err);
            setSubmitError("⚠️ CONNECTION FAILED: Unable to reach server. Check your connection and retry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Excuse Throttling Warning */}
            {excuseThrottleWarnings.length > 0 && (
                <div className="p-4 border border-yellow-900/50 bg-yellow-950/20 flex justify-between items-start">
                    <div>
                        <div className="text-sm font-bold text-yellow-500 tracking-widest uppercase mb-1">
                            ⚠️ EXCUSE THROTTLING
                        </div>
                        <p className="text-sm font-mono text-yellow-400">
                            One or more failure reasons were overridden by the system due to repeated use (3+ times in 7 days)
                        </p>
                        <ul className="mt-2 text-xs font-mono text-yellow-600">
                            {excuseThrottleWarnings.map((goalTitle, i) => (
                                <li key={i}>• {goalTitle}</li>
                            ))}
                        </ul>
                    </div>
                    <button
                        onClick={() => setExcuseThrottleWarnings([])}
                        className="text-yellow-600 hover:text-yellow-400 font-mono text-xs ml-4"
                    >
                        [DISMISS]
                    </button>
                </div>
            )}

            {/* Error Banner */}
            {submitError && (
                <div className="p-4 border border-red-900/50 bg-red-950/20 flex justify-between items-start">
                    <div>
                        <p className="text-sm font-mono text-red-400">{submitError}</p>
                    </div>
                    <button
                        onClick={() => setSubmitError(null)}
                        className="text-red-600 hover:text-red-400 font-mono text-xs ml-4"
                    >
                        [DISMISS]
                    </button>
                </div>
            )}

            {goals.length === 0 && (
                <div className="text-center text-gray-600 font-mono text-xs py-12">
                    No goals to resolve
                </div>
            )}

            {goals.map((goal, i) => {
                const outcome = goalOutcomes.get(goal.id);
                const isCompleted = outcome?.status === "COMPLETED";
                const isMinEffort = outcome?.status === "MIN_EFFORT";
                const isFailed = outcome?.status === "FAILED";

                return (
                    <div key={goal.id} className="p-8 border border-[#1E293B] bg-[#0B101A]">
                        <div className="mb-6">
                            <div className="text-[10px] text-yellow-600 font-bold tracking-widest mb-1">
                                RESOLUTION REQUIRED // CLAUSE 0{i + 1}
                            </div>
                            <div className="text-xl text-white font-mono">{goal.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {goal.category} • {goal.finishCondition}
                            </div>
                        </div>

                        {/* Outcome Selection Buttons */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <button
                                onClick={() => setGoalStatus(goal.id, "COMPLETED")}
                                className={`py-4 border font-bold tracking-[0.2em] text-xs uppercase transition-all ${
                                    isCompleted
                                        ? "border-green-600 bg-green-900/30 text-green-500"
                                        : "border-[#334155] hover:bg-green-900/20 hover:border-green-800 text-gray-400 hover:text-green-500"
                                }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setGoalStatus(goal.id, "MIN_EFFORT")}
                                className={`py-4 border font-bold tracking-[0.2em] text-xs uppercase transition-all ${
                                    isMinEffort
                                        ? "border-yellow-600 bg-yellow-900/30 text-yellow-500"
                                        : "border-[#334155] hover:bg-yellow-900/20 hover:border-yellow-800 text-gray-400 hover:text-yellow-500"
                                }`}
                            >
                                Min Effort
                            </button>
                            <button
                                onClick={() => setGoalStatus(goal.id, "FAILED")}
                                className={`py-4 border font-bold tracking-[0.2em] text-xs uppercase transition-all relative overflow-hidden ${
                                    isFailed
                                        ? "border-red-600 bg-red-900/30 text-red-500"
                                        : "border-[#334155] hover:bg-red-900/20 hover:border-red-800 text-gray-400 hover:text-red-500"
                                }`}
                            >
                                Failed
                                {!isFailed && (
                                    <div className="absolute inset-0 bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                )}
                            </button>
                        </div>

                        {/* Failure Reason Selector */}
                        {isFailed && (
                            <div className="mt-4">
                                <label className="text-[10px] text-red-500 font-bold tracking-widest mb-2 block">
                                    FAILURE REASON REQUIRED
                                </label>
                                <select
                                    value={outcome?.failureReason || ""}
                                    onChange={(e) => setFailureReason(goal.id, e.target.value as FailureReason)}
                                    className="w-full bg-[#050810] border border-[#334155] text-xs text-gray-400 p-3 font-mono outline-none focus:border-red-600"
                                >
                                    <option value="">Select failure reason...</option>
                                    {(Object.keys(FAILURE_REASON_LABELS) as FailureReason[]).map((reason) => (
                                        <option key={reason} value={reason}>
                                            {FAILURE_REASON_LABELS[reason]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Selected Status Display */}
                        {outcome && (
                            <div className="mt-4 text-[10px] font-mono text-gray-500 uppercase">
                                Status: <span className={
                                    isCompleted ? "text-green-500" : 
                                    isMinEffort ? "text-yellow-500" : 
                                    "text-red-500"
                                }>
                                    {outcome.status.replace("_", " ")}
                                </span>
                                {isFailed && outcome.failureReason && (
                                    <span className="text-red-400"> • {FAILURE_REASON_LABELS[outcome.failureReason]}</span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {goals.length > 0 && (
                <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-[#0a0e14] border-t border-[#1E293B] flex justify-center z-40">
                    <button
                        onClick={submitCheckin}
                        disabled={!canSubmit || isSubmitting}
                        className={`w-full md:w-auto px-12 py-4 font-bold tracking-[0.2em] text-xs uppercase transition-colors ${
                            canSubmit && !isSubmitting
                                ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                                : "bg-[#1E293B] text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2 justify-center">
                                <span className="w-2 h-2 bg-gray-400 animate-pulse"></span>
                                Submitting...
                            </span>
                        ) : (
                            "Submit Outcomes"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

function FailedState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 border border-red-900/30 bg-red-950/5">
            <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter uppercase mb-4">
                DAY FAILED
            </h1>
            <p className="text-red-400 font-mono text-sm tracking-widest uppercase">
                System Record Updated
            </p>
            <div className="mt-12 p-4 border border-red-900/50 bg-[#0a0e14]">
                <code className="text-xs text-red-700 font-mono">ERR_PROTOCOL_VIOLATION_0X1</code>
            </div>
        </div>
    );
}
