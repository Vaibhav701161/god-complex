"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GCLogo } from "@/components/IsometricCube";

// --- Icons (Custom, Unique, Sharp) ---

const IconSystem = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H10V10H4V4Z" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <path d="M14 4H20V10H14V4Z" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <path d="M4 14H10V20H4V14Z" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <path d="M14 14H20V20H14V14Z" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill={active ? "#3B82F6" : "#64748B"} />
        <line x1="10" y1="7" x2="14" y2="7" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <line x1="7" y1="10" x2="7" y2="14" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <line x1="17" y1="10" x2="17" y2="14" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <line x1="10" y1="17" x2="14" y2="17" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
    </svg>
);

const IconOperations = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12L7 12L10 6L14 18L17 12L21 12" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" strokeLinecap="square" />
        <rect x="2" y="3" width="20" height="18" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" strokeOpacity="0.3" />
    </svg>
);

const IconRecords = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4V20H20" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" strokeLinecap="square" />
        <path d="M8 16V12" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <path d="M12 16V8" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <path d="M16 16V10" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
    </svg>
);

const IconAccount = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
        <line x1="2" y1="21" x2="22" y2="21" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1.5" />
    </svg>
);

// --- Sidebar Item ---

function SidebarItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className="group flex items-center gap-4 py-3 relative">
            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-[2px] h-full bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.5)]"
                />
            )}
            <div className="pl-6 text-gray-400 group-hover:text-blue-400 transition-colors">
                <Icon active={isActive} />
            </div>
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {label}
            </span>
        </Link>
    );
}

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="px-6 py-4 mt-4">
            <span className="text-[9px] font-bold text-gray-700 tracking-[0.3em] uppercase">
                {label}
            </span>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#050810] border-r border-[#1E293B] z-50 flex flex-col hidden md:flex">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-[#1E293B]">
                <div className="scale-50 opacity-80 -ml-4"><GCLogo /></div>
                <span className="text-xs font-bold text-white tracking-[0.3em] -ml-2">GOD COMPLEX</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6">

                <SectionHeader label="System" />
                <SidebarItem href="/dashboard" label="Dashboard" icon={IconSystem} />

                <SectionHeader label="Operations" />
                <SidebarItem href="/contract" label="Daily Contract" icon={IconOperations} />
                <SidebarItem href="/groups" label="Groups" icon={IconOperations} />

                <SectionHeader label="Records" />
                <SidebarItem href="/weekly-review" label="Weekly Review" icon={IconRecords} />
                <SidebarItem href="/monthly-review" label="Monthly Review" icon={IconRecords} />
                <SidebarItem href="/system-log" label="System Log" icon={IconRecords} />

                <SectionHeader label="Account" />
                <SidebarItem href="/profile" label="Profile" icon={IconAccount} />
                <SidebarItem href="/payments" label="Payments" icon={IconOperations} />
                <SidebarItem href="/rules" label="System Rules" icon={IconSystem} />

            </div>

            <div className="p-6 border-t border-[#1E293B]">
                <div className="text-[9px] text-gray-700 font-mono text-center">
                    V1.0.4 // ENFORCEMENT ACTIVE
                </div>
            </div>
        </aside>
    );
}
