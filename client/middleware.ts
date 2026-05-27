import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTE_PREFIXES,
  PUBLIC_ROUTE_PREFIXES,
  ROLE_ALLOWED_PREFIXES,
  getRoleHomePath,
  matchesAnyPathPrefix,
} from "./app/lib/authRoutes";

const STAFF_ROUTE_PREFIXES = Object.values(ROLE_ALLOWED_PREFIXES)
  .flat()
  .filter((prefix, index, prefixes) => prefixes.indexOf(prefix) === index);

function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get("pos_token")?.value || "";
  const role = request.cookies.get("pos_user_role")?.value || "";

  return { token, role };
}

function isPublicRoute(pathname: string) {
  return matchesAnyPathPrefix(pathname, AUTH_ROUTE_PREFIXES) || matchesAnyPathPrefix(pathname, PUBLIC_ROUTE_PREFIXES);
}

function isStaffRoute(pathname: string) {
  return matchesAnyPathPrefix(pathname, STAFF_ROUTE_PREFIXES);
}

function getRedirectForUnauthorizedRole(pathname: string, role: string) {
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role as keyof typeof ROLE_ALLOWED_PREFIXES] || [];
  if (allowedPrefixes.length > 0 && matchesAnyPathPrefix(pathname, allowedPrefixes)) {
    return null;
  }

  return getRoleHomePath(role);
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

  if (!token && isStaffRoute(pathname)) {
    const url = request.nextUrl.clone();
    const attemptedPath = request.nextUrl.pathname + request.nextUrl.search;

    if (pathname.startsWith("/restaurant/")) {
      url.pathname = "/restaurant/login";
      url.search = `?next=${encodeURIComponent(attemptedPath)}`;
    } else {
      url.pathname = "/login";
      url.search = "";
    }
    return NextResponse.redirect(url);
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