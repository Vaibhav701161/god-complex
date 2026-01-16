"use client";

import { motion } from "framer-motion";

export function ScoringGraph() {
    return (
        <div className="relative w-full h-36 mt-4">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 140"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Gradient for fill area */}
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>

                    {/* Glow effect for line */}
                    <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Vertical grid lines */}
                {[0, 100, 200, 300, 400, 500, 600].map((x, i) => (
                    <line key={i} x1={x} y1="0" x2={x} y2="140" stroke="#1E293B" strokeWidth="0.5" opacity="0.5" />
                ))}

                {/* Horizontal grid lines */}
                {[35, 70, 105].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="600" y2={y} stroke="#1E293B" strokeWidth="0.5" opacity="0.3" />
                ))}

                {/* Area fill under the curve */}
                <motion.path
                    d="M0 120 C40 115, 80 105, 120 95 C160 85, 200 78, 250 70 C300 62, 350 55, 400 48 C450 42, 500 38, 550 32 L600 28 L600 140 L0 140 Z"
                    fill="url(#areaGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />

                {/* Main line - smooth curve trending upward */}
                <motion.path
                    d="M0 120 C40 115, 80 105, 120 95 C160 85, 200 78, 250 70 C300 62, 350 55, 400 48 C450 42, 500 38, 550 32 L600 28"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#lineGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                />

                {/* Data points along the curve */}
                {[[0, 120], [120, 95], [250, 70], [400, 48], [600, 28]].map(([cx, cy], i) => (
                    <motion.circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill="#3B82F6"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.8 }}
                        transition={{ delay: 0.5 + i * 0.3 }}
                    />
                ))}
            </svg>
        </div>
    );
}
