"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";

export default function Rules() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const requiredPhrase = "INTEGRITY IS BINARY";

    const handleEnter = () => {
        if (input === requiredPhrase) {
            router.push("/dashboard");
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Dark overlay vibe */}
            <div className="absolute inset-0 bg-black/80 z-0"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="bg-[#0a0a0a] border border-[#333] p-12 md:p-16 rounded-sm shadow-[0_0_100px_-20px_rgba(0,0,0,1)] text-center">

                    <div className="flex justify-center mb-10 opacity-70 grayscale">
                        <GCLogo />
                    </div>

                    <h1 className="text-2xl font-bold text-white tracking-[0.3em] mb-12">SYSTEM RULES</h1>

                    <div className="text-left space-y-6 text-gray-400 font-mono text-sm leading-relaxed mb-12 border-l-2 border-red-900/50 pl-6">
                        <p>1. <span className="text-gray-200">NO NEGOTIATIONS.</span> The code determines the outcome. Appeals are ignored.</p>
                        <p>2. <span className="text-gray-200">NO EXCUSES.</span> Reasons are irrelevant to the database. Only results are stored.</p>
                        <p>3. <span className="text-gray-200">PUBLIC SHAME.</span> Your groups will see your failures. This is a feature.</p>
                        <p>4. <span className="text-gray-200">IRREVERSIBLE.</span> Once you enter, your data is permanent until cycle end.</p>
                    </div>

                    <div className="space-y-6">
                        <p className="text-xs uppercase tracking-widest text-red-700 font-bold">
                            Type phrase to confirm: &quot;{requiredPhrase}&quot;
                        </p>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && input === requiredPhrase && handleEnter()}
                            className="w-full bg-black border-b border-gray-700 p-4 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:border-red-800 transition-colors uppercase placeholder:text-gray-900"
                            placeholder="TYPE HERE"
                            autoComplete="off"
                            spellCheck="false"
                        />

                        <button
                            onClick={handleEnter}
                            disabled={input !== requiredPhrase}
                            className={`w-full py-4 mt-6 text-sm font-bold tracking-[0.2em] transition-all duration-500 ${input === requiredPhrase
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-gray-900 text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            ENTER SYSTEM
                        </button>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
