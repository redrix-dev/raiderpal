/**
 * @fileoverview Next.js middleware for security headers and request processing
 *
 * This middleware applies security headers to all responses to protect against
 * common web vulnerabilities like XSS, clickjacking, and MIME sniffing.
 */

import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware function that adds security headers to all responses
 *
 * Security headers applied:
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-XSS-Protection: Enables browser XSS filtering (legacy support)
 * - Referrer-Policy: Controls referrer information sent with requests
 * - Content-Security-Policy: Restricts resource loading to prevent XSS
 *
 * @param request - The incoming Next.js request
 * @returns Response with security headers applied
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking by blocking iframe embedding
  response.headers.set("X-Frame-Options", "DENY");

  // Enable XSS filtering in older browsers (modern browsers have CSP)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Control referrer information leakage
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy - adjust based on your app's needs
  // This is a restrictive policy that you may need to customize
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval for dev
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:", // Allow images from self, data URIs, and HTTPS
    "font-src 'self' data:",
    "connect-src 'self'", // API calls to same origin
    "frame-ancestors 'none'", // Redundant with X-Frame-Options but more robust
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

/**
 * Configuration for which routes this middleware applies to
 * Currently applies to all routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
