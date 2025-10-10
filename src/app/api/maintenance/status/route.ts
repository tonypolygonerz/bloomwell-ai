import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/maintenance/status
 * Public endpoint to check if the app is in maintenance mode
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Determine environment (default to production)
    const environment =
      process.env.NODE_ENV === 'production' ? 'production' : 'staging';

    // Check if maintenance mode is enabled for this environment
    const maintenanceMode = await prisma.maintenanceMode.findUnique({
      where: { environment },
      select: {
        isEnabled: true,
        message: true,
        enabledAt: true,
      },
    });

    // If no record exists, assume maintenance is disabled
    const isEnabled = maintenanceMode?.isEnabled || false;

    return NextResponse.json({
      isEnabled,
      message: isEnabled ? maintenanceMode?.message : null,
      enabledAt: isEnabled ? maintenanceMode?.enabledAt : null,
      environment,
    });
  } catch (error) {
    console.error('Error checking maintenance status:', error);

    // In case of error, assume maintenance is NOT enabled
    // This prevents accidentally blocking access due to DB errors
    return NextResponse.json({
      isEnabled: false,
      message: null,
      enabledAt: null,
      environment:
        process.env.NODE_ENV === 'production' ? 'production' : 'staging',
      error: 'Failed to check maintenance status',
    });
  }
}
