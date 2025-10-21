import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for performance optimization
 * - Adds caching headers for static assets
 * - Adds security headers
 * - Optimizes response times
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Add caching headers for static assets
  const pathname = request.nextUrl.pathname

  // Cache static assets aggressively
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Cache API responses briefly
  if (pathname.startsWith('/api')) {
    // Most API responses shouldn't be cached, but health checks can be
    if (pathname === '/api/health') {
      response.headers.set(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=120'
      )
    }
  }

  // Add HSTS header for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

