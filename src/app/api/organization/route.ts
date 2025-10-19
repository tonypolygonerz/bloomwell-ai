import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/api/[...nextauth]/route';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      organizationType,
      mission,
      focusAreas,
      budget,
      staffSize,
      state,
      ein,
      isVerified,
    } = body;

    console.log('Received organization data:', {
      name,
      organizationType,
      mission,
      focusAreas,
      budget,
      staffSize,
      state,
      ein,
      einType: typeof ein,
      isVerified,
    });

    // Validate required fields
    if (!name || !organizationType || !budget || !staffSize || !state) {
      console.error('Missing required fields:', {
        hasName: !!name,
        hasOrgType: !!organizationType,
        hasBudget: !!budget,
        hasStaffSize: !!staffSize,
        hasState: !!state,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current user
    console.log('Looking up user with email:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Organization: true },
    });

    if (!user) {
      console.error('User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      hasOrganization: !!user.Organization,
    });

    // Check if user already has an organization
    if (user.organizationId && user.Organization) {
      console.log('User already has organization, updating instead');
      // Update existing organization
      const organization = await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          name,
          organizationType,
          mission: mission || null,
          focusAreas: focusAreas || null,
          budget,
          staffSize,
          state,
          ein: ein ? String(ein) : null,
          isVerified: isVerified || false,
          updatedAt: new Date(),
        },
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
          ein: organization.ein,
          isVerified: organization.isVerified,
        },
      });
    }

    // Create the organization
    console.log('Creating new organization with data:', {
      name,
      organizationType,
      budget,
      staffSize,
      state,
    });

    const organization = await prisma.organization.create({
      data: {
        id: randomUUID(),
        name,
        organizationType,
        mission: mission || null,
        focusAreas: focusAreas || null,
        budget,
        staffSize,
        state,
        ein: ein ? String(ein) : null,
        isVerified: isVerified || false,
        updatedAt: new Date(),
      },
    });

    console.log('Organization created successfully:', organization.id);

    // Link the organization to the user
    console.log('Linking organization to user');
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    console.log('User updated successfully');

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
        ein: organization.ein,
        isVerified: organization.isVerified,
      },
    });
  } catch (error) {
    console.error('Organization creation error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'Failed to create organization',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
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
      organization: user.Organization,
    });
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
