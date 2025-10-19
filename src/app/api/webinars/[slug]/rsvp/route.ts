import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Find the webinar
    const webinar = await prisma.webinar.findUnique({
      where: {
        uniqueSlug: slug,
        status: {
          in: ['published', 'live'] // Only allow RSVPs for published/live webinars
        }
      }
    })

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found or not available for RSVP' }, { status: 404 })
    }

    // Check if user already RSVPed
    const existingRSVP = await prisma.webinarRSVP.findUnique({
      where: {
        webinarId_userId: {
          webinarId: webinar.id,
          userId: session.user.id
        }
      }
    })

    if (existingRSVP) {
      return NextResponse.json({ error: 'You have already RSVPed for this webinar' }, { status: 400 })
    }

    // Create RSVP
    const rsvp = await prisma.webinarRSVP.create({
      data: {
        webinarId: webinar.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Successfully RSVPed for webinar', rsvp }, { status: 201 })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

