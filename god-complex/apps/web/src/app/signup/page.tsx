"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password: string) => password.length >= 8;
export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    useEffect(() => {
        const errors: Record<string, string> = {};
        if (name && name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        }
        if (email && !isValidEmail(email)) {
            errors.email = "Please enter a valid email";
        }
        if (password && !isStrongPassword(password)) {
            errors.password = "Password must be at least 8 characters";
        }
        if (confirmPassword && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        setFieldErrors(errors);
    }, [name, email, password, confirmPassword]);
    const handleSignup = async () => {
        setError("");
        if (!name || name.trim().length < 2) {
            setError("Name is required (min 2 characters).");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!isStrongPassword(password)) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            console.log("[SignUp] Starting signup for:", email);
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name: name.trim(),
            });
            if (error) {
                console.error("[SignUp] Signup error:", error);
                if (error.message?.toLowerCase().includes("exist") ||
                    error.message?.toLowerCase().includes("duplicate")) {
                    setError("An account with this email already exists. Try signing in.");
                }
                else {
                    setError(error.message || "Failed to create account. Please try again.");
                }
                setLoading(false);
                return;
            }
            console.log("[SignUp] ✓ Account created successfully");
            setSuccess(true);
            console.log("[SignUp] Waiting for session to establish...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            try {
                const session = await authClient.getSession();
                if (session?.data?.user) {
                    console.log("[SignUp] ✓ Session established, redirecting to /application");
                    window.location.href = "/application";
                }
                else {
                    console.warn("[SignUp]  No session found, redirecting to signin");
                    window.location.href = "/signin?next=/application";
                }
            }
            catch (sessionErr) {
                console.error("[SignUp] Session check failed:", sessionErr);
                window.location.href = "/signin?next=/application";
            }
        }
        catch (err) {
            console.error("Signup error:", err);
            setError("Network error. Please check your connection and try again.");
            setLoading(false);
        }
    };
    const handleGoogleSignup = async () => {
        console.log("[SignUp] Google button clicked!");
        setError("");
        setLoading(true);
        try {
            console.log("[SignUp] Starting Google OAuth flow...");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
            const callbackURL = encodeURIComponent(`${window.location.origin}/application`);
            const redirectUrl = `${apiUrl}/api/auth/signin/google?callbackURL=${callbackURL}`;
            console.log("[SignUp] Redirecting to:", redirectUrl);
            window.location.href = redirectUrl;
        }
        catch (err) {
            console.error("Google signup error:", err);
            setError("Google sign-up failed. Please try again.");
            setLoading(false);
        }
    };
    const isFormValid = name.trim().length >= 2 &&
        isValidEmail(email) &&
        isStrongPassword(password) &&
        password === confirmPassword &&
        Object.keys(fieldErrors).length === 0;
    if (success) {
        return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="text-green-500 text-6xl mb-4">✓</div>
                    <h1 className="text-white text-xl font-bold tracking-widest">IDENTITY CREATED</h1>
                    <p className="text-gray-400 text-sm mt-2">Redirecting to verification...</p>
                </motion.div>
            </main>);
    }
    return (<main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 relative overflow-hidden">
            
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                
                <div className="panel-card p-8 md:p-10 relative overflow-hidden glow-blue">

                    
                    <div className="flex flex-col items-center mb-10">
                        <div className="scale-75 mb-4 opacity-90"><GCLogo /></div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white text-center">
                            INITIALIZE IDENTITY
                        </h1>
                    </div>

                    
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if (isFormValid && !loading) handleSignup(); }}>
                        
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full bg-[#050810] border ${fieldErrors.name ? 'border-red-500/50' : 'border-[#1E293B]'} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm`} placeholder="Your full name"/>
                            {fieldErrors.name && (<p className="text-red-400 text-xs pl-1">{fieldErrors.name}</p>)}
                        </div>

                        
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-[#050810] border ${fieldErrors.email ? 'border-red-500/50' : 'border-[#1E293B]'} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm`} placeholder="user@domain.com"/>
                            {fieldErrors.email && (<p className="text-red-400 text-xs pl-1">{fieldErrors.email}</p>)}
                        </div>

                        
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-[#050810] border ${fieldErrors.password ? 'border-red-500/50' : 'border-[#1E293B]'} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm`} placeholder="••••••••"/>
                            {fieldErrors.password && (<p className="text-red-400 text-xs pl-1">{fieldErrors.password}</p>)}
                        </div>

                        
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-[#050810] border ${fieldErrors.confirmPassword ? 'border-red-500/50' : 'border-[#1E293B]'} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm`} placeholder="••••••••"/>
                            {fieldErrors.confirmPassword && (<p className="text-red-400 text-xs pl-1">{fieldErrors.confirmPassword}</p>)}
                        </div>

                        
                        <p className="text-[10px] text-gray-500 text-center tracking-wide">
                            Anonymous accounts are not allowed.
                        </p>

                        
                        {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs text-center font-bold tracking-wide bg-red-950/20 py-2 border border-red-900/30 rounded">
                                {error.toUpperCase()}
                            </motion.div>)}

                        
                        <button type="submit" disabled={!isFormValid || loading} className={`w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 ${!isFormValid || loading
            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.8)] border border-blue-500"}`}>
                            {loading ? "INITIALIZING..." : "CREATE IDENTITY"}
                        </button>

                        
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                            <span className="text-gray-600 text-[10px] tracking-widest">OR</span>
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                        </div>

                        
                        <button onClick={handleGoogleSignup} disabled={loading} type="button" className="w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                            CONTINUE WITH GOOGLE
                        </button>

                        
                        <div className="text-center mt-4">
                            <Link href="/signin" className="text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-widest">
                                ALREADY INITIALIZED? SIGN IN
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </main>);
}
