"use client";

import { Sidebar } from "@/components/Sidebar";

export default function SystemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
