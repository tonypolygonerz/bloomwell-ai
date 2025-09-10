import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      organization: user.organization,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, mission, budget, staffSize, focusAreas } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let organization

    if (user.organization) {
      // Update existing organization
      organization = await prisma.organization.update({
        where: { id: user.organization.id },
        data: {
          name,
          mission: mission || null,
          budget: budget || null,
          staffSize: staffSize || null,
          focusAreas: focusAreas || null,
        }
      })
    } else {
      // Create new organization
      organization = await prisma.organization.create({
        data: {
          name,
          mission: mission || null,
          budget: budget || null,
          staffSize: staffSize || null,
          focusAreas: focusAreas || null,
        }
      })

      // Link organization to user
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id }
      })
    }

    return NextResponse.json({ 
      message: 'Organization profile saved successfully',
      organization 
    })
  } catch (error) {
    console.error('Error saving organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


