import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '../../../../../lib/admin-auth';

import {
  safeJsonParse,
  safeJsonStringify,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            WebinarRSVP: true,
          },
        },
      },
    });

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    // Parse JSON fields with type safety
    const categoriesResult = safeJsonParse<WebinarCategories>(
      typeof webinar.categories === 'string' ? webinar.categories : JSON.stringify(webinar.categories),
      'categories'
    );
    if (!categoriesResult.success && categoriesResult.errors) {
      logValidationErrors(categoriesResult.errors, 'Webinar Categories');
    }
    if (categoriesResult.warnings) {
      logValidationWarnings(categoriesResult.warnings, 'Webinar Categories');
    }

    const guestSpeakersResult = parseGuestSpeakers(webinar.guestSpeakers);
    if (!guestSpeakersResult.success && guestSpeakersResult.errors) {
      logValidationErrors(guestSpeakersResult.errors, 'Guest Speakers');
    }
    if (guestSpeakersResult.warnings) {
      logValidationWarnings(guestSpeakersResult.warnings, 'Guest Speakers');
    }

    const materialsResult = safeJsonParse<WebinarMaterial[]>(
      typeof webinar.materials === 'string' ? webinar.materials : JSON.stringify(webinar.materials),
      'materials'
    );
    if (!materialsResult.success && materialsResult.errors) {
      logValidationErrors(materialsResult.errors, 'Webinar Materials');
    }
    if (materialsResult.warnings) {
      logValidationWarnings(materialsResult.warnings, 'Webinar Materials');
    }

    const formattedWebinar = {
      ...webinar,
      categories: categoriesResult.data || { primary: 'General' },
      guestSpeakers: guestSpeakersResult.data || [],
      materials: materialsResult.data || [],
      rsvpCount: webinar._count.WebinarRSVP,
    };

    return NextResponse.json(formattedWebinar);
  } catch (error) {
    console.error('Error fetching webinar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      scheduledDate,
      timezone = 'America/Los_Angeles',
      duration,
      thumbnailUrl,
      status = 'draft',
      guestSpeakers = [],
      materials = [],
      metaDescription,
      categories = [],
      maxAttendees = 100,
      registrationRequired = true,
      sendReminders = true,
    } = body;

    // Check if webinar exists
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id },
    });

    if (!existingWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    // Generate unique slug from title if title changed
    let uniqueSlug = existingWebinar.uniqueSlug;
    let slug = existingWebinar.slug;

    if (title !== existingWebinar.title) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      uniqueSlug = baseSlug + '-' + Date.now();
      slug = baseSlug;
    }

    const webinar = await prisma.webinar.update({
      where: { id },
      data: {
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        timezone,
        duration: parseInt(duration),
        thumbnailUrl,
        uniqueSlug,
        slug,
        status,
        metaDescription,
        maxAttendees: parseInt(maxAttendees),
        isPublished: status === 'published',
        categories: (() => {
          const result = safeJsonStringify(categories, 'categories');
          if (!result.success && result.errors) {
            logValidationErrors(result.errors, 'Webinar Categories Update');
            return JSON.stringify({ primary: 'General' });
          }
          return result.data || JSON.stringify({ primary: 'General' });
        })(),
        guestSpeakers: (() => {
          const result = safeJsonStringify(guestSpeakers, 'guestSpeakers');
          if (!result.success && result.errors) {
            logValidationErrors(result.errors, 'Guest Speakers Update');
            return JSON.stringify([]);
          }
          return result.data || JSON.stringify([]);
        })(),
        materials: (() => {
          const result = safeJsonStringify(materials, 'materials');
          if (!result.success && result.errors) {
            logValidationErrors(result.errors, 'Webinar Materials Update');
            return JSON.stringify([]);
          }
          return result.data || JSON.stringify([]);
        })(),
      },
    });

    return NextResponse.json(webinar, { status: 200 });
  } catch (error) {
    console.error('Error updating webinar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Check if webinar exists
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id },
    });

    if (!existingWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    await prisma.webinar.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Webinar deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting webinar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
