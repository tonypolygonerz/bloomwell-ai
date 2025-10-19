import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

import { EmailService } from '@/shared/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the webinar
    const webinar = await prisma.webinar.findFirst({
      where: {
        OR: [
          { slug: slug },
          { uniqueSlug: slug }, // Fallback for existing webinars
        ],
        status: {
          in: ['published', 'live'], // Only allow RSVPs for published/live webinars
        },
      },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found or not available for RSVP' },
        { status: 404 }
      );
    }

    // Check if user already RSVPed
    const existingRSVP = await prisma.webinarRSVP.findUnique({
      where: {
        webinarId_userId: {
          webinarId: webinar.id,
          userId: session.user.id,
        },
      },
    });

    if (existingRSVP) {
      return NextResponse.json(
        { error: 'You have already RSVPed for this webinar' },
        { status: 400 }
      );
    }

    // Create RSVP
    const rsvp = await prisma.webinarRSVP.create({
      data: {
        id: `rsvp-${webinar.id}-${session.user.id}-${Date.now()}`,
        webinarId: webinar.id,
        userId: session.user.id,
      },
    });

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { Organization: true },
    });

    if (user) {
      // Send confirmation email
      const calendarInvite = EmailService.generateCalendarInvite({
        title: webinar.title,
        description: webinar.description,
        scheduledDate: webinar.scheduledDate.toISOString(),
        duration: webinar.duration,
        jitsiRoomUrl: webinar.jitsiRoomUrl || undefined,
      });

      await EmailService.sendRSVPConfirmation({
        userName: user.name || user.email,
        webinarTitle: webinar.title,
        webinarDate: webinar.scheduledDate.toISOString(),
        joinUrl: `${process.env.NEXTAUTH_URL}/webinar/${webinar.slug || webinar.uniqueSlug}`,
        calendarInvite,
      });
    }

    return NextResponse.json(
      { message: 'Successfully RSVPed for webinar', rsvp },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
