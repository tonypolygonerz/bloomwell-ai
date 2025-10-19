import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth/api/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch story section data
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
      successStory: organization.successStory,
      problemSolving: organization.problemSolving,
      beneficiaries: organization.beneficiaries,
      dreamScenario: organization.dreamScenario,
    });
  } catch (error) {
    console.error('Error fetching story section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story section' },
      { status: 500 }
    );
  }
}

// PUT - Update story section data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { successStory, problemSolving, beneficiaries, dreamScenario } = body;

    if (!session.user.organizationId) {
      return NextResponse.json(
        { error: 'No organization associated with user' },
        { status: 400 }
      );
    }

    await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        successStory,
        problemSolving,
        beneficiaries,
        dreamScenario,
      },
    });

    // Calculate section score
    let score = 0;
    if (successStory && successStory.length > 50) score += 25;
    if (problemSolving && problemSolving.length > 50) score += 25;
    if (beneficiaries && beneficiaries.length > 50) score += 25;
    if (dreamScenario && dreamScenario.length > 50) score += 25;

    return NextResponse.json({
      success: true,
      sectionScore: score,
      isComplete: score === 100,
    });
  } catch (error) {
    console.error('Error updating story section:', error);
    return NextResponse.json(
      { error: 'Failed to update story section' },
      { status: 500 }
    );
  }
}
