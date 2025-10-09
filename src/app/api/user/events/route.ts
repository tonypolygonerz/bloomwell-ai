import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
        webinar: {
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
        id: rsvp.webinar.id,
        title: rsvp.webinar.title,
        description: rsvp.webinar.description,
        scheduledDate: rsvp.webinar.scheduledDate.toISOString(),
        duration: rsvp.webinar.duration,
        slug: rsvp.webinar.slug || rsvp.webinar.uniqueSlug,
        jitsiRoomUrl: rsvp.webinar.jitsiRoomUrl,
        thumbnailUrl: rsvp.webinar.thumbnailUrl,
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
