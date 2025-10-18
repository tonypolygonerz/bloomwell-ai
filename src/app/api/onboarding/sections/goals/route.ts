import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch goals section data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: { id: session.user.organizationId || '' },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fundingGoals: organization.fundingGoals || [],
      seekingAmount: organization.seekingAmount,
      timeline: organization.timeline,
    });
  } catch (error) {
    console.error('Error fetching goals section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals section' },
      { status: 500 }
    );
  }
}

// PUT - Update goals section data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fundingGoals, seekingAmount, timeline } = body;

    if (!session.user.organizationId) {
      return NextResponse.json(
        { error: 'No organization associated with user' },
        { status: 400 }
      );
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        fundingGoals: fundingGoals || [],
        seekingAmount,
        timeline,
      },
    });

    // Calculate section score (0-100)
    let score = 0;
    if (fundingGoals && Array.isArray(fundingGoals) && fundingGoals.length > 0) {
      score += 40;
    }
    if (seekingAmount) score += 30;
    if (timeline) score += 30;

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      sectionScore: score,
      isComplete: score >= 70,
    });
  } catch (error) {
    console.error('Error updating goals section:', error);
    return NextResponse.json(
      { error: 'Failed to update goals section' },
      { status: 500 }
    );
  }
}


