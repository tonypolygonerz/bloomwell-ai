import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        trialStartDate: true,
        trialEndDate: true,
        subscriptionStatus: true,
        subscriptionType: true,
        lastActiveDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate trial status
    const now = new Date();
    const trialStart = user.trialStartDate || user.createdAt;
    const trialEnd =
      user.trialEndDate ||
      new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days default

    const isTrialActive = user.subscriptionStatus === 'TRIAL' && now < trialEnd;
    const daysRemaining = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      trial: {
        isActive: isTrialActive,
        daysRemaining,
        trialStart: trialStart.toISOString(),
        trialEnd: trialEnd.toISOString(),
        subscriptionStatus: user.subscriptionStatus,
        subscriptionType: user.subscriptionType,
      },
      hasActiveSubscription: user.subscriptionStatus === 'ACTIVE',
      lastActiveDate: user.lastActiveDate?.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
