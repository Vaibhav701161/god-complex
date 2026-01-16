"use client";

import Image from "next/image";

export function GCLogo() {
    return (
        <div className="relative inline-block">
            <Image
                src="/logo.png"
                alt="God Complex Logo"
                width={140}
                height={130}
                priority
                className="drop-shadow-[0_0_20px_rgba(168,178,188,0.3)]"
            />
        </div>
    );
}
