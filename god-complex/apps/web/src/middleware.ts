import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
const SESSION_TIMEOUT = 5000;
const MAX_REDIRECT_COUNT = 3;
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const timestamp = new Date().toISOString();
    const redirectCount = parseInt(request.cookies.get("signin_redirect_count")?.value || "0");
    if (redirectCount > MAX_REDIRECT_COUNT) {
        console.log(`[MIDDLEWARE][REDIRECT_LOOP] Count: ${redirectCount}, Path: ${pathname}, clearing and redirecting to error page`);
        const response = NextResponse.redirect(new URL("/signin?error=loop", request.url));
        response.cookies.delete("signin_redirect_count");
        return response;
    }
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
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
    const sessionToken = request.cookies.get("better-auth.session_token");
    if (!sessionToken) {
        console.log(`[MIDDLEWARE][${timestamp}] No session token, redirecting to signin from ${pathname}`);
        const response = NextResponse.redirect(new URL(`/signin?next=${pathname}`, request.url));
        response.cookies.set("signin_redirect_count", String(redirectCount + 1), {
            maxAge: 60,
        });
        return response;
    }
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SESSION_TIMEOUT);
        const sessionResponse = await fetch(`${API_URL}/api/auth/session`, {
            method: "GET",
            headers: {
                "Cookie": `better-auth.session_token=${sessionToken.value}`,
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            if (session?.user) {
                console.log(`[MIDDLEWARE][${timestamp}] ✓ Valid session for ${session.user.email} on ${pathname}`);
                const response = NextResponse.next();
                response.cookies.delete("signin_redirect_count");
                response.headers.set("Cache-Control", "no-store");
                return response;
            }
        }
        if (redirectCount === 0) {
            console.log(`[MIDDLEWARE][${timestamp}]  Session validation failed (${sessionResponse.status}), allowing through on first attempt for ${pathname}`);
            const response = NextResponse.next();
            response.cookies.set("signin_redirect_count", "1", { maxAge: 60 });
            response.headers.set("Cache-Control", "no-store");
            return response;
        }
        console.log(`[MIDDLEWARE][${timestamp}] ✗ Invalid session (${sessionResponse.status}), clearing and redirecting from ${pathname}`);
        const response = NextResponse.redirect(new URL(`/signin?next=${pathname}&error=invalid`, request.url));
        response.cookies.delete("better-auth.session_token");
        response.cookies.set("signin_redirect_count", String(redirectCount + 1), {
            maxAge: 60,
        });
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
    catch (error) {
        const errorName = (error as Error)?.name;
        if (errorName === 'AbortError') {
            console.error(`[MIDDLEWARE][${timestamp}]  Session validation timed out for ${pathname}`);
        }
        else {
            console.error(`[MIDDLEWARE][${timestamp}]  Session validation error on ${pathname}:`, error);
        }
        console.log(`[MIDDLEWARE][${timestamp}] Allowing through despite validation error (cookie exists)`);
        const response = NextResponse.next();
        response.headers.set("Cache-Control", "no-store");
        return response;
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
        "/application/:path*",
    ],
};
