import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      status: 'published',
      isPublished: true,
    };

    // Add category filter if provided
    if (category && category !== 'All') {
      where.categories = {
        contains: category,
      };
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Fetch webinars
    const [webinars, total] = await Promise.all([
      prisma.webinar.findMany({
        where,
        include: {
          _count: {
            select: {
              rsvps: true,
            },
          },
        },
        orderBy: {
          scheduledDate: 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.webinar.count({ where }),
    ]);

    // Format webinars for public consumption
    const formattedWebinars = webinars.map(webinar => ({
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      scheduledDate: webinar.scheduledDate.toISOString(),
      timezone: webinar.timezone,
      duration: webinar.duration,
      thumbnailUrl: webinar.thumbnailUrl,
      slug: webinar.slug || webinar.uniqueSlug, // Use new slug field, fallback to uniqueSlug
      status: webinar.status,
      rsvpCount: webinar._count.rsvps,
      maxAttendees: webinar.maxAttendees,
      categories: webinar.categories ? JSON.parse(webinar.categories) : [],
      guestSpeakers: webinar.guestSpeakers
        ? JSON.parse(webinar.guestSpeakers)
        : [],
      materials: webinar.materials ? JSON.parse(webinar.materials) : [],
      jitsiRoomUrl: webinar.jitsiRoomUrl,
      metaDescription: webinar.metaDescription,
      socialImageUrl: webinar.socialImageUrl,
    }));

    return NextResponse.json({
      webinars: formattedWebinars,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
