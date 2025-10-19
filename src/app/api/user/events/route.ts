import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's RSVPs with webinar details
    const rsvps = await prisma.webinarRSVP.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        Webinar: {
          select: {
            id: true,
            title: true,
            description: true,
            scheduledDate: true,
            duration: true,
            slug: true,
            uniqueSlug: true,
            jitsiRoomUrl: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        rsvpDate: 'desc',
      },
    });

    // Format the response
    const formattedRSVPs = rsvps.map(rsvp => ({
      id: rsvp.id,
      rsvpDate: rsvp.rsvpDate.toISOString(),
      webinar: {
        id: rsvp.Webinar.id,
        title: rsvp.Webinar.title,
        description: rsvp.Webinar.description,
        scheduledDate: rsvp.Webinar.scheduledDate.toISOString(),
        duration: rsvp.Webinar.duration,
        slug: rsvp.Webinar.slug || rsvp.Webinar.uniqueSlug,
        jitsiRoomUrl: rsvp.Webinar.jitsiRoomUrl,
        thumbnailUrl: rsvp.Webinar.thumbnailUrl,
      },
    }));

    return NextResponse.json({
      rsvps: formattedRSVPs,
      total: formattedRSVPs.length,
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
