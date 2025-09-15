import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("alnoor_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Short path helpers
  if (pathname === "/store") {
    const url = req.nextUrl.clone();
    url.pathname = `${bp}/products`;
    return NextResponse.redirect(url);
  }
  if (pathname === "/pos") {
    const url = req.nextUrl.clone();
    url.pathname = `${bp}/admin/pos`;
    return NextResponse.redirect(url);
  }
  if (pathname === "/admin") {
    const token = req.cookies.get("alnoor_token")?.value;
    const url = req.nextUrl.clone();
    url.pathname = token ? `${bp}/admin/dashboard` : `${bp}/admin/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/store", "/pos", "/admin"],
};

