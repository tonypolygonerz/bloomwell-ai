import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAdminFromRequest } from '@/shared/lib/admin-auth';

interface UserExportWhereInput {
  OR?: Array<{
    name?: { contains: string };
    email?: { contains: string };
    Organization?: { name: { contains: string } };
  }>;
  Account?: { some?: Record<string, never>; none?: Record<string, never> };
  Conversation?: { some?: { createdAt: { gte: Date } }; none?: { createdAt: { gte: Date } } };
  WebinarRSVP?: { some?: { rsvpDate: { gte: Date } }; none?: { rsvpDate: { gte: Date } } };
  AND?: Array<{
    Conversation: { none: { createdAt: { gte: Date } } };
    WebinarRSVP: { none: { rsvpDate: { gte: Date } } };
  }>;
}

interface UserWithRelations {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  Organization?: {
    name: string | null;
    mission: string | null;
    budget: string | null;
    staffSize: string | null;
  } | null;
  Account: Array<{
    provider: string;
    type: string;
  }>;
  _count: {
    Conversation: number;
    WebinarRSVP: number;
  };
}

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
    const whereConditions: UserExportWhereInput = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { Organization: { name: { contains: search } } },
      ];
    }

    if (accountType) {
      if (accountType === 'oauth') {
        whereConditions.Account = { some: {} };
      } else if (accountType === 'email') {
        whereConditions.Account = { none: {} };
      }
    }

    if (activityFilter) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      switch (activityFilter) {
        case 'active':
          whereConditions.OR = [
            {
              Conversation: {
                some: {
                  createdAt: { gte: thirtyDaysAgo },
                },
              },
            },
            {
              WebinarRSVP: {
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
              Conversation: {
                none: {
                  createdAt: { gte: thirtyDaysAgo },
                },
              },
            },
            {
              WebinarRSVP: {
                none: {
                  rsvpDate: { gte: thirtyDaysAgo },
                },
              },
            },
          ];
          break;
        case 'never_logged_in':
          whereConditions.Conversation = { none: {} };
          whereConditions.WebinarRSVP = { none: {} };
          break;
      }
    }

    // Get all users matching filters
    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        Organization: {
          select: {
            name: true,
            mission: true,
            budget: true,
            staffSize: true,
          },
        },
        Account: {
          select: {
            provider: true,
            type: true,
          },
        },
        _count: {
          select: {
            Conversation: true,
            WebinarRSVP: true,
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

    const csvRows = users.map((user: UserWithRelations) => [
      user.name || '',
      user.email,
      user.Organization?.name || '',
      user.Account.length > 0 ? user.Account[0].provider : 'email',
      user.createdAt.toISOString().split('T')[0],
      user.updatedAt.toISOString().split('T')[0],
      user._count.Conversation.toString(),
      user._count.WebinarRSVP.toString(),
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
