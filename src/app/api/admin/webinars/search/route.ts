import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAdminFromRequest } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'scheduledDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build search conditions
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    // Add date range filter
    if (dateFrom || dateTo) {
      whereConditions.scheduledDate = {};
      if (dateFrom) {
        whereConditions.scheduledDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.scheduledDate.lte = new Date(dateTo);
      }
    }

    // Build sort conditions
    const orderBy: any = {};
    if (sortBy === 'rsvpCount') {
      orderBy.rsvps = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get webinars with filtering
    const webinars = await prisma.webinar.findMany({
      where: whereConditions,
      include: {
        rsvps: {
          select: {
            id: true,
          },
        },
        adminUser: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
      orderBy,
    });

    // Transform data for frontend
    const transformedWebinars = webinars.map(webinar => ({
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      scheduledDate: webinar.scheduledDate,
      timezone: webinar.timezone,
      duration: webinar.duration,
      thumbnailUrl: webinar.thumbnailUrl,
      uniqueSlug: webinar.uniqueSlug,
      status: webinar.status,
      createdAt: webinar.createdAt,
      rsvpCount: webinar._count.rsvps,
      createdBy: webinar.adminUser?.username || 'Unknown',
    }));

    return NextResponse.json({
      webinars: transformedWebinars,
      total: transformedWebinars.length,
    });
  } catch (error) {
    console.error('Webinar search API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search webinars',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
