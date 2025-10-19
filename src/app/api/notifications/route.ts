import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      whereConditions.isRead = false;
    }

    // Get user notifications
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where: whereConditions,
        include: {
          Webinar: {
            select: {
              id: true,
              title: true,
              uniqueSlug: true,
              scheduledDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.userNotification.count({
        where: whereConditions,
      }),
      prisma.userNotification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      total: totalCount,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('User notifications API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch notifications',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId || !action) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'mark_read':
        updateData = {
          isRead: true,
          readAt: new Date(),
        };
        break;

      case 'mark_unread':
        updateData = {
          isRead: false,
          readAt: null,
        };
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }

    // Update notification
    const updatedNotification = await prisma.userNotification.update({
      where: {
        id: notificationId,
        userId: session.user.id, // Ensure user can only update their own notifications
      },
      data: updateData,
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update notification',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
