import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { webinarId, enableNotifications } = body;

    if (!webinarId) {
      return NextResponse.json(
        {
          error: 'Webinar ID is required',
        },
        { status: 400 }
      );
    }

    // Get webinar details
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      include: {
        WebinarRSVP: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!webinar) {
      return NextResponse.json(
        {
          error: 'Webinar not found',
        },
        { status: 404 }
      );
    }

    if (enableNotifications) {
      // Schedule automated notifications
      const notifications = await scheduleWebinarNotifications(webinar);
      return NextResponse.json({
        message: 'Webinar notifications scheduled',
        notifications,
      });
    } else {
      // Cancel scheduled notifications
      await prisma.webinarNotification.updateMany({
        where: {
          webinarId,
          status: 'scheduled',
        },
        data: {
          status: 'cancelled',
        },
      });

      return NextResponse.json({
        message: 'Webinar notifications cancelled',
      });
    }
  } catch (error) {
    console.error('Webinar notifications API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to manage webinar notifications',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function scheduleWebinarNotifications(webinar: any) {
  const scheduledDate = new Date(webinar.scheduledDate);
  const notifications = [];

  // 24 hours before
  const dayBefore = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
  if (dayBefore > new Date()) {
    const notification = await prisma.webinarNotification.create({
      data: {
        id: `notif-${webinar.id}-24h-${Date.now()}`,
        type: '24_hours',
        scheduledAt: dayBefore,
        status: 'scheduled',
        webinarId: webinar.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    notifications.push(notification);
  }

  // 1 hour before
  const hourBefore = new Date(scheduledDate.getTime() - 60 * 60 * 1000);
  if (hourBefore > new Date()) {
    const notification = await prisma.webinarNotification.create({
      data: {
        id: `notif-${webinar.id}-1h-${Date.now()}`,
        type: '1_hour',
        scheduledAt: hourBefore,
        status: 'scheduled',
        webinarId: webinar.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    notifications.push(notification);
  }

  // Starting now
  const startingNow = new Date(scheduledDate.getTime());
  if (startingNow > new Date()) {
    const notification = await prisma.webinarNotification.create({
      data: {
        id: `notif-${webinar.id}-now-${Date.now()}`,
        type: 'starting_now',
        scheduledAt: startingNow,
        status: 'scheduled',
        webinarId: webinar.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    notifications.push(notification);
  }

  // Follow-up (1 hour after)
  const followUp = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
  const notification = await prisma.webinarNotification.create({
    data: {
      id: `notif-${webinar.id}-followup-${Date.now()}`,
      type: 'followup',
      scheduledAt: followUp,
      status: 'scheduled',
      webinarId: webinar.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  notifications.push(notification);

  return notifications;
}

// Background job to process scheduled notifications
export async function processScheduledNotifications() {
  try {
    const now = new Date();

    // Get notifications that are due
    const dueNotifications = await prisma.webinarNotification.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
        include: {
          Webinar: {
            include: {
              WebinarRSVP: {
                include: {
                  User: true,
                },
              },
            },
          },
        },
    });

    for (const notification of dueNotifications) {
      await processWebinarNotification(notification);
    }
  } catch (error) {
    console.error('Process scheduled notifications error:', error);
  }
}

async function processWebinarNotification(notification: any) {
  try {
    const webinar = notification.webinar;
    const rsvpUsers = webinar.rsvps.map((rsvp: any) => rsvp.user);

    // Create user notifications based on type
    const userNotifications = rsvpUsers.map((user: any) => {
      let title = '';
      let message = '';

      switch (notification.type) {
        case '24_hours':
          title = `Webinar Reminder: ${webinar.title}`;
          message = `Don't forget! Your webinar "${webinar.title}" is tomorrow at ${new Date(webinar.scheduledDate).toLocaleString()}.`;
          break;

        case '1_hour':
          title = `Webinar Starting Soon: ${webinar.title}`;
          message = `Your webinar "${webinar.title}" starts in 1 hour! Get ready to join.`;
          break;

        case 'starting_now':
          title = `Webinar Starting Now: ${webinar.title}`;
          message = `Your webinar "${webinar.title}" is starting now! Join the session.`;
          break;

        case 'followup':
          title = `Webinar Follow-up: ${webinar.title}`;
          message = `Thank you for attending "${webinar.title}". The recording will be available soon.`;
          break;
      }

      return {
        title,
        message,
        type: `webinar_${notification.type}`,
        userId: user.id,
        webinarId: webinar.id,
      };
    });

    // Create user notifications
    if (userNotifications.length > 0) {
      await prisma.userNotification.createMany({
        data: userNotifications,
      });
    }

    // Update notification status
    await prisma.webinarNotification.update({
      where: { id: notification.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Process webinar notification error:', error);

    // Mark as failed
    await prisma.webinarNotification.update({
      where: { id: notification.id },
      data: {
        status: 'failed',
      },
    });
  }
}
