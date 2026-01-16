"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-[#0a0e14]/80 backdrop-blur-md border-b border-gray-800/50"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="God Complex"
                            width={40}
                            height={37}
                            priority
                            className="opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </Link>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/signin"
                            className="text-sm text-gray-400 hover:text-gray-200 transition-colors tracking-wide"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/apply"
                            className="text-sm px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-all tracking-wide border border-gray-700/50"
                        >
                            Apply
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
