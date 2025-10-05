import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { 
  UserIntelligence,
  IntelligenceUpdate,
  ValidationResult 
} from '@/types/json-fields';
import { 
  getUserIntelligenceProfile,
  updateUserIntelligenceProfile,
  createDefaultUserIntelligenceProfile,
  validateUserIntelligenceProfile 
} from '@/lib/user-intelligence-utils';
import { 
  parseIntelligenceUpdate
} from '@/lib/template-system-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with intelligence profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse user intelligence profile
    const intelligenceProfile = getUserIntelligenceProfile(user.intelligenceProfile);
    
    if (!intelligenceProfile) {
      // Create default profile if none exists
      const defaultProfile = createDefaultUserIntelligenceProfile();
      return NextResponse.json({
        intelligenceProfile: defaultProfile,
        isDefault: true,
        validation: validateUserIntelligenceProfile(defaultProfile),
      });
    }

    // Validate the profile
    const validation = validateUserIntelligenceProfile(intelligenceProfile);

    return NextResponse.json({
      intelligenceProfile,
      isDefault: false,
      validation,
    });

  } catch (error) {
    console.error('Error fetching user intelligence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intelligenceProfile, updates } = await request.json();

    if (!intelligenceProfile && !updates) {
      return NextResponse.json({ error: 'Intelligence profile or updates are required' }, { status: 400 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedIntelligence: UserIntelligence;
    const intelligenceUpdates: IntelligenceUpdate[] = [];

    if (intelligenceProfile) {
      // Full profile update - validate using user intelligence utils
      const validation = validateUserIntelligenceProfile(intelligenceProfile);
      
      if (!validation.isValid) {
        return NextResponse.json({ 
          error: 'Invalid intelligence profile',
          details: validation.errors 
        }, { status: 400 });
      }

      updatedIntelligence = intelligenceProfile;
    } else if (updates) {
      // Partial updates
      const currentIntelligence = getUserIntelligenceProfile(user.intelligenceProfile) || 
        createDefaultUserIntelligenceProfile();

      updatedIntelligence = { ...currentIntelligence };

      // Process each update
      for (const update of updates) {
        const updateValidation = parseIntelligenceUpdate(update);
        
        if (!updateValidation.success) {
          return NextResponse.json({ 
            error: 'Invalid intelligence update',
            details: updateValidation.errors 
          }, { status: 400 });
        }

        const validUpdate = updateValidation.data!;
        intelligenceUpdates.push(validUpdate);

        // Apply the update
        switch (validUpdate.field) {
          case 'focusAreas':
            updatedIntelligence.focusAreas = validUpdate.newValue;
            break;
          case 'budgetRange':
            updatedIntelligence.budgetRange = validUpdate.newValue;
            break;
          case 'staffSize':
            updatedIntelligence.staffSize = validUpdate.newValue;
            break;
          case 'organizationType':
            updatedIntelligence.organizationType = validUpdate.newValue;
            break;
          case 'expertiseLevel':
            updatedIntelligence.expertiseLevel = validUpdate.newValue;
            break;
          case 'grantInterests':
            updatedIntelligence.grantInterests = validUpdate.newValue;
            break;
          case 'preferences':
            updatedIntelligence.preferences = { ...updatedIntelligence.preferences, ...validUpdate.newValue };
            break;
          case 'fundingHistory':
            updatedIntelligence.fundingHistory = { ...updatedIntelligence.fundingHistory, ...validUpdate.newValue };
            break;
          default:
            // Handle custom fields
            (updatedIntelligence as any)[validUpdate.field] = validUpdate.newValue;
        }
      }

      // Update last analysis timestamp
      updatedIntelligence.lastAnalysis = new Date();
    } else {
      return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
    }

    // Validate the updated profile
    const validation = validateUserIntelligenceProfile(updatedIntelligence);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        intelligenceProfile: JSON.stringify(updatedIntelligence),
        updatedAt: new Date(),
      },
    });

    // Log intelligence updates for audit trail
    if (intelligenceUpdates.length > 0) {
      console.log(`User ${session.user.id} intelligence updates:`, intelligenceUpdates);
    }

    return NextResponse.json({
      intelligenceProfile: updatedIntelligence,
      validation,
      updates: intelligenceUpdates,
      message: 'Intelligence profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating user intelligence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { update } = await request.json();

    if (!update) {
      return NextResponse.json({ error: 'Update is required' }, { status: 400 });
    }

    // Validate the update
    const updateValidation = parseIntelligenceUpdate(update);
    
    if (!updateValidation.success) {
      return NextResponse.json({ 
        error: 'Invalid intelligence update',
        details: updateValidation.errors 
      }, { status: 400 });
    }

    const validUpdate = updateValidation.data!;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current intelligence profile
    const currentIntelligence = getUserIntelligenceProfile(user.intelligenceProfile) || 
      createDefaultUserIntelligenceProfile();

    // Apply the update
    const updatedIntelligence = { ...currentIntelligence };

    switch (validUpdate.field) {
      case 'focusAreas':
        updatedIntelligence.focusAreas = validUpdate.newValue;
        break;
      case 'budgetRange':
        updatedIntelligence.budgetRange = validUpdate.newValue;
        break;
      case 'staffSize':
        updatedIntelligence.staffSize = validUpdate.newValue;
        break;
      case 'organizationType':
        updatedIntelligence.organizationType = validUpdate.newValue;
        break;
      case 'expertiseLevel':
        updatedIntelligence.expertiseLevel = validUpdate.newValue;
        break;
      case 'grantInterests':
        updatedIntelligence.grantInterests = validUpdate.newValue;
        break;
      case 'preferences':
        updatedIntelligence.preferences = { ...updatedIntelligence.preferences, ...validUpdate.newValue };
        break;
      case 'fundingHistory':
        updatedIntelligence.fundingHistory = { ...updatedIntelligence.fundingHistory, ...validUpdate.newValue };
        break;
      default:
        // Handle custom fields
        (updatedIntelligence as any)[validUpdate.field] = validUpdate.newValue;
    }

    // Update last analysis timestamp
    updatedIntelligence.lastAnalysis = new Date();

    // Validate the updated profile
    const validation = validateUserIntelligenceProfile(updatedIntelligence);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        intelligenceProfile: JSON.stringify(updatedIntelligence),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      intelligenceProfile: updatedIntelligence,
      validation,
      update: validUpdate,
      message: 'Intelligence profile updated successfully',
    });

  } catch (error) {
    console.error('Error applying intelligence update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


