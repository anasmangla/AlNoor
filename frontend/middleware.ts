import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function resolveNextParam(req: NextRequest): string {
    const existing = req.nextUrl.searchParams.get("next");
    if (existing && existing.trim().length > 0) {
        return existing;
    }

    const candidate = req.nextUrl.clone();
    candidate.searchParams.delete("next");
    const fallback = `${candidate.pathname}${candidate.search}`;

    return fallback || "/";
}

function buildLoginRedirectUrl(req: NextRequest, basePath: string) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = `${basePath}/admin/login`;
    loginUrl.search = "";
    loginUrl.searchParams.set("next", resolveNextParam(req));

    return loginUrl;
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const token = req.cookies.get("alnoor_token")?.value;

    if (
        pathname.startsWith("/admin") &&
        pathname !== "/admin/login" &&
        pathname !== "/admin" &&
        !token
    ) {
        return NextResponse.redirect(buildLoginRedirectUrl(req, basePath));
    }

    if (pathname === "/admin") {
        if (token) {
            const url = req.nextUrl.clone();
            url.pathname = `${basePath}/admin/dashboard`;
            return NextResponse.redirect(url);
        }

        return NextResponse.redirect(buildLoginRedirectUrl(req, basePath));
    }

    // Short path helpers
    if (pathname === "/store") {
        const url = req.nextUrl.clone();
        url.pathname = `${basePath}/products`;
        return NextResponse.redirect(url);
    }
    if (pathname === "/pos") {
        const url = req.nextUrl.clone();
        url.pathname = `${basePath}/admin/pos`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/store", "/pos", "/admin"],
};

