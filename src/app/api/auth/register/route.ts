import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

type RegistrationData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organization: {
    name: string;
    ein?: string;
    city?: string;
    state?: string;
    organizationType?: string;
    has501c3Status?: boolean;
    operatingRevenue?: string;
    grantHistory?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json();
    const { name, email, password, phone, organization } = data;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!organization?.name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email address' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Calculate trial dates (14 days from now)
    const trialStartDate = new Date();
    const trialEndDate = new Date(
      trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000
    );

    // Determine budget range based on operating revenue
    let budget = 'UNDER_500K';
    if (organization.operatingRevenue) {
      if (organization.operatingRevenue.includes('$1M-$5M')) {
        budget = '1M_TO_5M';
      } else if (organization.operatingRevenue.includes('$5M-$10M')) {
        budget = '5M_TO_10M';
      } else if (organization.operatingRevenue.includes('>$10M')) {
        budget = 'OVER_10M';
      } else if (organization.operatingRevenue.includes('$500K-$1M')) {
        budget = '500K_TO_1M';
      }
    }

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          id: randomUUID(),
          name: organization.name,
          ein: organization.ein || null,
          state: organization.state || null,
          organizationType: organization.organizationType || 'nonprofit',
          budget,
          mission: null,
          staffSize: null,
          focusAreas: organization.grantHistory || null, // Store grant history temporarily
          isVerified: !!organization.ein, // Mark as verified if we have EIN
          updatedAt: new Date(),
        },
      });

      // Create user linked to organization
      const user = await tx.user.create({
        data: {
          id: randomUUID(),
          name,
          email,
          password: hashedPassword,
          organizationId: org.id,
          trialStartDate,
          trialEndDate,
          subscriptionStatus: 'TRIAL',
          updatedAt: new Date(),
        },
      });

      return { user, organization: org };
    });

    // Send verification email
    try {
      const verificationToken = randomUUID();
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Return success (don't send sensitive data)
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          organizationId: result.organization.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
