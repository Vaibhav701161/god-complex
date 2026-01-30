"use client";

import { useDashboardContext } from "@/hooks/useDashboardContext";
import { useRouter } from "next/navigation";

interface GroupSelectorModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function GroupSelectorModal({ isOpen, onClose }: GroupSelectorModalProps) {
    const { availableGroups, selectGroup } = useDashboardContext();
    const router = useRouter();

    if (!isOpen) return null;

    const handleSelectGroup = (groupId: string) => {
        selectGroup(groupId);
        onClose?.();
    };

    const handleCreateGroup = () => {
        router.push("/groups");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="max-w-lg w-full mx-4 border border-[#1E293B] bg-[#0B101A] p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase mb-2">
                        Select Active Group
                    </h2>
                    <p className="text-xs font-mono text-gray-500 uppercase">
                        Choose which contract to view
                    </p>
                </div>

                {/* Group List */}
                <div className="space-y-3 mb-6">
                    {availableGroups.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => handleSelectGroup(group.id)}
                            className="w-full p-4 border border-[#334155] hover:border-blue-500/50 bg-[#0F172A] hover:bg-[#1E293B] transition-all text-left group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white tracking-widest uppercase text-sm group-hover:text-blue-400 transition-colors">
                                        {group.name}
                                    </h3>
                                    <p className="text-xs font-mono text-gray-500 mt-1">
                                        {group.timezone} • Cutoff: {group.cutoffHour}:00
                                    </p>
                                </div>
                                <span className="text-gray-600 group-hover:text-blue-400 transition-colors">
                                    →
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Manage Groups Link */}
                <div className="text-center">
                    <button
                        onClick={handleCreateGroup}
                        className="text-xs font-mono text-gray-500 hover:text-gray-300 underline transition-colors"
                    >
                        Manage Groups →
                    </button>
                </div>
            </div>
        </div>
    );
}

export function GroupSelectorDropdown() {
    const { availableGroups, selectedGroupId, selectGroup } = useDashboardContext();

    // Find current group name
    const currentGroup = availableGroups.find(g => g.id === selectedGroupId);

    if (availableGroups.length <= 1) {
        // Single group - just display name, no dropdown
        return currentGroup ? (
            <div className="text-xs font-mono text-gray-500 uppercase">
                {currentGroup.name}
            </div>
        ) : null;
    }

    // Multiple groups - show dropdown
    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 border border-[#334155] hover:border-blue-500/50 bg-[#0F172A] transition-colors text-left">
                <span className="text-xs font-mono text-gray-400 uppercase">
                    {currentGroup?.name || "Select Group"}
                </span>
                <svg
                    className="w-3 h-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 w-64 border border-[#334155] bg-[#0B101A] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                {availableGroups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => selectGroup(group.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-[#1E293B] transition-colors border-b border-[#1E293B] last:border-b-0 ${
                            group.id === selectedGroupId ? "bg-blue-900/20" : ""
                        }`}
                    >
                        <span className="text-xs font-mono text-gray-400 uppercase">
                            {group.name}
                        </span>
                        {group.id === selectedGroupId && (
                            <span className="ml-2 text-blue-400">✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

/**
 * Default export: Non-dismissible modal for required selection
 * Used when user has multiple groups and must select one
 */
export default function GroupSelector() {
    return <GroupSelectorModal isOpen={true} />;
}
