import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user statistics
    const [
      totalUsers,
      usersWithOrganizations,
      oauthUsers,
      emailUsers,
      recentUsers,
      activeUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Users with organizations
      prisma.user.count({
        where: {
          organizationId: { not: null },
        },
      }),

      // OAuth users
      prisma.user.count({
        where: {
          accounts: {
            some: {},
          },
        },
      }),

      // Email users (users without OAuth accounts)
      prisma.user.count({
        where: {
          accounts: {
            none: {},
          },
        },
      }),

      // Users created in last 30 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Active users (with conversations or RSVPs in last 30 days)
      prisma.user.count({
        where: {
          OR: [
            {
              conversations: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            {
              rsvps: {
                some: {
                  rsvpDate: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      usersWithOrganizations,
      oauthUsers,
      emailUsers,
      recentUsers,
      activeUsers,
    });
  } catch (error) {
    console.error('User stats API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user statistics',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
