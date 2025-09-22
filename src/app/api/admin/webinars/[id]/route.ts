import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAdminFromRequest } from '../../../../../lib/admin-auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const { id } = await params
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rsvps: true
          }
        }
      }
    })

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 })
    }

    // Parse JSON fields
    const formattedWebinar = {
      ...webinar,
      categories: webinar.categories ? JSON.parse(webinar.categories) : [],
      guestSpeakers: webinar.guestSpeakers ? JSON.parse(webinar.guestSpeakers) : [],
      materials: webinar.materials ? JSON.parse(webinar.materials) : [],
      rsvpCount: webinar._count.rsvps
    }

    return NextResponse.json(formattedWebinar)
  } catch (error) {
    console.error('Error fetching webinar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
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
      sendReminders = true
    } = body

    // Check if webinar exists
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id }
    })

    if (!existingWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 })
    }

    // Generate unique slug from title if title changed
    let uniqueSlug = existingWebinar.uniqueSlug
    let slug = existingWebinar.slug
    
    if (title !== existingWebinar.title) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      uniqueSlug = baseSlug + '-' + Date.now()
      slug = baseSlug
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
        categories: JSON.stringify(categories),
        guestSpeakers: JSON.stringify(guestSpeakers),
        materials: JSON.stringify(materials)
      }
    })

    return NextResponse.json(webinar, { status: 200 })
  } catch (error) {
    console.error('Error updating webinar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const { id } = await params
    // Check if webinar exists
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id }
    })

    if (!existingWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 })
    }

    await prisma.webinar.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Webinar deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting webinar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}