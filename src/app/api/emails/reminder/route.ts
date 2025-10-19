import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { EmailService } from '@/shared/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { webinarId, reminderType } = await request.json();

    if (!webinarId || !reminderType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get webinar with RSVPs
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
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    // Send reminder emails to all RSVPs
    const emailPromises = webinar.WebinarRSVP.map(
      async (rsvp: { User: { name?: string; email: string } }) => {
        const timeUntilEvent = getTimeUntilEvent(webinar.scheduledDate);

        return EmailService.sendReminderEmail(
          {
            userName: rsvp.User.name || rsvp.User.email,
            webinarTitle: webinar.title,
            webinarDate: webinar.scheduledDate.toISOString(),
            joinUrl: `${process.env.NEXTAUTH_URL}/webinar/${webinar.slug || webinar.uniqueSlug}`,
            timeUntilEvent,
          },
          reminderType as '24h' | '1h' | '15m'
        );
      }
    );

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(Boolean).length;

    // Update reminder sent status for this webinar
    await prisma.webinarNotification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date(),
        Webinar: {
          connect: { id: webinar.id },
        },
        type: reminderType,
        scheduledAt: new Date(),
        sentAt: new Date(),
        status: 'sent',
      },
    });

    return NextResponse.json({
      message: `Reminder emails sent successfully`,
      sent: successCount,
      total: webinar.WebinarRSVP.length,
    });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTimeUntilEvent(scheduledDate: Date): string {
  const now = new Date();
  const eventDate = new Date(scheduledDate);
  const diffMs = eventDate.getTime() - now.getTime();

  if (diffMs < 0) return 'Past event';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  return 'Less than an hour';
}
