import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ hasRSVPed: false });
    }

    // Find the webinar
    const webinar = await prisma.webinar.findFirst({
      where: {
        OR: [{ slug: slug }, { uniqueSlug: slug }],
      },
    });

    if (!webinar) {
      return NextResponse.json({ hasRSVPed: false });
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

    return NextResponse.json({ hasRSVPed: !!existingRSVP });
  } catch (error) {
    console.error('Error checking RSVP status:', error);
    return NextResponse.json({ hasRSVPed: false });
  }
}

