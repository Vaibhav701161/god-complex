import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect routes under /(system)
    // This includes: /dashboard, /contract, /groups, /weekly-review, etc.
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/contract") ||
        pathname.startsWith("/groups") ||
        pathname.startsWith("/weekly-review") ||
        pathname.startsWith("/monthly-review") ||
        pathname.startsWith("/system-log") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/payments") ||
        pathname.startsWith("/rules");

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Check for Better-Auth session cookie
    const sessionToken = request.cookies.get("better-auth.session_token");

    if (!sessionToken) {
        // No session - redirect to signin with next parameter
        const signinUrl = new URL("/signin", request.url);
        signinUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(signinUrl);
    }

    // Session exists - validate it by calling the auth endpoint
    try {
        const response = await fetch(`http://localhost:4000/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });

        if (!response.ok) {
            // Invalid session - redirect to signin
            const signinUrl = new URL("/signin", request.url);
            signinUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(signinUrl);
        }

        const session = await response.json();

        if (!session || !session.user) {
            // No valid session - redirect to signin
            const signinUrl = new URL("/signin", request.url);
            signinUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(signinUrl);
        }

        // Valid session - allow access
        return NextResponse.next();
    } catch (error) {
        // Error validating session - redirect to signin
        const signinUrl = new URL("/signin", request.url);
        signinUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(signinUrl);
    }
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
    ],
};
