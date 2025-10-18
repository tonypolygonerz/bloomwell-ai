import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return organization data for basics section
    const basicsData = {
      name: user.Organization?.name || '',
      organizationType: user.Organization?.organizationType || '',
      mission: user.Organization?.mission || '',
      state: user.Organization?.state || '',
      ein: user.Organization?.ein || '',
      focusAreas: user.Organization?.focusAreas || '',
    };

    return NextResponse.json(basicsData);
  } catch (error) {
    console.error('Error fetching basics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basics data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, organizationType, mission, state, ein, focusAreas } = body;

    // Ensure EIN is a string
    const einString = ein ? String(ein) : null;

    // Validate required fields
    if (!name || !organizationType) {
      return NextResponse.json(
        { error: 'Name and organization type are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create organization
    let organization;
    if (user.Organization) {
      organization = await prisma.organization.update({
        where: { id: user.Organization.id },
        data: {
          name,
          organizationType,
          mission,
          state,
          ein: einString,
          focusAreas,
        },
      });
    } else {
      organization = await prisma.organization.create({
        data: {
          id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date(),
          name,
          organizationType,
          mission,
          state,
          ein: einString,
          focusAreas,
        },
      });

      // Update user to link to organization
      await prisma.user.update({
        where: { id: user.id },
        data: {
          Organization: {
            connect: { id: organization.id },
          },
        },
      });
    }

    // Calculate section score
    const sectionScore = calculateBasicsScore({
      name,
      organizationType,
      mission,
      state,
      ein: einString || '',
      focusAreas,
    });

    const isComplete = sectionScore >= 80; // Consider complete if 80%+ filled

    return NextResponse.json({
      success: true,
      organization,
      sectionScore,
      isComplete,
    });
  } catch (error) {
    console.error('Error saving basics section:', error);
    return NextResponse.json(
      { error: 'Failed to save basics data' },
      { status: 500 }
    );
  }
}

function calculateBasicsScore(data: {
  name: string;
  organizationType: string;
  mission: string;
  state: string;
  ein: string;
  focusAreas: string;
}): number {
  let score = 0;
  const maxScore = 100;

  // Required fields (60 points)
  if (data.name) score += 15;
  if (data.organizationType) score += 15;
  if (data.state) score += 15;
  if (data.mission && data.mission.length >= 20) score += 15;

  // Optional but helpful fields (40 points)
  if (data.ein) score += 20;
  if (data.focusAreas) score += 20;

  return Math.min(score, maxScore);
}
