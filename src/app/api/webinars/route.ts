import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  safeJsonParse,
  parseWebinarCategories,
  parseGuestSpeakers,
  logValidationErrors,
  logValidationWarnings,
} from '@/lib/json-field-utils';
import {
  WebinarCategories,
  GuestSpeaker,
  WebinarMaterial,
} from '@/types/json-fields';

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
              WebinarRSVP: true,
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
      rsvpCount: webinar._count.WebinarRSVP,
      maxAttendees: webinar.maxAttendees,
      categories: (() => {
        const result = safeJsonParse<WebinarCategories>(
          typeof webinar.categories === 'string'
            ? webinar.categories
            : JSON.stringify(webinar.categories),
          'categories'
        );
        if (!result.success && result.errors) {
          logValidationErrors(result.errors, 'Webinar Categories');
        }
        if (result.warnings) {
          logValidationWarnings(result.warnings, 'Webinar Categories');
        }
        return result.data || { primary: 'General' };
      })(),
      guestSpeakers: (() => {
        const result = parseGuestSpeakers(webinar.guestSpeakers);
        if (!result.success && result.errors) {
          logValidationErrors(result.errors, 'Guest Speakers');
        }
        if (result.warnings) {
          logValidationWarnings(result.warnings, 'Guest Speakers');
        }
        return result.data || [];
      })(),
      materials: (() => {
        const result = safeJsonParse<WebinarMaterial[]>(
          typeof webinar.materials === 'string'
            ? webinar.materials
            : JSON.stringify(webinar.materials),
          'materials'
        );
        if (!result.success && result.errors) {
          logValidationErrors(result.errors, 'Webinar Materials');
        }
        if (result.warnings) {
          logValidationWarnings(result.warnings, 'Webinar Materials');
        }
        return result.data || [];
      })(),
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
