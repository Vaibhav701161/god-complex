"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Group, CreateGroupInput } from "@/types/dashboard";

// --- Constants ---
const VALID_TIMEZONES = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern (New York)" },
    { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
    { value: "America/Chicago", label: "Central (Chicago)" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Europe/Berlin", label: "Berlin" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Asia/Shanghai", label: "Shanghai" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Kolkata", label: "India (Kolkata)" },
    { value: "Australia/Sydney", label: "Sydney" },
];

export default function GroupsPage() {
    const { user, loading: userLoading } = useUser();
    const [view, setView] = useState<"LIST" | "CREATE">("LIST");
    const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

    // Groups state
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's groups on mount
    useEffect(() => {
        async function fetchGroups() {
            if (!user?.memberships || user.memberships.length === 0) {
                setGroups([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const groupIds = user.memberships.map((m) => m.groupId);
                const uniqueGroupIds = [...new Set(groupIds)];

                const groupPromises = uniqueGroupIds.map(async (groupId) => {
                    const response = await fetch(`/api/groups/${groupId}`, {
                        credentials: "include",
                    });
                    if (!response.ok) return null;
                    return response.json();
                });

                const results = await Promise.all(groupPromises);
                const validGroups = results.filter((g): g is Group => g !== null);
                setGroups(validGroups);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load groups");
            } finally {
                setLoading(false);
            }
        }

        if (!userLoading) {
            fetchGroups();
        }
    }, [user, userLoading]);

    // Refetch groups after creation
    const refetchGroups = async () => {
        if (!user?.memberships) return;
        
        const groupIds = user.memberships.map((m) => m.groupId);
        const uniqueGroupIds = [...new Set(groupIds)];

        const groupPromises = uniqueGroupIds.map(async (groupId) => {
            const response = await fetch(`/api/groups/${groupId}`, {
                credentials: "include",
            });
            if (!response.ok) return null;
            return response.json();
        });

        const results = await Promise.all(groupPromises);
        const validGroups = results.filter((g): g is Group => g !== null);
        setGroups(validGroups);
    };

    // --- Components ---

    const CreateForm = () => {
        const [formData, setFormData] = useState<CreateGroupInput>({
            name: "",
            monthlyPledge: 0,
            cutoffHour: 4,
            timezone: "UTC",
        });
        const [formError, setFormError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleCreateGroup = async () => {
            // Validation
            if (!formData.name || formData.name.length < 3) {
                setFormError("Name must be at least 3 characters");
                return;
            }
            if (formData.monthlyPledge < 0) {
                setFormError("Monthly pledge must be non-negative");
                return;
            }
            if (formData.cutoffHour < 0 || formData.cutoffHour > 23) {
                setFormError("Cutoff hour must be between 0 and 23");
                return;
            }

            setIsSubmitting(true);
            setFormError(null);

            try {
                const response = await fetch("/api/groups", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(formData),
                });

                if (response.status === 201) {
                    // Success - reload page to get updated user with new membership
                    window.location.reload();
                    return;
                }

                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                const errorMessage = errorData.message || errorData.error || "Failed to create group";

                if (response.status === 400) {
                    setFormError(`⚠️ VALIDATION ERROR: ${errorMessage}`);
                } else if (response.status === 500) {
                    setFormError("⚠️ SYSTEM ERROR: Server error. Please try again.");
                } else {
                    setFormError(`⚠️ ERROR: ${errorMessage}`);
                }
            } catch (err) {
                setFormError("⚠️ CONNECTION FAILED: Unable to reach server.");
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div className="max-w-xl mx-auto border border-[#1E293B] bg-[#0B101A] p-8 md:p-12">
                <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase mb-8">Define New Protocol</h2>

                {formError && (
                    <div className="mb-6 p-4 border border-red-900/50 bg-red-950/20">
                        <p className="text-sm font-mono text-red-400">{formError}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Contract Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Q1 Operational Bind"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Monthly Pledge ($)</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.monthlyPledge}
                                onChange={(e) => setFormData({ ...formData, monthlyPledge: Number(e.target.value) })}
                                className="w-full bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Cutoff Hour (0-23)</label>
                            <input
                                type="number"
                                min={0}
                                max={23}
                                value={formData.cutoffHour}
                                onChange={(e) => setFormData({ ...formData, cutoffHour: Number(e.target.value) })}
                                className="w-full bg-transparent border-b border-[#334155] text-white p-2 font-mono text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Timezone</label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            className="w-full bg-[#050810] border border-[#334155] text-gray-400 p-3 font-mono text-xs outline-none"
                        >
                            {VALID_TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Penalty / Stake</label>
                        <input
                            disabled
                            type="text"
                            value="Standard Excuse Tax (Immutable)"
                            className="w-full bg-[#050810] border border-[#334155] text-gray-500 p-3 font-mono text-xs opacity-70 cursor-not-allowed"
                        />
                        <p className="mt-2 text-[10px] text-gray-600 font-mono">
                            * Contracts override individual excuses. Protocol is absolute.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex gap-4">
                    <button
                        onClick={() => setView("LIST")}
                        className="flex-1 py-4 border border-[#334155] text-gray-400 hover:text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateGroup}
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]"
                    >
                        {isSubmitting ? "Creating..." : "Initiate Contract"}
                    </button>
                </div>
            </div>
        );
    };

    // Loading state
    if (userLoading || loading) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">LOADING GROUPS...</div>
            </main>
        );
    }

    // Error state
    if (error) {
        return (
            <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-red-500 font-mono text-sm tracking-widest">ERROR: {error}</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0e14] pb-32 p-6 md:p-12">
            {/* Header */}
            <div className="flex justify-between items-end mb-12 border-b border-[#1E293B] pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-[0.2em] uppercase mb-2">Group Contracts</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase">Enforcement is stronger when witnessed.</p>
                </div>
                {view === "LIST" && (
                    <button
                        onClick={() => setView("CREATE")}
                        className="px-6 py-3 border border-blue-900/50 text-blue-500 hover:bg-blue-900/10 font-bold tracking-[0.2em] text-[10px] uppercase transition-colors"
                    >
                        Create New Contract
                    </button>
                )}
            </div>

            {/* Content */}
            {view === "CREATE" ? (
                <CreateForm />
            ) : groups.length === 0 ? (
                <div className="max-w-xl mx-auto text-center py-16 border border-[#1E293B] bg-[#0B101A]">
                    <h2 className="text-xl font-bold text-gray-500 tracking-[0.2em] uppercase mb-4">No Groups</h2>
                    <p className="text-sm font-mono text-gray-600 mb-8">You are not a member of any accountability group.</p>
                    <button
                        onClick={() => setView("CREATE")}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors"
                    >
                        Create Your First Group
                    </button>
                </div>
            ) : (
                <div className="space-y-6 max-w-5xl">
                    {groups.map((group) => {
                        const isExpanded = expandedContractId === group.id;

                        return (
                            <div
                                key={group.id}
                                className={`border transition-all duration-300 ${isExpanded ? "border-blue-900/50 bg-[#0B101A]" : "border-[#1E293B] bg-[#0B101A]/50 hover:border-gray-700"}`}
                            >
                                {/* Card Header / Summary */}
                                <div
                                    onClick={() => setExpandedContractId(isExpanded ? null : group.id)}
                                    className="p-6 cursor-pointer flex items-center justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">{group.name}</h3>
                                            <span className="text-[9px] text-gray-500 border border-gray-800 px-1">
                                                ${group.monthlyPledge}/mo
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-500">
                                            MEMBERS: {group.memberCount || 0} // CUTOFF: {group.cutoffHour}:00 {group.timezone}
                                        </div>
                                    </div>
                                    <div className={`text-gray-500 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</div>
                                </div>

                                {/* Expanded Detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-[#1E293B]"
                                        >
                                            <div className="p-6 bg-[#050810]/50">
                                                <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-mono">
                                                    <div>
                                                        <span className="text-gray-500">Created by:</span>{" "}
                                                        <span className="text-gray-300">{group.creator?.displayName || group.creator?.name || "Unknown"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Timezone:</span>{" "}
                                                        <span className="text-gray-300">{group.timezone}</span>
                                                    </div>
                                                </div>

                                                {group.memberships && group.memberships.length > 0 && (
                                                    <>
                                                        <div className="text-[9px] text-gray-600 font-bold tracking-widest uppercase mb-4">
                                                            Active Members This Month
                                                        </div>
                                                        <div className="space-y-2">
                                                            {group.memberships.map((membership) => (
                                                                <div
                                                                    key={membership.userId}
                                                                    className="p-3 border border-[#1E293B]/50 bg-[#0B101A] flex justify-between items-center"
                                                                >
                                                                    <span className="font-mono text-sm text-gray-300">
                                                                        {membership.user?.displayName || membership.user?.name || "Unknown"}
                                                                    </span>
                                                                    <span className="text-[9px] text-green-500 border border-green-800 px-2 py-0.5">
                                                                        ACTIVE
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}

                                                <div className="mt-8 text-center">
                                                    <p className="text-[10px] text-gray-600 font-mono italic">"System evaluates group integrity daily."</p>
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
