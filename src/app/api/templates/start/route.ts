import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

import {
  TemplateWorkflowProgress,
  IntelligenceUpdate as _IntelligenceUpdate,
} from '@/shared/types/json-fields';
import {
  createDefaultUserIntelligenceProfile,
  getUserIntelligenceProfile as _getUserIntelligenceProfile,
} from '@/features/profile/lib/user-intelligence-utils';
import {
  parseTemplateWorkflowProgress as _parseTemplateWorkflowProgress,
  calculateWorkflowProgress as _calculateWorkflowProgress,
  estimateTimeRemaining,
} from '@/shared/lib/template-system-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get the template with its steps
    const template = await prisma.project_templates.findUnique({
      where: { id: templateId },
      include: {
        project_steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 400 }
      );
    }

    // Check if user already has an active project for this template
    const existingProject = await prisma.user_projects.findFirst({
      where: {
        userId: session.user.id,
        templateId: templateId,
        status: 'ACTIVE',
      },
    });

    if (existingProject) {
      return NextResponse.json(
        {
          error: 'You already have an active project for this template',
          projectId: existingProject.id,
        },
        { status: 400 }
      );
    }

    // Get user's intelligence profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use default user intelligence profile for new projects
    const userIntelligence = createDefaultUserIntelligenceProfile();

    // Create initial workflow progress
    const initialProgress: TemplateWorkflowProgress = {
      templateId: template.id,
      currentStep: 1,
      totalSteps: template.project_steps.length,
      completedSteps: [],
      skippedSteps: [],
      stepProgress: {},
      overallProgress: 0,
      estimatedTimeRemaining: estimateTimeRemaining(
        1,
        template.project_steps.length,
        template.estimatedTime / template.project_steps.length,
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
    const userProject = await prisma.user_projects.create({
      data: {
        id: `project-${session.user.id}-${template.id}-${Date.now()}`,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      projectId: userProject.id,
      templateId: template.id,
      templateName: template.name,
      currentStep: 1,
      totalSteps: template.project_steps.length,
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
