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

            // Success
            router.push("/verify-email");
        } catch (err) {
            setError("System error.");
            setLoading(false);
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
