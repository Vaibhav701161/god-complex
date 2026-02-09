"use client";
import { GCLogo } from "@/components/IsometricCube";
import { ScoringGraph } from "@/components/ScoringGraph";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
export default function Home() {
    return (<>
            <Header />
            <main className="bg-[#0a0e14] min-h-screen">

                
                <section className="min-h-screen flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden">
                    
                    <motion.div className="absolute left-0 top-1/3 w-64 opacity-25 hidden md:block" animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        <svg viewBox="0 0 200 120" className="w-full">
                            <path d="M0 60 L80 60" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                            <path d="M80 60 L80 25 L120 25" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                            <path d="M80 60 L80 95 L120 95" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                            <motion.circle cx="120" cy="25" r="4" fill="#00FFFF" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}/>
                            <motion.circle cx="120" cy="95" r="4" fill="#00FFFF" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}/>
                            <circle cx="80" cy="60" r="3" fill="#3B82F6"/>
                        </svg>
                    </motion.div>

                    
                    <motion.div className="absolute right-0 top-1/3 w-64 opacity-25 hidden md:block" animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
                        <svg viewBox="0 0 200 120" className="w-full">
                            <path d="M200 60 L120 60" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                            <path d="M120 60 L120 25 L80 25" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                            <path d="M120 60 L120 95 L80 95" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                            <motion.circle cx="80" cy="25" r="4" fill="#00FFFF" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}/>
                            <motion.circle cx="80" cy="95" r="4" fill="#00FFFF" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}/>
                            <circle cx="120" cy="60" r="3" fill="#3B82F6"/>
                        </svg>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
                        <GCLogo />
                    </motion.div>

                    <motion.h2 className="text-lg md:text-xl tracking-[0.5em] text-gray-400 mb-6 font-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        GOD COMPLEX
                    </motion.h2>

                    <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight text-center mb-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.6 }}>
                        INTEGRITY IS BINARY.
                    </motion.h1>

                    <motion.p className="text-sm md:text-base text-gray-500 mb-20 tracking-wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                        A commitment-integrity enforcement system.
                    </motion.p>

                    <motion.div className="max-w-2xl w-full border-t border-gray-800 pt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                        <h3 className="text-xl font-bold text-center mb-8 tracking-widest">CORE IDEA</h3>
                        <div className="text-center text-sm md:text-base text-gray-400 space-y-2 leading-relaxed">
                            <p>Not a productivity app. A social contract enforcement platform.</p>
                            <p>Integrity {">"} Motivation. Excuses are penalized.</p>
                            <p>Consistency beats ambition. Losers pay, winners collect.</p>
                        </div>
                    </motion.div>
                </section>

                
                <section className="min-h-screen px-6 md:px-8 py-20">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-center mb-16 tracking-widest">
                            ENFORCEMENT & SCORING
                        </h2>

                        
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                            
                            <motion.div className="lg:col-span-3 bg-[#0B101A] border border-[#1E293B] rounded-xl p-6 md:p-8 hover:border-[#2a3a50] transition-colors duration-300" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                                <h3 className="text-sm md:text-base font-bold mb-1 tracking-wide">EXCUSE TAX SYSTEM</h3>
                                <p className="text-xs text-gray-500 mb-6">Failures are classified, not excused.</p>

                                <div className="flex flex-col md:flex-row gap-6">
                                    
                                    <div className="bg-[#050810] border border-[#1a2535] rounded-lg p-4 w-full md:w-48 text-xs shadow-lg">
                                        <div className="text-gray-500 text-[11px] mb-3">Select reason</div>
                                        <div className="text-gray-300 py-1 px-2 bg-[#0d1520] rounded mb-2">Poor planning</div>
                                        <div className="border-t border-[#1a2535] my-2"></div>
                                        <div className="text-gray-600 py-1">Boredom</div>
                                        <div className="text-gray-600 py-1">External dependency</div>
                                        <div className="text-gray-700 py-1">Fear</div>
                                    </div>

                                    
                                    <div className="text-xs space-y-3 flex-1">
                                        <p className="text-gray-300 font-bold mb-4">Select reason:</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                            <span className="text-white">Poor planning</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full border border-gray-600"></div>
                                            <span className="text-gray-500">Emergencyhealth</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full border border-gray-600"></div>
                                            <span className="text-gray-500">Distraction</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full border border-gray-600"></div>
                                            <span className="text-gray-500">External dependency</span>
                                        </div>

                                        <div className="pt-6 border-t border-gray-800 mt-4">
                                            <p className="text-gray-300 font-bold mb-2">Repeated Excuse Penalty:</p>
                                            <p className="text-gray-500">{">"}2 in 7 days = zero score</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            
                            <motion.div className="lg:col-span-2 bg-[#0B101A] border border-[#1E293B] rounded-xl p-6 md:p-8 hover:border-[#2a3a50] transition-colors duration-300" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                                <div className="flex items-start justify-between mb-6">
                                    <h3 className="text-sm md:text-base font-bold tracking-wide">STAKES WITHOUT CORRUPTION</h3>
                                    <svg className="w-12 h-12 text-blue-500 opacity-80 flex-shrink-0" viewBox="0 0 50 50" fill="none">
                                        <circle cx="25" cy="16" r="7" stroke="currentColor" strokeWidth="2.5"/>
                                        <path d="M10 42 C10 30, 16 24, 25 24 S40 30, 40 42" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                                        <path d="M25 28 L25 38 M20 33 L25 28 L30 33" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
                                    </svg>
                                </div>
                                <ul className="text-xs md:text-sm text-gray-400 space-y-2">
                                    <li>• Monthly Monetary Pledge</li>
                                    <li>• End-of-Month Revolution:</li>
                                    <li className="pl-6 text-gray-500">Automatic ranking,</li>
                                    <li className="pl-6 text-gray-500">payouts, penalties</li>
                                    <li className="pt-3 text-gray-200 font-semibold">No manual overrides.</li>
                                </ul>
                            </motion.div>
                        </div>

                        
                        <motion.div className="bg-[#0B101A] border border-[#1E293B] rounded-xl p-6 md:p-8 hover:border-[#2a3a50] transition-colors duration-300" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
                            <h3 className="text-sm md:text-base font-bold mb-3 tracking-wide">CONSISTENCY-WEIGHTED SCORING</h3>
                            <div className="text-xs md:text-sm text-gray-400 space-y-1 mb-2">
                                <p><span className="text-gray-200">Daily Score</span> = (sum of goal scores) × (number of goals)</p>
                                <p><span className="text-gray-200">Monthly Score</span> = (Average Daily Score) × (Days Participated)</p>
                                <p className="text-gray-600 pt-1">Cherry-picking fails.</p>
                            </div>
                            <ScoringGraph />
                        </motion.div>
                    </div>
                </section>

                
                <section className="min-h-screen px-6 md:px-8 py-20">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-center mb-16 tracking-widest">
                            THE SYSTEM CORE
                        </h2>

                        <motion.div className="bg-[#0B101A] border border-[#1E293B] rounded-xl p-8 md:p-12 hover:border-[#2a3a50] transition-colors duration-500" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-start">

                                
                                <div className="lg:col-span-4">
                                    <h3 className="text-xs font-bold text-center mb-8 tracking-[0.3em] text-gray-400">GROUP STRUCTURE</h3>

                                    <div className="relative flex flex-col items-center">
                                        
                                        <div className="flex justify-center gap-16 mb-0">
                                            <div className="flex flex-col items-center">
                                                <div className="w-14 h-14 rounded-full border-2 border-[#2a3a50] bg-[#0a0f18] flex items-center justify-center mb-3">
                                                    <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="8" r="4"/>
                                                        <path d="M4 20 C4 16, 8 14, 12 14 S20 16, 20 20"/>
                                                    </svg>
                                                </div>
                                                <span className="text-[11px] text-gray-300 font-medium">Private Groups</span>
                                                <span className="text-[10px] text-gray-600">Fixed roster. No mid-cycle entry.</span>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <div className="w-14 h-14 rounded-full border-2 border-[#2a3a50] bg-[#0a0f18] flex items-center justify-center mb-3">
                                                    <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="4" y="4" width="16" height="16" rx="2"/>
                                                        <path d="M4 10 L20 10 M10 4 L10 20"/>
                                                    </svg>
                                                </div>
                                                <span className="text-[11px] text-gray-300 font-medium">Monthly Pledge</span>
                                                <span className="text-[10px] text-gray-600">Locked at cycle start.</span>
                                            </div>
                                        </div>

                                        
                                        <svg className="w-48 h-16" viewBox="0 0 180 60">
                                            <path d="M45 0 C45 30, 90 50, 90 55" stroke="#2a3a50" strokeWidth="2" fill="none"/>
                                            <path d="M135 0 C135 30, 90 50, 90 55" stroke="#2a3a50" strokeWidth="2" fill="none"/>
                                        </svg>

                                        
                                        <div className="flex flex-col items-center">
                                            <div className="w-14 h-14 rounded-full border-2 border-[#2a3a50] bg-[#0a0f18] flex items-center justify-center mb-3">
                                                <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="8"/>
                                                    <path d="M12 8 L12 16 M8 12 L16 12" stroke="currentColor" strokeWidth="2"/>
                                                </svg>
                                            </div>
                                            <span className="text-[11px] text-gray-300 font-medium">Cycle Resolution</span>
                                            <span className="text-[10px] text-gray-600">Resolved at cycle end only.</span>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="lg:col-span-4">
                                    <h3 className="text-xs font-bold text-center mb-2 tracking-[0.3em] text-gray-400">DAILY FLOW</h3>
                                    <p className="text-[10px] text-center text-gray-600 mb-6">(Non-Negotiable)</p>

                                    <div className="bg-[#060810] border border-[#1a2535] rounded-xl p-5">
                                        
                                        <div className="bg-[#0a0f18] border border-[#1a2535] rounded-lg p-3 mb-2">
                                            <p className="text-xs text-gray-300 font-semibold">Morning</p>
                                            <p className="text-[10px] text-gray-500">Declaration required.</p>
                                        </div>

                                        <div className="flex justify-center my-1">
                                            <svg className="w-4 h-6 text-gray-600" viewBox="0 0 16 24" fill="none">
                                                <path d="M8 0 L8 20 M4 16 L8 20 L12 16" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                        </div>

                                        
                                        <div className="bg-[#0a0f18] border border-[#1a2535] rounded-lg p-3 mb-2">
                                            <p className="text-xs text-gray-300 font-semibold">Goal Schema</p>
                                            <p className="text-[10px] text-gray-500 leading-tight">• Finish condition<br />• Minimum effort<br />• Discomfort flag</p>
                                        </div>

                                        <div className="flex justify-center my-1">
                                            <svg className="w-4 h-6 text-gray-600" viewBox="0 0 16 24" fill="none">
                                                <path d="M8 0 L8 20 M4 16 L8 20 L12 16" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                        </div>

                                        
                                        <div className="bg-[#0a0f18] border border-[#1a2535] rounded-lg p-3 mb-2">
                                            <p className="text-xs text-gray-300 font-semibold">Execution</p>
                                            <p className="text-[10px] text-gray-500">No edits after lock.</p>
                                        </div>

                                        <div className="flex justify-center my-1">
                                            <svg className="w-4 h-6 text-gray-600" viewBox="0 0 16 24" fill="none">
                                                <path d="M8 0 L8 20 M4 16 L8 20 L12 16" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                        </div>

                                        
                                        <div className="bg-[#0a0f18] border border-[#1a2535] rounded-lg p-3">
                                            <p className="text-xs text-gray-300 font-semibold">Check-In</p>
                                            <p className="text-[10px] text-gray-500">Binary: complete / fail.</p>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="lg:col-span-4 flex items-center justify-center relative">
                                    
                                    <svg className="absolute -left-8 top-1/2 -translate-y-1/2 w-10 h-8 hidden lg:block" viewBox="0 0 40 32">
                                        <path d="M0 16 L32 16 M26 10 L32 16 L26 22" stroke="#2a3a50" strokeWidth="2" fill="none"/>
                                    </svg>

                                    <motion.div className="border-2 border-blue-500/40 bg-blue-900/10 rounded-xl p-6 w-full max-w-xs shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] transition-shadow duration-300" animate={{
            boxShadow: [
                "0 0 20px -5px rgba(59,130,246,0.2)",
                "0 0 25px -5px rgba(59,130,246,0.3)",
                "0 0 20px -5px rgba(59,130,246,0.2)"
            ]
        }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                                        <h4 className="text-sm font-bold text-blue-400 mb-4 tracking-wide">RULE STACK</h4>
                                        <div className="text-[11px] text-gray-400 space-y-3">
                                            <p><span className="text-gray-300 font-semibold">RULE 1</span> — ≥1 uncomfortable goal per week</p>
                                            <p><span className="text-gray-300 font-semibold">RULE 2</span> — Same excuse {">"}2× triggers penalty.</p>
                                            <p><span className="text-gray-300 font-semibold">RULE 3</span> — No check-in = failure</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>


                
                <section className="min-h-screen px-6 md:px-8 py-20 relative">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-center mb-16 tracking-widest">
                            WHAT THIS APP IS NOT
                        </h2>

                        <div className="bg-[#0B101A] border border-[#1E293B] rounded-xl p-8 md:p-10 mb-16">
                            <div className="max-w-md">
                                
                                <div className="text-sm md:text-base text-gray-300 space-y-3">
                                    <p>• Not a habit tracker.</p>
                                    <p>• Not a todo list.</p>
                                    <p>• Not a motivation app.</p>
                                    <p>• Not therapy.</p>
                                    <p className="pt-4 text-white font-medium leading-relaxed">
                                        It is a contract execution engine for personal discipline.
                                    </p>
                                </div>

                            </div>
                        </div>

                        
                        <Link href="/signup" className="w-full">
                            <motion.button className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white font-bold py-6 px-10 rounded-2xl text-lg md:text-xl tracking-widest shadow-[0_0_50px_-10px_rgba(59,130,246,0.8)] hover:shadow-[0_0_70px_-5px_rgba(59,130,246,1)] transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} animate={{
            boxShadow: [
                "0 0 50px -10px rgba(59,130,246,0.7)",
                "0 0 60px -10px rgba(59,130,246,0.9)",
                "0 0 50px -10px rgba(59,130,246,0.7)"
            ]
        }} transition={{
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}>
                                APPLY FOR ACCESS
                                <p className="text-xs md:text-sm font-normal mt-2 opacity-90 tracking-normal">
                                    Stop lying to yourself.
                                </p>
                            </motion.button>
                        </Link>

                        
                        <p className="text-center text-xs text-gray-600 mt-16">
                             2026 God Complex. All rights reserved.
                        </p>
                    </div>

                    
                    <div className="absolute bottom-20 right-16 opacity-50 hidden lg:block">
                        <motion.svg width="70" height="70" viewBox="0 0 70 70" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                            <path d="M35 5 L65 35 L35 65 L5 35 Z" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
                            <path d="M35 15 L55 35 L35 55 L15 35 Z" fill="none" stroke="#00FFFF" strokeWidth="0.5" opacity="0.5"/>
                        </motion.svg>
                    </div>
                </section>
            </main>
        </>);
}
