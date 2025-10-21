import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { getAdminFromRequest } from '../../../../lib/admin-auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const webinars = await prisma.webinar.findMany({
      include: {
        _count: {
          select: {
            rsvps: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedWebinars = webinars.map(webinar => ({
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      scheduledDate: webinar.scheduledDate.toISOString(),
      timezone: webinar.timezone,
      duration: webinar.duration,
      thumbnailUrl: webinar.thumbnailUrl,
      uniqueSlug: webinar.uniqueSlug,
      status: webinar.status,
      createdAt: webinar.createdAt.toISOString(),
      rsvpCount: webinar._count.rsvps
    }))

    return NextResponse.json(formattedWebinars)
  } catch (error) {
    console.error('Error fetching webinars:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      scheduledDate,
      timezone,
      duration,
      thumbnailUrl,
      status = 'draft'
    } = body

    // Generate unique slug from title
    const uniqueSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now()

    // Use the authenticated admin's ID
    const adminUserId = admin.id

    const webinar = await prisma.webinar.create({
      data: {
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        timezone,
        duration: parseInt(duration),
        thumbnailUrl,
        uniqueSlug,
        status,
        createdBy: adminUserId
      }
    })

    return NextResponse.json(webinar, { status: 201 })
  } catch (error) {
    console.error('Error creating webinar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
