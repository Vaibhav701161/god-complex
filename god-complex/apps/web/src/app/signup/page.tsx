"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async () => {
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Weak password.");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name: "User", // v1 requirement: Anonymous accounts not allowed, but name not explicitly asked in user flow text, defaulting
            });

            if (error) {
                setError(error.message || "Invalid input.");
                setLoading(false);
                return;
            }

            // Success - redirect to dashboard (no email verification in v1)
            router.push("/dashboard");
        } catch (err) {
            setError("System error.");
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "http://localhost:3000/dashboard",
            });
        } catch (err) {
            setError("Google sign-up failed.");
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements to match landing */}
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Panel */}
                <div className="panel-card p-8 md:p-10 relative overflow-hidden glow-blue">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="scale-75 mb-4 opacity-90"><GCLogo /></div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white text-center">
                            INITIALIZE IDENTITY
                        </h1>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#050810] border border-[#1E293B] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm"
                                placeholder="user@domain.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#050810] border border-[#1E293B] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400 pl-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#050810] border border-[#1E293B] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all placeholder:text-gray-700 font-mono text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Disclaimer */}
                        <p className="text-[10px] text-gray-500 text-center tracking-wide">
                            Anonymous accounts are not allowed.
                        </p>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs text-center font-bold tracking-wide bg-red-950/20 py-2 border border-red-900/30 rounded"
                            >
                                {error.toUpperCase()}
                            </motion.div>
                        )}

                        {/* Button */}
                        <button
                            onClick={handleSignup}
                            disabled={!email || !password || !confirmPassword || loading}
                            className={`w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 ${!email || !password || !confirmPassword || loading
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.8)] border border-blue-500"
                                }`}
                        >
                            {loading ? "INITIALIZING..." : "CREATE IDENTITY"}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                            <span className="text-gray-600 text-[10px] tracking-widest">OR</span>
                            <div className="h-px bg-[#1E293B] flex-1"></div>
                        </div>

                        {/* Google OAuth Button */}
                        <button
                            onClick={handleGoogleSignup}
                            className="w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 flex items-center justify-center gap-3"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            CONTINUE WITH GOOGLE
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center mt-4">
                            <Link href="/signin" className="text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-widest">
                                ALREADY INITIALIZED? SIGN IN
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
