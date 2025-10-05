import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { 
  TemplateWorkflowProgress,
  IntelligenceUpdate 
} from '@/types/json-fields';
import { 
  createDefaultUserIntelligenceProfile,
  getUserIntelligenceProfile 
} from '@/lib/user-intelligence-utils';
import { 
  parseTemplateWorkflowProgress,
  calculateWorkflowProgress,
  estimateTimeRemaining 
} from '@/lib/template-system-utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get the template with its steps
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (!template.isActive) {
      return NextResponse.json({ error: 'Template is not active' }, { status: 400 });
    }

    // Check if user already has an active project for this template
    const existingProject = await prisma.userProject.findFirst({
      where: {
        userId: session.user.id,
        templateId: templateId,
        status: 'ACTIVE',
      },
    });

    if (existingProject) {
      return NextResponse.json({ 
        error: 'You already have an active project for this template',
        projectId: existingProject.id 
      }, { status: 400 });
    }

    // Get user's intelligence profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userIntelligence = getUserIntelligenceProfile(user.intelligenceProfile);
    if (!userIntelligence) {
      userIntelligence = createDefaultUserIntelligenceProfile();
    }

    // Create initial workflow progress
    const initialProgress: TemplateWorkflowProgress = {
      templateId: template.id,
      currentStep: 1,
      totalSteps: template.steps.length,
      completedSteps: [],
      skippedSteps: [],
      stepProgress: {},
      overallProgress: 0,
      estimatedTimeRemaining: estimateTimeRemaining(
        1,
        template.steps.length,
        template.estimatedTime / template.steps.length,
        {
          userProfile: userIntelligence,
          completedTemplates: [],
          inProgressTemplates: [],
          skillLevel: 'beginner',
          preferredCategories: [],
          timeAvailability: 'medium',
          learningStyle: 'guided',
          successRate: 0,
          averageCompletionTime: 0,
        }
      ),
      lastActiveAt: new Date(),
      intelligenceUpdates: [],
    };

    // Create the user project
    const userProject = await prisma.userProject.create({
      data: {
        userId: session.user.id,
        templateId: template.id,
        title: template.name,
        currentStep: 1,
        status: 'ACTIVE',
        progress: 0.0,
        startedAt: new Date(),
        lastActiveAt: new Date(),
        metadata: JSON.stringify({
          initialProgress,
          templateVersion: template.updatedAt,
        }),
        intelligenceProfile: JSON.stringify(userIntelligence),
      },
    });

    return NextResponse.json({
      projectId: userProject.id,
      templateId: template.id,
      templateName: template.name,
      currentStep: 1,
      totalSteps: template.steps.length,
      message: 'Template started successfully',
    });

  } catch (error) {
    console.error('Error starting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


