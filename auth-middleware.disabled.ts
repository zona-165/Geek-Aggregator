import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, validSession } from "./lib/auth";
export function middleware(request: NextRequest) {
  const path = new URL(request.url).pathname;
  if (path === "/login" || path.startsWith("/api/auth/")) return NextResponse.next();
  if (path === "/" || path.startsWith("/api/")) {
    if (!validSession(request.cookies.get(COOKIE_NAME)?.value)) return path.startsWith("/api/") ? Response.json({ error: "需要登录" }, { status: 401 }) : NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
