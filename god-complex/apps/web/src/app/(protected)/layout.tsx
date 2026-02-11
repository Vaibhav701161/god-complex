import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const cookiesHeader = headersList.get("cookie") || "";

    try {
        const res = await fetch(
            `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
            {
                cache: "no-store",
                headers: {
                    cookie: cookiesHeader,
                },
            }
        );

        if (!res.ok) {
            console.warn(`[PROTECTED] Session check bad status: ${res.status}`);
            redirect("/signin");
        }

        const session = await res.json();

        if (!session?.user) {
            console.log("[PROTECTED] No session found, redirecting to signin");
            redirect("/signin");
        }

        return <>{children}</>;
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("[PROTECTED] Session check failed:", error);
        redirect("/signin");
    }
}
