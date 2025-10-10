import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Runs on every request
 * Handles maintenance mode redirection
 */

// Routes that should bypass maintenance mode check
const bypassRoutes = [
  '/api/admin',
  '/api/maintenance/status',
  '/maintenance',
  '/admin',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/public',
  '/vercel.svg',
  '/next.svg',
  '/file.svg',
  '/globe.svg',
  '/grid.svg',
  '/window.svg',
];

/**
 * Check if the current path should bypass maintenance mode
 */
function shouldBypassMaintenance(pathname: string): boolean {
  return bypassRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check maintenance mode status from database
 * Note: We can't directly use Prisma in middleware, so we use the API endpoint
 */
async function checkMaintenanceStatus(
  request: NextRequest
): Promise<{ isEnabled: boolean }> {
  try {
    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Call our maintenance status API
    const response = await fetch(`${baseUrl}/api/maintenance/status`, {
      // Add a cache buster to avoid stale responses
      headers: {
        'Cache-Control': 'no-cache',
        'x-middleware-check': 'true',
      },
    });

    if (!response.ok) {
      // If API fails, assume maintenance is NOT enabled (fail-safe)
      console.error('Maintenance status check failed, assuming no maintenance');
      return { isEnabled: false };
    }

    const data = await response.json();
    return { isEnabled: data.isEnabled || false };
  } catch (error) {
    // On error, fail-safe to NOT blocking users
    console.error('Error checking maintenance status in middleware:', error);
    return { isEnabled: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip maintenance check for bypass routes
  if (shouldBypassMaintenance(pathname)) {
    return NextResponse.next();
  }

  // Check if user is already on maintenance page
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // Check maintenance mode status
  const { isEnabled } = await checkMaintenanceStatus(request);

  // If maintenance is enabled, redirect to maintenance page
  if (isEnabled) {
    const maintenanceUrl = new URL('/maintenance', request.url);

    // Add original URL as query param for potential redirect back
    maintenanceUrl.searchParams.set('from', pathname);

    return NextResponse.redirect(maintenanceUrl);
  }

  // No maintenance mode active, proceed normally
  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 * We want it to run on all routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
