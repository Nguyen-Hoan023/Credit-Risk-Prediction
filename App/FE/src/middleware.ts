import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Public routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/register", "/verify-otp", "/forgot-password"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a public auth route (locale-prefixed)
  const isPublicPath = PUBLIC_PATHS.some(path =>
    pathname.endsWith(path) || pathname.includes(path + "?")
  );

  // Let next-intl handle locale routing first
  const intlResponse = intlMiddleware(request);

  // If it's a public path, allow through
  if (isPublicPath) {
    return intlResponse;
  }

  // For protected routes, check for auth token in cookies or let client handle it
  // (token lives in localStorage so server-side check is limited)
  // The client-side will redirect to /login if no token via auth.ts
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)" ],
};
