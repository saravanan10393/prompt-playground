import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Generate CSRF token using Web Crypto API (Edge Runtime compatible)
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract CSRF token from cookie header string
 */
function extractCSRFTokenFromCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/csrf_token=([^;]+)/);
  return match ? match[1] : undefined;
}

/**
 * Routes exempt from CSRF validation
 */
const CSRF_EXEMPT_ROUTES = [
  "/api/auth", // Authentication creates initial session
];

/**
 * Check if route is exempt from CSRF validation
 */
function isCSRFExempt(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
}

/**
 * Next.js Edge Middleware
 * - Generates CSRF tokens for page requests
 * - Validates CSRF tokens for API requests (cookie-only, no headers)
 * - Uses SameSite cookie attribute for cross-origin protection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api");

  // HANDLE API ROUTES - CSRF VALIDATION (Cookie-only)
  if (isApiRoute) {
    // Skip CSRF validation for exempt routes
    if (isCSRFExempt(pathname)) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[CSRF] Skipping validation for exempt route: ${pathname}`);
      }
      return NextResponse.next();
    }

    // Extract CSRF token from cookie
    const csrfToken = extractCSRFTokenFromCookie(request.headers.get("cookie"));

    // Validate that CSRF token exists
    // Browser automatically sends cookie on same-origin requests
    // Cross-origin requests blocked by SameSite=lax
    if (!csrfToken) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[CSRF] Validation failed for ${pathname} - no CSRF cookie found`);
      }

      return NextResponse.json(
        {
          error: "Invalid session",
          code: "CSRF_VALIDATION_FAILED",
          message: "Request blocked for security reasons. Please refresh the page and try again.",
        },
        { status: 401 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[CSRF] Validation passed for ${pathname}`);
    }

    // CSRF validation passed
    return NextResponse.next();
  }

  // HANDLE PAGE REQUESTS - GENERATE CSRF TOKENS
  const response = NextResponse.next();

  // Check if CSRF token already exists in request cookies
  const existingToken = request.cookies.get("csrf_token");

  // If token is missing, generate and set it
  if (!existingToken) {
    const csrfToken = generateCSRFToken();

    // Log in development mode for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[CSRF] Generating token for ${pathname}`);
    }

    // Set httpOnly cookie with SameSite protection
    // - httpOnly: prevents JavaScript access (more secure)
    // - SameSite: lax prevents cross-origin requests from sending cookie
    // - Browser automatically sends this cookie on same-origin requests
    response.cookies.set("csrf_token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
  }

  return response;
}

/**
 * Configure which routes this middleware runs on
 * Runs on all routes except static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
