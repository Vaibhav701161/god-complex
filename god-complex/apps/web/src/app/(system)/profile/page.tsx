"use client";
import { motion } from "framer-motion";
import { TopBar } from "@/components/DashboardComponents";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { format } from "date-fns";
import { useMemo } from "react";
function Section({ title, children }: {
    title: string;
    children: React.ReactNode;
}) {
    return (<section className="mb-12">
            <h2 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-6 flex items-center gap-4">
                {title}
                <div className="h-px bg-[#1E293B] flex-1"></div>
            </h2>
            {children}
        </section>);
}
function ReadOnlyField({ label, value, highlight = false }: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (<div className="flex flex-col gap-2 p-4 border border-[#1E293B] bg-[#0B101A]/50 rounded-sm">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
            <span className={`font-mono text-sm ${highlight ? 'text-green-500' : 'text-white'}`}>{value}</span>
        </div>);
}
export default function Profile() {
    const { user, userLoading: loading } = useDashboardContext();
    const error: string | null = null;
    const accountAge = useMemo(() => {
        if (!user?.createdAt)
            return 0;
        return Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    }, [user?.createdAt]);
    if (loading) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    LOADING PROFILE...
                </div>
            </main>);
    }
    if (error || !user) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-red-500 font-mono text-sm tracking-widest">
                    ERROR: {error || "Failed to load profile"}
                </div>
            </main>);
    }
    return (<main className="min-h-screen bg-[#0a0e14] pb-32">
            
            <TopBar user={user}/>

            <div className="max-w-4xl mx-auto p-8 md:p-12">

                
                <Section title="01 // System Identity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="Email Identity" value={user.email}/>
                        <ReadOnlyField label="Account ID" value={user.publicId || user.id.slice(0, 12).toUpperCase()}/>
                        <ReadOnlyField label="Display Name" value={user.displayName || user.name || "Not Set"}/>
                        <ReadOnlyField label="System Status" value={user.emailVerified ? "VERIFIED" : "PENDING VERIFICATION"} highlight={user.emailVerified}/>
                    </div>
                </Section>

                
                <Section title="02 // Active Memberships">
                    {user.memberships && user.memberships.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.memberships.map((membership: any) => (<div key={membership.groupId} className="flex flex-col gap-2 p-4 border border-[#1E293B] bg-[#0B101A]/50 rounded-sm">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Group</span>
                                    <span className="font-mono text-sm text-white">{membership.group?.name || "Unknown"}</span>
                                    <span className="text-xs text-gray-600 font-mono mt-2">
                                        Month: {membership.month} | TZ: {membership.group?.timezone || "UTC"}
                                    </span>
                                </div>))}
                        </div>) : (<div className="p-6 border border-yellow-500/30 bg-yellow-950/10 text-yellow-500 font-mono text-sm">
                            No active group memberships. Visit the Groups page to join or create one.
                        </div>)}
                </Section>

                
                <Section title="03 // Account Information">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ReadOnlyField label="Days Active" value={accountAge.toString()}/>
                        <ReadOnlyField label="Application Status" value={user.applicationDone ? "COMPLETE" : "INCOMPLETE"} highlight={user.applicationDone}/>
                        <ReadOnlyField label="Email Verified" value={user.emailVerified ? "YES" : "NO"} highlight={user.emailVerified}/>
                        <ReadOnlyField label="Member Since" value={user.createdAt ? format(new Date(user.createdAt), "MMM yyyy") : "N/A"}/>
                    </div>
                </Section>

                
                {user.motivation && (<Section title="04 // Motivation Statement">
                        <div className="p-6 border border-[#1E293B] bg-[#0B101A]/50 rounded-sm">
                            <p className="text-sm text-gray-300 font-mono leading-relaxed">{user.motivation}</p>
                        </div>
                    </Section>)}

                
                <div className="mt-24 pt-12 border-t border-red-900/30">
                    <h2 className="text-red-700 font-bold tracking-[0.2em] text-sm uppercase mb-4">Danger Zone</h2>
                    <div className="flex items-center justify-between p-6 border border-red-900/30 bg-red-950/5 rounded-sm">
                        <div>
                            <div className="text-white font-bold text-sm mb-1">Deactivate Account</div>
                            <div className="text-[10px] text-red-400 font-mono">Deactivation does not erase enforcement records.</div>
                        </div>
                        <button className="px-6 py-3 border border-red-800 text-red-600 hover:bg-red-950/30 text-xs font-bold tracking-[0.2em] uppercase transition-colors">
                            Deactivate
                        </button>
                    </div>
                </div>

            </div>
        </main>);
}
