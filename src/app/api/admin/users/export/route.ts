import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAdminFromRequest } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const accountType = searchParams.get('accountType') || '';
    const activityFilter = searchParams.get('activity') || '';

    // Build search conditions (same as users API)
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { organization: { name: { contains: search } } },
      ];
    }

    if (accountType) {
      if (accountType === 'oauth') {
        whereConditions.accounts = { some: {} };
      } else if (accountType === 'email') {
        whereConditions.accounts = { none: {} };
      }
    }

    if (activityFilter) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      switch (activityFilter) {
        case 'active':
          whereConditions.OR = [
            {
              conversations: {
                some: {
                  createdAt: { gte: thirtyDaysAgo },
                },
              },
            },
            {
              webinarRSVPs: {
                some: {
                  rsvpDate: { gte: thirtyDaysAgo },
                },
              },
            },
          ];
          break;
        case 'inactive':
          whereConditions.AND = [
            {
              conversations: {
                none: {
                  createdAt: { gte: thirtyDaysAgo },
                },
              },
            },
            {
              webinarRSVPs: {
                none: {
                  rsvpDate: { gte: thirtyDaysAgo },
                },
              },
            },
          ];
          break;
        case 'never_logged_in':
          whereConditions.conversations = { none: {} };
          whereConditions.webinarRSVPs = { none: {} };
          break;
      }
    }

    // Get all users matching filters
    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        organization: {
          select: {
            name: true,
            mission: true,
            budget: true,
            staffSize: true,
          },
        },
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
        _count: {
          select: {
            conversations: true,
            webinarRSVPs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate CSV content
    const csvHeaders = [
      'Name',
      'Email',
      'Organization',
      'Account Type',
      'Created Date',
      'Last Activity',
      'Total Conversations',
      'Total RSVPs',
      'Status',
    ];

    const csvRows = users.map(user => [
      user.name || '',
      user.email,
      user.organization?.name || '',
      user.accounts.length > 0 ? user.accounts[0].provider : 'email',
      user.createdAt.toISOString().split('T')[0],
      user.updatedAt.toISOString().split('T')[0],
      user._count.conversations.toString(),
      user._count.webinarRSVPs.toString(),
      'active',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('User export API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export users',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
