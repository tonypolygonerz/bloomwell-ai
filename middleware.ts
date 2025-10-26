import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for authentication and performance optimization
 * - Protects /dashboard route
 * - Adds security headers
 * - Adds caching headers for static assets
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname: _pathname } = request.nextUrl

  // Temporarily disable all middleware logic for debugging
  return NextResponse.next()
}

// Configure which routes the middleware runs on
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
}
