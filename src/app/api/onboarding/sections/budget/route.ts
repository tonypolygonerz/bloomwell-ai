import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth/api/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch budget section data
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
      budget: organization.budget,
      budgetPriorities: organization.budgetPriorities || [],
    });
  } catch (error) {
    console.error('Error fetching budget section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget section' },
      { status: 500 }
    );
  }
}

// PUT - Update budget section data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { budget, budgetPriorities } = body;

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
        budget,
        budgetPriorities: budgetPriorities || [],
      },
    });

    // Calculate section score (0-100)
    let score = 0;
    if (budget) score += 60;
    if (
      budgetPriorities &&
      Array.isArray(budgetPriorities) &&
      budgetPriorities.length > 0
    ) {
      score += 40;
    }

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      sectionScore: score,
      isComplete: score >= 60,
    });
  } catch (error) {
    console.error('Error updating budget section:', error);
    return NextResponse.json(
      { error: 'Failed to update budget section' },
      { status: 500 }
    );
  }
}
