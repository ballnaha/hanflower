import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");
    const isLoginRoute = nextUrl.pathname === "/admin/login";
    const isLoginApiRoute = nextUrl.pathname === "/api/admin/login";

    // Redirect logged-in users away from login page
    if (isLoginRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
    }

    // Protect UI routes - redirect to login
    if (isAdminRoute && !isLoginRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }

    // Protect API routes - return 401
    if (isAdminApiRoute && !isLoginApiRoute && !isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.next();

    // Prevent caching for admin routes to ensure logout works immediately
    if (isAdminRoute || isAdminApiRoute) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
        response.headers.set("Surrogate-Control", "no-store");
    }

    return response;
});

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
