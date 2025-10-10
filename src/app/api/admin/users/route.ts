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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const accountType = searchParams.get('accountType') || '';
    const activityFilter = searchParams.get('activity') || '';

    const skip = (page - 1) * limit;

    // Build search conditions (SQLite compatible)
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { Organization: { name: { contains: search } } },
      ];
    }

    // Add account type filter
    if (accountType) {
      if (accountType === 'oauth') {
        whereConditions.Account = { some: {} };
      } else if (accountType === 'email') {
        whereConditions.Account = { none: {} };
      }
    }

    // Add activity filter
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

    // Build sort conditions
    const orderBy: any = {};
    if (sortBy === 'organization') {
      orderBy.Organization = { name: sortOrder };
    } else if (sortBy === 'lastLogin') {
      // For now, we'll use updatedAt as a proxy for last login
      // In a real app, you'd track actual login times
      orderBy.updatedAt = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        include: {
          Organization: {
            select: {
              id: true,
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
          Conversation: {
            select: {
              id: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          WebinarRSVP: {
            select: {
              id: true,
              rsvpDate: true,
            },
            orderBy: {
              rsvpDate: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              Conversation: true,
              WebinarRSVP: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: whereConditions,
      }),
    ]);

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'No name',
      email: user.email,
      image: user.image,
      organization: user.Organization
        ? {
            id: user.Organization.id,
            name: user.Organization.name,
            mission: user.Organization.mission,
            budget: user.Organization.budget,
            staffSize: user.Organization.staffSize,
          }
        : null,
      accountType: user.Account.length > 0 ? user.Account[0].provider : 'email',
      lastLogin: user.updatedAt, // Using updatedAt as proxy
      createdAt: user.createdAt,
      status: 'active', // All users are active for now
      conversationCount: user._count.Conversation,
      rsvpCount: user._count.WebinarRSVP,
      lastConversation: user.Conversation[0]?.createdAt || null,
      lastRSVP: user.WebinarRSVP[0]?.rsvpDate || null,
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}
