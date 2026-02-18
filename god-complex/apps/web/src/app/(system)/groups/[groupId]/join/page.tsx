"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Group } from "@/types/dashboard";
import Link from "next/link";
export default function JoinGroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [hasPenaltyBlock, setHasPenaltyBlock] = useState(false);
    useEffect(() => {
        async function fetchGroup() {
            try {
                setLoading(true);
                const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
                const response = await fetch(`${apiURL}/api/groups/${groupId}`, {
                    credentials: "include",
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Group not found");
                    }
                    else {
                        setError("Failed to load group details");
                    }
                    return;
                }
                const data = await response.json();
                setGroup(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load group");
            }
            finally {
                setLoading(false);
            }
        }
        if (groupId) {
            fetchGroup();
        }
    }, [groupId]);
    const handleJoin = async () => {
        setIsJoining(true);
        setJoinError(null);
        setHasPenaltyBlock(false);
        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
            const response = await fetch(`${apiURL}/api/groups/${groupId}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                router.push("/dashboard");
                return;
            }
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            const errorMessage = errorData.message || errorData.error || "Failed to join group";
            const lowerMessage = errorMessage.toLowerCase();
            if (response.status === 403) {
                if (lowerMessage.includes("penalties") || lowerMessage.includes("failed")) {
                    setHasPenaltyBlock(true);
                    setJoinError("️ PENALTY BLOCK: You have unresolved failed penalties. Clear them before joining.");
                }
                else {
                    setJoinError("️ ACCESS DENIED: You are not permitted to join this group.");
                }
            }
            else if (response.status === 400) {
                if (lowerMessage.includes("already a member")) {
                    setJoinError("️ ALREADY MEMBER: You are already a member of this group.");
                }
                else {
                    setJoinError(`️ VALIDATION ERROR: ${errorMessage}`);
                }
            }
            else if (response.status === 404) {
                setJoinError("️ NOT FOUND: Group no longer exists.");
            }
            else if (response.status === 500) {
                setJoinError("️ SYSTEM ERROR: Server error. Please try again.");
            }
            else {
                setJoinError(`️ ERROR: ${errorMessage}`);
            }
        }
        catch (err) {
            setJoinError("️ CONNECTION FAILED: Unable to reach server.");
        }
        finally {
            setIsJoining(false);
        }
    };
    if (loading) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">LOADING GROUP...</div>
            </main>);
    }
    if (error || !group) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
                <div className="max-w-md text-center border border-red-900/50 bg-red-950/10 p-8">
                    <h2 className="text-xl font-bold text-red-500 tracking-[0.2em] uppercase mb-4">Error</h2>
                    <p className="text-sm font-mono text-red-400 mb-6">{error || "Group not found"}</p>
                    <Link href="/groups" className="inline-block px-6 py-3 border border-gray-700 text-gray-400 hover:text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors">
                        Back to Groups
                    </Link>
                </div>
            </main>);
    }
    return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-white tracking-[0.2em] uppercase mb-2">Join Group</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase">Review contract terms before binding</p>
                </div>

                
                <div className="border border-[#1E293B] bg-[#0B101A] p-8 mb-6">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-6">{group.name}</h2>

                    <div className="space-y-4 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Monthly Pledge:</span>
                            <span className="text-white">${group.monthlyPledge}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Daily Cutoff:</span>
                            <span className="text-white">{group.cutoffHour}:00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Timezone:</span>
                            <span className="text-white">{group.timezone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Active Members:</span>
                            <span className="text-white">{group.memberCount || 0}</span>
                        </div>
                        {group.creator && (<div className="flex justify-between">
                                <span className="text-gray-500">Created By:</span>
                                <span className="text-white">{group.creator.displayName || group.creator.name}</span>
                            </div>)}
                    </div>
                </div>

                
                <div className="border border-yellow-900/50 bg-yellow-950/10 p-6 mb-6">
                    <h3 className="text-sm font-bold text-yellow-500 tracking-widest uppercase mb-2">Commitment Notice</h3>
                    <p className="text-xs font-mono text-yellow-600/80">
                        By joining this group, you commit to daily accountability for the current month. Failure to meet
                        obligations may result in penalties and group visibility of your performance.
                    </p>
                </div>

                
                {joinError && (<div className="border border-red-900/50 bg-red-950/20 p-4 mb-6">
                        <p className="text-sm font-mono text-red-400">{joinError}</p>
                        {hasPenaltyBlock && (<Link href="/penalties" className="inline-block mt-4 px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 font-bold tracking-widest text-[10px] uppercase transition-colors">
                                View Penalties →
                            </Link>)}
                    </div>)}

                
                <div className="flex gap-4">
                    <Link href="/groups" className="flex-1 py-4 border border-[#334155] text-gray-400 hover:text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors text-center">
                        Cancel
                    </Link>
                    <button onClick={handleJoin} disabled={isJoining} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold tracking-[0.2em] text-xs uppercase transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]">
                        {isJoining ? "Joining..." : "Join Group"}
                    </button>
                </div>
            </div>
        </main>);
}
