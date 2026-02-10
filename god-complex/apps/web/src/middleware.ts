import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    const session =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("better-auth.session") ||
        request.cookies.get("auth.session");

    if (!session) {
        return NextResponse.redirect(
            new URL(`/signin?next=${pathname}`, request.url)
        );
    }

    return NextResponse.next();
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
