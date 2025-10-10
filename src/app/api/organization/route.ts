import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      organizationType,
      mission,
      focusAreas,
      budget,
      staffSize,
      state,
    } = await request.json();

    // Validate required fields
    if (!name || !organizationType || !budget || !staffSize || !state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the organization
    const organization = await prisma.organization.create({
      data: {
        name,
        organizationType,
        mission: mission || null,
        focusAreas: focusAreas || null,
        budget,
        staffSize,
        state,
      },
    });

    // Link the organization to the user
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        organizationType: organization.organizationType,
        mission: organization.mission,
        focusAreas: organization.focusAreas,
        budget: organization.budget,
        staffSize: organization.staffSize,
        state: organization.state,
      },
    });
  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      organization: user.organization,
    });
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
