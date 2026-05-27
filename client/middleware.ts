import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTE_PREFIXES,
  PUBLIC_ROUTE_PREFIXES,
  ROLE_ALLOWED_PREFIXES,
  getRoleHomePath,
  matchesAnyPathPrefix,
  matchesPathPrefix,
} from "./app/lib/authRoutes";

function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get("pos_token")?.value ?? null;
  const role = request.cookies.get("pos_user_role")?.value ?? null;

  return { token, role };
}

function isPublicRoute(pathname: string) {
  return matchesAnyPathPrefix(pathname, PUBLIC_ROUTE_PREFIXES);
}

function isStaffRoute(pathname: string) {
  return matchesAnyPathPrefix(pathname, Object.values(ROLE_ALLOWED_PREFIXES).flat());
}

function getRedirectForUnauthorizedRole(pathname: string, role: string | null) {
  const allowedPrefixes = role ? ROLE_ALLOWED_PREFIXES[role as keyof typeof ROLE_ALLOWED_PREFIXES] : null;

  if (!allowedPrefixes) {
    return getRoleHomePath(role);
  }

  const hasAccess = allowedPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix));
  return hasAccess ? null : getRoleHomePath(role);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { token, role } = getSessionFromRequest(request);

  if (isPublicRoute(pathname)) {
    if (token && matchesAnyPathPrefix(pathname, AUTH_ROUTE_PREFIXES)) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleHomePath(role);
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (token && isStaffRoute(pathname)) {
    const redirectPath = getRedirectForUnauthorizedRole(pathname, role);
    if (redirectPath) {
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};