"use client";
import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";
const API_URL = "";
export default function VerifyEmail() {
    const router = useRouter();
    const [status, setStatus] = useState<"checking" | "pending" | "verified" | "error">("checking");
    const [email, setEmail] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const checkStatus = useCallback(async () => {
        try {
            const { data } = await authClient.getSession();
            if (data?.user?.emailVerified) {
                setStatus("verified");
                setTimeout(() => {
                    router.push("/application");
                }, 1500);
                return true;
            }
            if (data?.user?.email) {
                setEmail(data.user.email);
            }
            setStatus("pending");
            return false;
        }
        catch (err) {
            console.error("Error checking verification status:", err);
            setStatus("error");
            setError("Failed to check verification status");
            return false;
        }
    }, [router]);
    useEffect(() => {
        checkStatus();
        const interval = setInterval(async () => {
            const verified = await checkStatus();
            if (verified) {
                clearInterval(interval);
            }
        }, 5000);
        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 10 * 60 * 1000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [checkStatus]);
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);
    const handleManualCheck = async () => {
        setStatus("checking");
        await checkStatus();
    };
    const handleResend = async () => {
        if (resending || resendCooldown > 0)
            return;
        setResending(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/users/resend-verification`, {
                method: "POST",
                credentials: "include",
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to resend verification email");
            }
            setResendCooldown(60);
        }
        catch (err) {
            console.error("Error resending verification:", err);
            setError(err instanceof Error ? err.message : "Failed to resend verification email");
        }
        finally {
            setResending(false);
        }
    };
    const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null;
    return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
                <div className="panel-card p-10 md:p-16 flex flex-col items-center text-center glow-blue-intense relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse-glow"></div>

                    <div className="mb-8 animate-breathe">
                        <GCLogo />
                    </div>

                    {status === "verified" ? (<>
                            <div className="text-green-500 text-5xl mb-4">✓</div>
                            <h1 className="text-xl font-bold text-white tracking-[0.2em] mb-4">
                                EMAIL VERIFIED
                            </h1>
                            <p className="text-gray-400 text-sm tracking-wide">
                                Redirecting to application...
                            </p>
                        </>) : (<>
                            <h1 className="text-xl font-bold text-white tracking-[0.2em] mb-4">
                                VERIFICATION REQUIRED
                            </h1>

                            <p className="text-gray-400 text-sm tracking-wide leading-relaxed mb-2">
                                Identity must be confirmed before protocol access.
                            </p>

                            {maskedEmail && (<p className="text-gray-500 text-xs tracking-wide mb-6">
                                    Check your inbox at <span className="text-blue-400">{maskedEmail}</span>
                                </p>)}

                            
                            {status === "checking" ? (<div className="mt-6 flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                </div>) : (<div className="mt-6 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <span className="text-yellow-500 text-xs tracking-wide">AWAITING VERIFICATION</span>
                                </div>)}

                            
                            {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-400 text-xs bg-red-950/20 py-2 px-4 border border-red-900/30 rounded">
                                    {error}
                                </motion.div>)}

                            
                            <div className="mt-8 w-full space-y-3">
                                <button onClick={handleManualCheck} disabled={status === "checking"} className="w-full py-3 rounded-lg font-bold tracking-[0.1em] text-sm transition-all duration-300 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {status === "checking" ? "CHECKING..." : "CHECK STATUS"}
                                </button>

                                <button onClick={handleResend} disabled={resending || resendCooldown > 0} className="w-full py-3 rounded-lg font-bold tracking-[0.1em] text-xs transition-all duration-300 bg-transparent hover:bg-gray-800/50 text-gray-400 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {resending
                ? "SENDING..."
                : resendCooldown > 0
                    ? `RESEND IN ${resendCooldown}s`
                    : "RESEND VERIFICATION EMAIL"}
                                </button>
                            </div>

                            
                            <p className="mt-8 text-gray-600 text-[10px] tracking-wide">
                                Didn&apos;t receive it? Check your spam folder.
                            </p>
                        </>)}
                </div>
            </motion.div>
        </main>);
}
