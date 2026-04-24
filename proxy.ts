import { NextRequest, NextResponse } from "next/server";

function getToken(request: NextRequest) {
  return request.cookies.get("token")?.value;
}

function isTokenExpired(token: string) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));

    if (!payload.exp) return false;

    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getToken(request);

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname.startsWith("/login");

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/reservations");

  let isValidToken = false;

  if (token && !isTokenExpired(token)) {
    isValidToken = true;
  }

  if (isProtectedRoute && !isValidToken) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token"); // remove token inválido/expirado
    return response;
  }

  if (isLoginPage && isValidToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/reservations/:path*",
    "/login",
  ],
};