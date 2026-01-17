"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignin = async () => {
        setError("");

        setLoading(true);
        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                setError(error.message || "Invalid credentials.");
                setLoading(false);
                return;
            }

            // Success
            router.push("/dashboard");
        } catch (err) {
            setError("System error.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 relative overflow-hidden">
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
                            ACCESS PROTOCOL
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
                            onClick={handleSignin}
                            disabled={!email || !password || loading}
                            className={`w-full py-4 rounded-lg font-bold tracking-[0.15em] text-sm transition-all duration-300 ${!email || !password || loading
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.8)] border border-blue-500"
                                }`}
                        >
                            {loading ? "AUTHENTICATING..." : "ENTER"}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center mt-4 space-y-3">
                            <Link href="/signup" className="block text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-widest">
                                NO IDENTITY? APPLY HERE
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
