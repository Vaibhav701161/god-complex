export function SystemDiagram() {
    return (
        <div className="space-y-6">
            {/* Group Structure */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto rounded border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="6" r="3" stroke="#0ea5e9" strokeWidth="1.5" />
                            <path d="M5 14c0-2.5 2.5-4 5-4s5 1.5 5 4" stroke="#0ea5e9" strokeWidth="1.5" />
                        </svg>
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">Private Groups</div>
                    <div className="text-[9px] text-muted-foreground/60">(Fixed kickoff)</div>
                </div>

                <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto rounded border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="4" y="4" width="12" height="12" rx="2" stroke="#0ea5e9" strokeWidth="1.5" />
                            <path d="M4 9h12M9 4v12" stroke="#0ea5e9" strokeWidth="1" />
                        </svg>
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">Monthly Pledge</div>
                    <div className="text-[9px] text-muted-foreground/60">(e.g., $5000 pool)</div>
                </div>

                <div className="space-y-2 relative">
                    <div className="w-10 h-10 mx-auto rounded border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2v16M2 10h16" stroke="#0ea5e9" strokeWidth="1.5" />
                            <circle cx="10" cy="10" r="7" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
                        </svg>
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">Platform Fee</div>
                    <div className="text-[9px] text-muted-foreground/60">($$)</div>
                </div>
            </div>

            {/* Arrows connecting to next section */}
            <div className="flex justify-center">
                <svg width="40" height="24" viewBox="0 0 40 24">
                    <path d="M20 0 L20 18 M15 14 L20 18 L25 14" stroke="#2a2a2a" strokeWidth="1.5" fill="none" />
                </svg>
            </div>

            {/* Daily Flow */}
            <div className="border border-[#2a2a2a] bg-[#0a0a0a] rounded p-3 space-y-2">
                <div className="text-[10px] text-white/70 font-semibold mb-2">DAILY FLOW</div>
                <div className="text-[10px] text-muted-foreground/80 leading-relaxed">
                    <div className="mb-1.5"><span className="text-white/60">Morning:</span></div>
                    <div className="pl-2 text-[9px]">Goal declaration via AI</div>

                    <div className="mt-2 mb-1.5"><span className="text-white/60">Execution</span></div>

                    <div className="mt-2 mb-1.5"><span className="text-white/60">Daily Scoring</span></div>
                </div>
            </div>

            <div className="flex justify-center">
                <svg width="40" height="24" viewBox="0 0 40 24">
                    <path d="M20 0 L20 18 M15 14 L20 18 L25 14" stroke="#2a2a2a" strokeWidth="1.5" fill="none" />
                </svg>
            </div>

            {/* God Schema */}
            <div className="border border-[#2a2a2a] bg-[#0a0a0a] rounded p-3">
                <div className="text-[10px] text-white/70 font-semibold mb-2">God Schema</div>
                <div className="text-[9px] text-muted-foreground/70 leading-relaxed space-y-1">
                    <div>(1.0x baseline,</div>
                    <div className="pl-2">+0.5x urgency,</div>
                    <div className="pl-2">+0.25x difficulty)</div>
                </div>
            </div>

            {/* Rule 1 Box */}
            <div className="border border-[#0ea5e9]/30 bg-[#0a0a0a] rounded p-3 mt-4">
                <div className="text-[10px] text-[#0ea5e9] font-bold mb-2">RULE 1</div>
                <div className="text-[10px] text-white/70 font-semibold mb-1.5">UNCOMFORTABLE GOAL RULE</div>
                <div className="text-[9px] text-muted-foreground/70 leading-relaxed">
                    (R1 lasts 7 per week, 4–6 Non-realtime,<br />
                    Pulses, Ego-threatening)
                </div>
            </div>
        </div>
    );
}
