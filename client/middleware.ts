import { NextRequest, NextResponse } from "next/server";

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