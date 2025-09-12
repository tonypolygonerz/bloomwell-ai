import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params
    const session = await getServerSession()

    const webinar = await prisma.webinar.findUnique({
      where: {
        uniqueSlug: slug,
        status: {
          in: ['published', 'live', 'completed'] // Only show published webinars publicly
        }
      },
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

    let hasRSVPed = false
    if (session?.user?.id) {
      const rsvp = await prisma.webinarRSVP.findUnique({
        where: {
          webinarId_userId: {
            webinarId: webinar.id,
            userId: session.user.id
          }
        }
      })
      hasRSVPed = !!rsvp
    }

    const formattedWebinar = {
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      scheduledDate: webinar.scheduledDate.toISOString(),
      timezone: webinar.timezone,
      duration: webinar.duration,
      thumbnailUrl: webinar.thumbnailUrl,
      uniqueSlug: webinar.uniqueSlug,
      status: webinar.status,
      rsvpCount: webinar._count.rsvps,
      hasRSVPed
    }

    return NextResponse.json(formattedWebinar)
  } catch (error) {
    console.error('Error fetching webinar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

