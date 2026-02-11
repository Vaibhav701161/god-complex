import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
    "/dashboard",
    "/contract",
    "/groups",
    "/weekly-review",
    "/monthly-review",
    "/system-log",
    "/profile",
    "/payments",
    "/rules",
    "/application",
];

function isProtected(pathname: string): boolean {
    return PROTECTED_PATHS.some((path) =>
        pathname.startsWith(path)
    );
}

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // Skip non-protected routes
    if (!isProtected(pathname)) {
        return NextResponse.next();
    }

    // Prevent redirect loop
    if (pathname.startsWith("/signin")) {
        return NextResponse.next();
    }

    try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL;

        if (!apiURL) {
            console.error("[MIDDLEWARE] NEXT_PUBLIC_API_URL not defined");
            return NextResponse.redirect(
                new URL("/signin", request.url)
            );
        }

        // Forward cookies to backend
        const sessionResponse = await fetch(
            `${apiURL}/api/auth/get-session`,
            {
                method: "GET",
                headers: {
                    cookie: request.headers.get("cookie") ?? "",
                },
                cache: "no-store",
            }
        );

        if (!sessionResponse.ok) {
            console.warn(
                "[MIDDLEWARE] Session verification failed:",
                sessionResponse.status
            );
            return redirectToSignIn(request);
        }

        const session = await sessionResponse.json();

        if (!session?.user) {
            return redirectToSignIn(request);
        }

        // Session valid
        return NextResponse.next();

    } catch (error) {
        console.error("[MIDDLEWARE] Unexpected error:", error);

        // Fail closed (secure)
        return redirectToSignIn(request);
    }
}

function redirectToSignIn(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    const nextParam = encodeURIComponent(pathname + search);

    const signInURL = new URL(
        `/signin?next=${nextParam}`,
        request.url
    );

    return NextResponse.redirect(signInURL);
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
