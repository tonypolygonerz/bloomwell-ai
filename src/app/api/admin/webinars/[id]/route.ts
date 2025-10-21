import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { getAdminFromRequest } from '@/lib/admin-auth'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: webinarId } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'live', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update webinar status
    const updatedWebinar = await prisma.webinar.update({
      where: { id: webinarId },
      data: { status },
      include: {
        rsvps: true
      }
    })

    return NextResponse.json(updatedWebinar)

  } catch (error) {
    console.error('Webinar update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update webinar' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: webinarId } = await params

    // Delete webinar (RSVPs will be cascade deleted due to schema)
    await prisma.webinar.delete({
      where: { id: webinarId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webinar delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete webinar' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
