import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
