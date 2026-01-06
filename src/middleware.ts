import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = new Set(["/", "/login"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  if (publicPaths.has(pathname)) {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get("auth_user")?.value;
  if (!userCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
