"use client";
import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";
function SigninContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam === "network") {
            setError("Network error. Please check your connection.");
        }
        else if (errorParam === "timeout") {
            setError("Session validation timed out. Please try again.");
        }
        else if (errorParam === "invalid") {
            setError("Your session expired. Please sign in again.");
        }
        else if (errorParam === "loop") {
            setError("Redirect loop detected. Please clear cookies and try again.");
        }
    }, [searchParams]);
    async function verifySession(maxAttempts = 3): Promise<boolean> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`[SignIn] Verifying session (attempt ${attempt}/${maxAttempts})...`);
            try {
                const session = await authClient.getSession();
                if (session?.data?.user) {
                    console.log(`[SignIn] ✓ Session verified for ${session.data.user.email}`);
                    return true;
                }
            }
            catch (err) {
                console.warn(`[SignIn] Session verification attempt ${attempt} failed:`, err);
            }
            if (attempt < maxAttempts) {
                const delay = 500 * attempt;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        console.error("[SignIn] ✗ Session verification failed after all attempts");
        return false;
    }
    const handleSignin = async () => {
        setError("");
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        try {
            console.log("[SignIn] Attempting sign in for:", email);
            const result = await authClient.signIn.email({
                email,
                password,
                rememberMe,
            });
            console.log("[SignIn] Auth result:", result);
            if (result.error) {
                const errorMsg = result.error.message?.toLowerCase() || "";
                if (errorMsg.includes("invalid") ||
                    errorMsg.includes("incorrect") ||
                    errorMsg.includes("not found")) {
                    setError("Invalid email or password.");
                }
                else {
                    setError(result.error.message || "Sign in failed. Please try again.");
                }
                setLoading(false);
                return;
            }
            console.log("[SignIn] ✓ Sign in successful, waiting for session...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            const sessionEstablished = await verifySession(3);
            if (sessionEstablished) {
                const next = searchParams.get("next") || "/dashboard";
                console.log("[SignIn] Redirecting to:", next);
                window.location.href = next;
            }
            else {
                setError("Session not established. Please try again.");
                setLoading(false);
            }
        }
        catch (err) {
            console.error("[SignIn] Signin error:", err);
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };
    const handleGoogleSignin = async () => {
        console.log("[SignIn] Google button clicked!");
        setError("");
        setLoading(true);
        try {
            console.log("[SignIn] Starting Google OAuth flow...");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
            const next = searchParams.get("next") || "/dashboard";
            const callbackURL = encodeURIComponent(`${window.location.origin}${next}`);
            const redirectUrl = `${apiUrl}/api/auth/signin/google?callbackURL=${callbackURL}`;
            console.log("[SignIn] Redirecting to:", redirectUrl);
            window.location.href = redirectUrl;
        }
        catch (err) {
            console.error("Google signin error:", err);
            setError("Google sign-in failed. Please try again.");
            setLoading(false);
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && email && password && !loading) {
            handleSignin();
        }
    };
    return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                
                <div className="panel-card p-8 md:p-10 relative overflow-hidden glow-blue">

                    
                    <div className="flex flex-col items-center mb-10">
                        <div className="scale-75 mb-4 opacity-90"><GCLogo /></div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white text-center">
                            ACCESS PROTOCOL
                        </h1>
                    </div>

                    
                    <div className="space-y-6" onKeyPress={handleKeyPress}>
                        
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#050810] border border-[#1E293B] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm" placeholder="user@domain.com"/>
                        </div>

                        
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#050810] border border-[#1E293B] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm" placeholder="••••••••"/>
                        </div>

                        
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 border ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} rounded transition-colors flex items-center justify-center`}>
                                    {rememberMe && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}/>
                                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors tracking-wide">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        
                        {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <div className="text-red-500 text-xs text-center font-bold tracking-wide bg-red-950/20 py-2 border border-red-900/30 rounded">
                                    {error.toUpperCase()}
                                </div>
                                {(error.toLowerCase().includes("timeout") || error.toLowerCase().includes("network")) && (<button onClick={() => window.location.reload()} className="w-full py-2 text-xs font-bold tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                                        RETRY
                                    </button>)}
                            </motion.div>)}

                        
                        <button onClick={handleSignin} disabled={!email || !password || loading} className={`w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 ${!email || !password || loading
            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.8)] border border-blue-500"}`}>
                            {loading ? "AUTHENTICATING..." : "ENTER"}
                        </button>

                        
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                            <span className="text-gray-600 text-[10px] tracking-widest">OR</span>
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                        </div>

                        
                        <button onClick={handleGoogleSignin} disabled={loading} type="button" className="w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                            CONTINUE WITH GOOGLE
                        </button>

                        
                        <div className="text-center mt-4 space-y-3">
                            <Link href="/signup" className="block text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-widest">
                                NO IDENTITY? APPLY HERE
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>);
}
export default function Signin() {
    return (<Suspense fallback={<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">LOADING...</div>
            </main>}>
            <SigninContent />
        </Suspense>);
}
