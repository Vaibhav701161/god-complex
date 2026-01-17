"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";

export default function VerifyEmail() {
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        // Poll for verification status
        const interval = setInterval(async () => {
            const { data } = await authClient.getSession();

            // Check if user is verified
            // Note: This assumes the session data includes 'user.emailVerified' or similar.
            // Adjust based on exact Better Auth response shape. Use 'emailVerified' which is standard.
            if (data?.user?.emailVerified) {
                clearInterval(interval);
                router.push("/application"); // Proceed to application form
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [router]);

    return (
        <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="panel-card p-10 md:p-16 flex flex-col items-center text-center glow-blue-intense relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse-glow"></div>

                    <div className="mb-8 animate-breathe">
                        <GCLogo />
                    </div>

                    <h1 className="text-xl font-bold text-white tracking-[0.2em] mb-4">
                        VERIFICATION REQUIRED
                    </h1>

                    <p className="text-gray-400 text-sm tracking-wide leading-relaxed">
                        Identity must be confirmed before protocol access.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
