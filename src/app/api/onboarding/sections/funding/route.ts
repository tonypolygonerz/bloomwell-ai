import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch funding history data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.organizationId) {
      return NextResponse.json({
        fundingHistory: [],
        hasReceivedGrants: null,
      });
    }

    const organization = await prisma.organization.findFirst({
      where: { id: session.user.organizationId },
    });

    const fundingHistory = await prisma.fundingHistory.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({
      fundingHistory,
      hasReceivedGrants: organization?.hasReceivedGrants,
    });
  } catch (error) {
    console.error('Error fetching funding history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding history' },
      { status: 500 }
    );
  }
}

// POST - Create funding history entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      funderName,
      amount,
      year,
      purpose,
      status,
      notes,
      hasReceivedGrants,
    } = body;

    // Update hasReceivedGrants flag if provided
    if (hasReceivedGrants !== undefined) {
      await prisma.organization.update({
        where: { id: session.user.organizationId },
        data: { hasReceivedGrants },
      });

      // If they haven't received grants, don't require entries
      if (!hasReceivedGrants) {
        return NextResponse.json({
          success: true,
          sectionScore: 100,
          isComplete: true,
        });
      }
    }

    if (!funderName || !type) {
      return NextResponse.json(
        { error: 'Funder name and type are required' },
        { status: 400 }
      );
    }

    const fundingEntry = await prisma.fundingHistory.create({
      data: {
        organizationId: session.user.organizationId,
        type,
        funderName,
        amount: amount ? parseFloat(amount) : null,
        year,
        purpose,
        status,
        notes,
      },
    });

    // Calculate score
    const allEntries = await prisma.fundingHistory.findMany({
      where: { organizationId: session.user.organizationId },
    });

    let score = 30; // Base score for having entries
    if (allEntries.length >= 2) score += 20;
    if (allEntries.length >= 3) score += 20;

    // Bonus for detailed entries
    const detailedEntries = allEntries.filter(
      e => e.amount && e.year && e.purpose
    );
    if (detailedEntries.length >= 1) score += 30;

    return NextResponse.json({
      success: true,
      fundingEntry,
      sectionScore: Math.min(score, 100),
      isComplete: score >= 80,
    });
  } catch (error) {
    console.error('Error creating funding entry:', error);
    return NextResponse.json(
      { error: 'Failed to create funding entry' },
      { status: 500 }
    );
  }
}

// PUT - Update funding history entry
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, funderName, amount, year, purpose, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Funding entry ID is required' },
        { status: 400 }
      );
    }

    const fundingEntry = await prisma.fundingHistory.update({
      where: { id },
      data: {
        type,
        funderName,
        amount: amount ? parseFloat(amount) : null,
        year,
        purpose,
        status,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      fundingEntry,
    });
  } catch (error) {
    console.error('Error updating funding entry:', error);
    return NextResponse.json(
      { error: 'Failed to update funding entry' },
      { status: 500 }
    );
  }
}

// DELETE - Remove funding history entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Funding entry ID is required' },
        { status: 400 }
      );
    }

    await prisma.fundingHistory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting funding entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete funding entry' },
      { status: 500 }
    );
  }
}
