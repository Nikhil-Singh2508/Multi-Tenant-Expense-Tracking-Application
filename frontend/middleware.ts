import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token") || req.headers.get("authorization") || null;

  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workspace/:path*", "/auth/:path*"],
};
