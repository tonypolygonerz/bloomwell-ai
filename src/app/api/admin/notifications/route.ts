import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

interface AdminNotificationWhereInput {
  adminId: string;
  status?: string;
}

interface AdminNotificationWithCount {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: string;
  targetData: string | null;
  scheduledAt: string | null;
  status: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    UserNotification: number;
  };
}

interface UserWithId {
  id: string;
}

interface UserNotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  adminNotificationId: string;
  createdAt: string;
  updatedAt: string;
}

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
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: AdminNotificationWhereInput = {
      adminId: admin.id,
    };

    if (status) {
      whereConditions.status = status;
    }

    // Get notifications with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where: whereConditions,
        include: {
          _count: {
            select: {
              UserNotification: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.adminNotification.count({
        where: whereConditions,
      }),
    ]);

    return NextResponse.json({
      notifications,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Admin notifications API error:', error);
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

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, targetType, targetData, scheduledAt } = body;

    // Validate required fields
    if (!title || !message || !type || !targetType) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Create admin notification
    const adminNotification = await prisma.adminNotification.create({
      data: {
        id: `admin-notif-${admin.id}-${Date.now()}`,
        title,
        message,
        type,
        targetType,
        targetData: targetData ? JSON.stringify(targetData) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'scheduled' : 'draft',
        adminId: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // If not scheduled, send immediately
    if (!scheduledAt) {
      await sendNotificationToUsers(adminNotification);
    }

    return NextResponse.json(adminNotification);
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create notification',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function sendNotificationToUsers(adminNotification: AdminNotificationWithCount) {
  try {
    let targetUsers: UserWithId[] = [];

    // Get target users based on targetType
    switch (adminNotification.targetType) {
      case 'all_users':
        targetUsers = await prisma.user.findMany({
          select: { id: true },
        });
        break;

      case 'webinar_rsvps':
        if (adminNotification.targetData) {
          const targetData = JSON.parse(adminNotification.targetData);
          if (targetData.webinarId) {
            const rsvps = await prisma.webinarRSVP.findMany({
              where: { webinarId: targetData.webinarId },
              select: { userId: true },
            });
            targetUsers = rsvps.map(rsvp => ({ id: rsvp.userId }));
          }
        }
        break;

      case 'specific_users':
        if (adminNotification.targetData) {
          const targetData = JSON.parse(adminNotification.targetData);
          if (targetData.userIds && Array.isArray(targetData.userIds)) {
            targetUsers = await prisma.user.findMany({
              where: { id: { in: targetData.userIds } },
              select: { id: true },
            });
          }
        }
        break;
    }

    // Create user notifications
    if (targetUsers.length > 0) {
      const userNotifications: UserNotificationData[] = targetUsers.map((user: UserWithId, index: number) => ({
        id: `user-notif-${user.id}-${adminNotification.id}-${index}`,
        title: adminNotification.title,
        message: adminNotification.message,
        type: adminNotification.type,
        userId: user.id,
        adminNotificationId: adminNotification.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await prisma.userNotification.createMany({
        data: userNotifications,
      });

      // Update admin notification status
      await prisma.adminNotification.update({
        where: { id: adminNotification.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Send notification error:', error);

    // Update admin notification status to failed
    await prisma.adminNotification.update({
      where: { id: adminNotification.id },
      data: {
        status: 'failed',
      },
    });
  }
}
