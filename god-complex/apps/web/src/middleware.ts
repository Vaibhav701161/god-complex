import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/contract") ||
        pathname.startsWith("/groups") ||
        pathname.startsWith("/weekly-review") ||
        pathname.startsWith("/monthly-review") ||
        pathname.startsWith("/system-log") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/payments") ||
        pathname.startsWith("/rules") ||
        pathname.startsWith("/application");

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    const sessionToken = request.cookies.get("better-auth.session") || request.cookies.get("auth.session");

    if (!sessionToken) {
        return NextResponse.redirect(
            new URL(`/signin?next=${pathname}`, request.url)
        );
    }

    try {
        const sessionResponse = await fetch(
            `${API_URL}/api/auth/get-session`,
            {
                method: "GET",
                headers: {
                    Cookie: `better-auth.session=${sessionToken.value}`,
                },
            }
        );

        if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            if (session?.user) {
                return NextResponse.next();
            }
        }
    } catch (error) {
        console.error("Middleware session check failed", error);
    }

    return NextResponse.redirect(
        new URL(`/signin?next=${pathname}`, request.url)
    );
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/contract/:path*",
        "/groups/:path*",
        "/weekly-review/:path*",
        "/monthly-review/:path*",
        "/system-log/:path*",
        "/profile/:path*",
        "/payments/:path*",
        "/rules/:path*",
        "/application/:path*",
    ],
};
