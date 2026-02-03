import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");
    const isLoginRoute = nextUrl.pathname === "/admin/login";
    const isLoginApiRoute = nextUrl.pathname === "/api/admin/login";

    // Protect UI routes
    if (isAdminRoute && !isLoginRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }

    // Protect API routes
    if (isAdminApiRoute && !isLoginApiRoute && !isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
