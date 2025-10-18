import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch team section data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: { id: session.user.organizationId || '' },
      include: { teamMembers: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fullTimeStaff: organization.fullTimeStaff || 0,
      partTimeStaff: organization.partTimeStaff || 0,
      contractors: organization.contractors || 0,
      volunteers: organization.volunteers || 0,
      boardSize: organization.boardSize || 0,
      teamMembers: organization.teamMembers,
    });
  } catch (error) {
    console.error('Error fetching team section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team section' },
      { status: 500 }
    );
  }
}

// PUT - Update team section data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullTimeStaff, partTimeStaff, contractors, volunteers, boardSize } =
      body;

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
        fullTimeStaff: fullTimeStaff || 0,
        partTimeStaff: partTimeStaff || 0,
        contractors: contractors || 0,
        volunteers: volunteers || 0,
        boardSize: boardSize || 0,
      },
    });

    // Calculate section score (0-100)
    let score = 0;
    if (fullTimeStaff !== undefined && fullTimeStaff !== null) score += 40;
    if (volunteers !== undefined && volunteers !== null) score += 40;
    if (boardSize !== undefined && boardSize !== null) score += 20;

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      sectionScore: score,
      isComplete: score >= 80,
    });
  } catch (error) {
    console.error('Error updating team section:', error);
    return NextResponse.json(
      { error: 'Failed to update team section' },
      { status: 500 }
    );
  }
}

// POST - Add team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, title, type } = body;

    if (!session.user.organizationId) {
      return NextResponse.json(
        { error: 'No organization associated with user' },
        { status: 400 }
      );
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        title,
        type: type || 'staff',
      },
    });

    return NextResponse.json({ success: true, teamMember });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

// DELETE - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
