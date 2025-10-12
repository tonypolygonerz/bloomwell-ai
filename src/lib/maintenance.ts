import { prisma } from '@/lib/prisma';

/**
 * Check if the app is currently in maintenance mode
 */
export async function isMaintenanceModeEnabled(): Promise<boolean> {
  try {
    const environment =
      process.env.NODE_ENV === 'production' ? 'production' : 'staging';

    const maintenanceMode = await prisma.maintenanceMode.findUnique({
      where: { environment },
      select: { isEnabled: true },
    });

    return maintenanceMode?.isEnabled || false;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Fail-safe: if we can't check, assume NOT in maintenance mode
    // This prevents accidental lockouts due to DB errors
    return false;
  }
}

/**
 * Get full maintenance mode status including message
 */
export async function getMaintenanceStatus() {
  try {
    const environment =
      process.env.NODE_ENV === 'production' ? 'production' : 'staging';

    const maintenanceMode = await prisma.maintenanceMode.findUnique({
      where: { environment },
    });

    return {
      isEnabled: maintenanceMode?.isEnabled || false,
      message: maintenanceMode?.message || null,
      enabledAt: maintenanceMode?.enabledAt || null,
      enabledBy: maintenanceMode?.enabledBy || null,
      environment,
    };
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    return {
      isEnabled: false,
      message: null,
      enabledAt: null,
      enabledBy: null,
      environment:
        process.env.NODE_ENV === 'production' ? 'production' : 'staging',
    };
  }
}

/**
 * Routes that should bypass maintenance mode
 * Admin routes and maintenance page itself should always be accessible
 */
export const maintenanceBypassRoutes = [
  '/api/admin',
  '/api/maintenance/status',
  '/maintenance',
  '/admin',
  '/api/auth', // Allow authentication during maintenance
  '/_next', // Next.js internal routes
  '/favicon.ico',
  '/public',
];

/**
 * Check if a given path should bypass maintenance mode
 */
export function shouldBypassMaintenance(pathname: string): boolean {
  return maintenanceBypassRoutes.some(route => pathname.startsWith(route));
}

