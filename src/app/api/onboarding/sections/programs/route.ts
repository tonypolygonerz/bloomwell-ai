import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch programs section data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ programs: [] });
    }

    const programs = await prisma.program.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST - Create new program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      whoServed,
      location,
      frequency,
      peopleServed,
      goals,
      successMetrics,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Program name is required' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        description,
        whoServed,
        location,
        frequency,
        peopleServed,
        goals,
        successMetrics,
      },
    });

    // Calculate section score based on number and completeness of programs
    const allPrograms = await prisma.program.findMany({
      where: { organizationId: session.user.organizationId },
    });

    let score = 0;
    if (allPrograms.length >= 1) score += 40;
    if (allPrograms.length >= 2) score += 20;
    if (allPrograms.length >= 3) score += 20;

    // Bonus for detailed programs
    const detailedPrograms = allPrograms.filter(
      p =>
        p.description &&
        p.whoServed &&
        p.location &&
        p.frequency &&
        p.goals &&
        p.successMetrics
    );
    if (detailedPrograms.length >= 1) score += 20;

    return NextResponse.json({
      success: true,
      program,
      sectionScore: Math.min(score, 100),
      isComplete: score >= 80,
    });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}

// PUT - Update existing program
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      whoServed,
      location,
      frequency,
      peopleServed,
      goals,
      successMetrics,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    const program = await prisma.program.update({
      where: { id },
      data: {
        name,
        description,
        whoServed,
        location,
        frequency,
        peopleServed,
        goals,
        successMetrics,
      },
    });

    // Calculate section score
    const allPrograms = await prisma.program.findMany({
      where: { organizationId: session.user.organizationId },
    });

    let score = 0;
    if (allPrograms.length >= 1) score += 40;
    if (allPrograms.length >= 2) score += 20;
    if (allPrograms.length >= 3) score += 20;

    const detailedPrograms = allPrograms.filter(
      p =>
        p.description &&
        p.whoServed &&
        p.location &&
        p.frequency &&
        p.goals &&
        p.successMetrics
    );
    if (detailedPrograms.length >= 1) score += 20;

    return NextResponse.json({
      success: true,
      program,
      sectionScore: Math.min(score, 100),
      isComplete: score >= 80,
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE - Remove program
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
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
