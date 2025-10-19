import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAdminFromRequest } from '@/shared/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');

    console.log('📡 GET maintenance status request');
    console.log('   Environment param:', environment);

    // If no environment specified, return ALL maintenance modes (for admin dashboard)
    if (!environment) {
      console.log('   Fetching ALL environments for admin dashboard');

      const maintenanceModes = await prisma.maintenanceMode.findMany({
        orderBy: { environment: 'asc' },
      });

      console.log(
        '✅ All maintenance modes fetched:',
        maintenanceModes.length,
        'records'
      );

      return NextResponse.json({
        maintenanceModes,
      });
    }

    // If environment specified, return specific environment (for public status check)
    if (!['production', 'staging'].includes(environment)) {
      console.error('❌ Invalid environment:', environment);
      return NextResponse.json(
        { error: 'Invalid environment. Must be "production" or "staging"' },
        { status: 400 }
      );
    }

    console.log('   Fetching specific environment:', environment);

    const maintenanceMode = await prisma.maintenanceMode.findUnique({
      where: { environment },
    });

    console.log('✅ Maintenance mode fetched:', maintenanceMode);

    return NextResponse.json({
      isEnabled: maintenanceMode?.isEnabled || false,
      message: maintenanceMode?.message || null,
      environment,
    });
  } catch (error) {
    console.error('❌ Error fetching maintenance mode:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch maintenance mode',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('📡 POST maintenance mode update request received');

    // Check admin authentication
    const admin = getAdminFromRequest(request);
    console.log('👤 Admin user:', admin?.username);

    if (!admin) {
      console.error('❌ No admin session found');
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    console.log('🔐 Admin authenticated:', {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    // Parse request body
    const body = await request.json();
    console.log('📦 Request body:', body);

    const { environment, isEnabled, message } = body;

    // Validate environment
    if (!environment || !['production', 'staging'].includes(environment)) {
      console.error('❌ Invalid environment in body:', environment);
      return NextResponse.json(
        { error: 'Invalid environment. Must be "production" or "staging"' },
        { status: 400 }
      );
    }

    // Validate isEnabled
    if (typeof isEnabled !== 'boolean') {
      console.error('❌ Invalid isEnabled value:', isEnabled);
      return NextResponse.json(
        { error: 'isEnabled must be a boolean' },
        { status: 400 }
      );
    }

    console.log(
      `🔧 Admin ${admin.username} attempting to ${isEnabled ? 'ENABLE' : 'DISABLE'} maintenance mode for ${environment}`
    );

    // Upsert maintenance mode
    const maintenanceMode = await prisma.maintenanceMode.upsert({
      where: { environment },
      update: {
        isEnabled,
        message: message || null,
        enabledAt: isEnabled ? new Date() : null,
        enabledBy: admin.id,
        updatedAt: new Date(),
      },
      create: {
        environment,
        isEnabled,
        message: message || null,
        enabledAt: isEnabled ? new Date() : null,
        enabledBy: admin.id,
      },
    });

    console.log(
      `✅ Maintenance mode ${isEnabled ? 'ENABLED' : 'DISABLED'} for ${environment}:`,
      maintenanceMode
    );

    return NextResponse.json({
      success: true,
      maintenanceMode,
    });
  } catch (error) {
    console.error('❌ Error updating maintenance mode:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    return NextResponse.json(
      {
        error: 'Failed to update maintenance mode',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('📡 DELETE maintenance mode request received');

    const admin = getAdminFromRequest(request);

    if (!admin) {
      console.error('❌ Unauthorized delete attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔐 Admin authenticated for DELETE:', admin.username);

    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');

    if (!environment || !['production', 'staging'].includes(environment)) {
      console.error('❌ Invalid environment for delete:', environment);
      return NextResponse.json(
        { error: 'Invalid environment' },
        { status: 400 }
      );
    }

    await prisma.maintenanceMode.delete({
      where: { environment },
    });

    console.log(`🗑️ Maintenance mode record deleted for ${environment}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting maintenance mode:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance mode' },
      { status: 500 }
    );
  }
}
