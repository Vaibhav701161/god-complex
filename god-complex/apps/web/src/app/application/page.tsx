"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";
const API_URL = "";
export default function Application() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { user, loading: userLoading, mutate, invalidate } = useUser();
    const [displayName, setDisplayName] = useState("");
    const [motivation, setMotivation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [consent, setConsent] = useState({
        automatic: false,
        irreversible: false,
        notProductivity: false
    });
    useEffect(() => {
        console.log("[Application] Effect triggered - authLoading:", authLoading, "userLoading:", userLoading, "isAuthenticated:", isAuthenticated, "user:", user?.email, "applicationDone:", user?.applicationDone);
        if (authLoading) {
            console.log("[Application] Waiting for auth...");
            return;
        }
        if (!isAuthenticated) {
            console.log("[Application] Not authenticated, redirecting to /signin");
            router.push("/signin");
            return;
        }
        if (userLoading) {
            console.log("[Application] Waiting for user data...");
            return;
        }
        if (user?.applicationDone) {
            console.log("[Application] Application already done, redirecting to /dashboard");
            router.push("/dashboard");
        }
        else {
            console.log("[Application] Ready to show form");
        }
    }, [isAuthenticated, authLoading, user, userLoading, router]);
    const handleSubmit = async () => {
        const trimmedDisplayName = displayName.trim();
        const trimmedMotivation = motivation.trim();
        if (!trimmedDisplayName || !trimmedMotivation) {
            setError("Display name and motivation are required");
            return;
        }
        if (trimmedDisplayName.length < 2 || trimmedDisplayName.length > 50) {
            setError("Display name must be 2-50 characters");
            return;
        }
        if (trimmedMotivation.length < 10 || trimmedMotivation.length > 500) {
            setError("Motivation must be 10-500 characters");
            return;
        }
        if (!consent.automatic || !consent.irreversible || !consent.notProductivity) {
            setError("All consent checkboxes must be checked");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/users/complete-application`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    displayName: trimmedDisplayName,
                    motivation: trimmedMotivation,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || "Failed to complete application");
            }
            const updatedUser = await response.json();
            console.log("[Application] Submission successful, updated user:", updatedUser);
            if (!updatedUser.applicationDone) {
                throw new Error("Application submission succeeded but applicationDone is still false");
            }
            console.log("[Application] ✓ Application marked done, updating local state optimistically...");
            mutate({
                applicationDone: true,
                displayName: trimmedDisplayName,
                motivation: trimmedMotivation
            });
            console.log("[Application] Redirecting to /dashboard via hard navigation");
            window.location.href = "/dashboard";
        }
        catch (err) {
            console.error("[Application] Application error:", err);
            setError(err instanceof Error ? err.message : "Failed to complete application");
            setIsSubmitting(false);
        }
    };
    const isFormValid = displayName.trim().length >= 2 &&
        displayName.trim().length <= 50 &&
        motivation.trim().length >= 10 &&
        motivation.trim().length <= 500 &&
        consent.automatic &&
        consent.irreversible &&
        consent.notProductivity;
    if (authLoading || userLoading) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    LOADING...
                </div>
            </main>);
    }
    if (!isAuthenticated) {
        return null;
    }
    return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 md:p-12 relative">
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
                <div className="bg-[#0B101A] border border-[#1E293B] rounded-xl overflow-hidden shadow-2xl relative">
                    
                    <div className="bg-[#050810] p-8 border-b border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="scale-75"><GCLogo /></div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white tracking-[0.2em]">ACCESS APPLICATION</h1>
                                <p className="text-gray-500 text-xs tracking-wide mt-1">This system enforces outcomes, not intentions.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        
                        {error && (<div className="p-4 border border-red-900/50 bg-red-950/20 rounded">
                                <p className="text-sm font-mono text-red-400">{error}</p>
                            </div>)}

                        
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                01 // Display Name
                            </h2>
                            <div className="relative">
                                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} className="w-full bg-[#050810] border border-[#1E293B] rounded-lg p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm" placeholder="How you want to be identified in groups"/>
                                <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-mono">
                                    {displayName.length}/50
                                </div>
                            </div>
                        </section>

                        
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                02 // Motivation Statement
                            </h2>
                            <div className="relative">
                                <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} maxLength={500} className="w-full h-32 bg-[#050810] border border-[#1E293B] rounded-lg p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm resize-none" placeholder="Why are you seeking this system? What outcome do you want enforced?"/>
                                <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-mono">
                                    {motivation.length}/500
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                                This will be visible to group creators when you request to join.
                            </p>
                        </section>

                        
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase border-b border-[#1E293B] pb-2">
                                03 // Rule Consent
                            </h2>

                            <div className="bg-[#050810] border border-[#1E293B] rounded-lg p-6 h-48 overflow-y-auto mb-6 text-sm text-gray-400 space-y-4 font-mono leading-relaxed">
                                <p><strong className="text-white">1. BINARY INTEGRITY.</strong> You either did it or you didn&#39;t. Partial credit is failure. Excuses are failure.</p>
                                <p><strong className="text-white">2. AUTOMATIC PENALTIES.</strong> The system does not care about your feelings. It executes consequences based on data.</p>
                                <p><strong className="text-white">3. NO APPEALS.</strong> In v1, there are no support tickets for score reversals. Accepting the system means accepting its judgment.</p>
                                <p><strong className="text-white">4. VISIBILITY.</strong> Your failures may be visible to your group. Shame is a mechanic.</p>
                            </div>

                            <div className="space-y-3">
                                {[
            { id: 'automatic', label: 'I accept automatic enforcement', key: 'automatic' },
            { id: 'irreversible', label: 'I accept irreversible failure', key: 'irreversible' },
            { id: 'notProductivity', label: 'I understand this is not a productivity app', key: 'notProductivity' }
        ].map((item) => (<label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 border ${consent[item.key as keyof typeof consent] ? 'bg-red-600 border-red-600' : 'border-gray-600'} rounded transition-colors flex items-center justify-center`}>
                                            {consent[item.key as keyof typeof consent] && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={consent[item.key as keyof typeof consent]} onChange={() => setConsent(c => ({ ...c, [item.key]: !c[item.key as keyof typeof consent] }))}/>
                                        <span className={`text-sm font-medium ${consent[item.key as keyof typeof consent] ? 'text-white' : 'text-gray-500'} group-hover:text-gray-300 transition-colors`}>
                                            {item.label}
                                        </span>
                                    </label>))}
                            </div>
                        </section>
                    </div>

                    
                    <div className="bg-[#050810] p-8 border-t border-[#1E293B]">
                        <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className={`w-full py-5 rounded-xl font-bold tracking-[0.25em] text-base transition-all duration-300 ${!isFormValid || isSubmitting
            ? "bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800"
            : "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.8)] border border-blue-500"}`}>
                            {isSubmitting ? "SUBMITTING..." : "INITIALIZE PROTOCOL"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </main>);
}
