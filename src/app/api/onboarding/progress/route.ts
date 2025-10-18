import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-config';
import { prisma } from '@/lib/prisma';

// GET - Fetch current user's onboarding progress (optimized)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create onboarding progress with minimal data selection
    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: session.user.id },
      select: {
        completedSections: true,
        sectionScores: true,
        overallScore: true,
        lastActiveDate: true,
        completedAt: true,
      },
    });

    // Initialize if doesn't exist
    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: {
          userId: session.user.id,
          completedSections: [],
          sectionScores: {},
          overallScore: 0,
        },
        select: {
          completedSections: true,
          sectionScores: true,
          overallScore: true,
          lastActiveDate: true,
          completedAt: true,
        },
      });
    }

    // Parse JSON fields efficiently (only once)
    const completedSections = Array.isArray(progress.completedSections) 
      ? progress.completedSections 
      : JSON.parse(progress.completedSections as string || '[]');
    
    const sectionScores = typeof progress.sectionScores === 'object' 
      ? progress.sectionScores 
      : JSON.parse(progress.sectionScores as string || '{}');

    return NextResponse.json({
      progress: {
        completedSections,
        sectionScores,
        overallScore: progress.overallScore,
        lastActiveDate: progress.lastActiveDate,
        completedAt: progress.completedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    );
  }
}

// PUT - Update onboarding progress for a section
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sectionName, sectionScore, isComplete } = body;

    if (!sectionName || typeof sectionScore !== 'number') {
      return NextResponse.json(
        { error: 'sectionName and sectionScore are required' },
        { status: 400 }
      );
    }

    // Get current progress
    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: session.user.id },
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: {
          userId: session.user.id,
          completedSections: [],
          sectionScores: {},
          overallScore: 0,
        },
      });
    }

    // Parse JSON fields
    const completedSections =
      typeof progress.completedSections === 'string'
        ? JSON.parse(progress.completedSections as string)
        : progress.completedSections || [];
    const sectionScores =
      typeof progress.sectionScores === 'string'
        ? JSON.parse(progress.sectionScores as string)
        : progress.sectionScores || {};

    // Update section score
    sectionScores[sectionName] = sectionScore;

    // Update completed sections list
    if (isComplete && !completedSections.includes(sectionName)) {
      completedSections.push(sectionName);
    } else if (!isComplete && completedSections.includes(sectionName)) {
      const index = completedSections.indexOf(sectionName);
      completedSections.splice(index, 1);
    }

    // Calculate overall score
    const allSections = [
      'basics',
      'programs',
      'team',
      'budget',
      'funding',
      'goals',
      'story',
      'communication',
    ];
    const totalScore = allSections.reduce(
      (sum, section) => sum + (sectionScores[section] || 0),
      0
    );
    const overallScore = Math.round(totalScore / allSections.length);

    // Check if fully complete
    const isFullyComplete = overallScore === 100;

    // Update progress
    const updatedProgress = await prisma.onboardingProgress.update({
      where: { userId: session.user.id },
      data: {
        completedSections,
        sectionScores,
        overallScore,
        lastActiveDate: new Date(),
        completedAt: isFullyComplete ? new Date() : null,
      },
    });

    // Update organization profileCompleteness
    if (session.user.organizationId) {
      await prisma.organization.update({
        where: { id: session.user.organizationId },
        data: { profileCompleteness: overallScore },
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        ...updatedProgress,
        completedSections,
        sectionScores,
      },
    });
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}
