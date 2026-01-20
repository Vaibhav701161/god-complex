"use client";

import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SystemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/signin");
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    AUTHENTICATING...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-[#0a0e14]">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            {/* md:pl-64 maps to sidebar width to prevent overlap */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                {children}
            </div>
        </div>
    );
}
