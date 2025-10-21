import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { getAdminFromRequest } from '@/lib/admin-auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''

    // Build where conditions
    const whereConditions: any = {
      isActive: true
    }

    if (type) {
      whereConditions.type = type
    }

    // Get notification templates
    const templates = await prisma.notificationTemplate.findMany({
      where: whereConditions,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(templates)

  } catch (error) {
    console.error('Notification templates API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch templates' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, content, type } = body

    // Validate required fields
    if (!name || !subject || !content || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create notification template
    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        subject,
        content,
        type
      }
    })

    return NextResponse.json(template)

  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ 
      error: 'Failed to create template' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
