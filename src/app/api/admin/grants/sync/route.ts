import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/admin-auth';
import { syncGrants } from '@/lib/grants-sync';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent sync history
    const syncHistory = await prisma.grant_syncs.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get current grants statistics
    const now = new Date();
    const [totalGrants, activeGrants, lastSync] = await Promise.all([
      prisma.grants.count(),
      prisma.grants.count({
        where: {
          isActive: true,
          OR: [
            { closeDate: null }, // Grants without close date are considered active
            { closeDate: { gte: now } }, // Grants with close date in the future
          ],
        },
      }),
      prisma.grant_syncs.findFirst({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      syncHistory,
      statistics: {
        totalGrants,
        activeGrants,
        lastSyncDate: lastSync?.createdAt,
        lastSyncStatus: lastSync?.syncStatus,
        lastSyncFile: lastSync?.fileName,
      },
    });
  } catch (error) {
    console.error('Grants sync status API error:', error);
    return NextResponse.json(
      {
        error:
          'Internal server error: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Starting grants sync triggered by admin: ${admin.username}`);

    // Check if there's already a sync in progress
    const activeSync = await prisma.grant_syncs.findFirst({
      where: { syncStatus: 'processing' },
      orderBy: { createdAt: 'desc' },
    });

    if (activeSync) {
      const timeSinceStart = Date.now() - activeSync.createdAt.getTime();
      const maxSyncTime = 30 * 60 * 1000; // 30 minutes

      if (timeSinceStart < maxSyncTime) {
        return NextResponse.json(
          {
            error: 'Sync already in progress',
            activeSync: {
              fileName: activeSync.fileName,
              startedAt: activeSync.createdAt,
              elapsedMinutes: Math.round(timeSinceStart / 60000),
            },
          },
          { status: 409 }
        );
      } else {
        // Mark the old sync as failed due to timeout
        await prisma.grant_syncs.update({
          where: { id: activeSync.id },
          data: {
            syncStatus: 'failed',
            errorMessage: 'Sync timed out after 30 minutes',
          },
        });
      }
    }

    // Start the sync process
    const syncResult = await syncGrants();

    if (syncResult.success) {
      console.log(
        `Grants sync completed successfully: ${syncResult.recordsProcessed} processed, ${syncResult.recordsDeleted} deleted`
      );

      return NextResponse.json({
        success: true,
        message: 'Grants sync completed successfully',
        result: {
          fileName: syncResult.fileName,
          extractedDate: syncResult.extractedDate,
          fileSize: syncResult.fileSize,
          recordsProcessed: syncResult.recordsProcessed,
          recordsDeleted: syncResult.recordsDeleted,
        },
      });
    } else {
      console.error(`Grants sync failed: ${syncResult.errorMessage}`);

      return NextResponse.json(
        {
          success: false,
          error: 'Grants sync failed',
          message: syncResult.errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Grants sync API error:', error);
    return NextResponse.json(
      {
        error:
          'Internal server error: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
