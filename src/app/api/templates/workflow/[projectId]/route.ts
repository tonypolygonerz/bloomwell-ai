import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

import {
  TemplateWorkflowState,
  TemplateStepResponse as _TemplateStepResponse,
  IntelligenceUpdate,
} from '@/shared/types/json-fields';
import {
  getUserIntelligenceProfile,
  updateUserIntelligenceProfile as _updateUserIntelligenceProfile,
} from '@/features/profile/lib/user-intelligence-utils';
import {
  parseTemplateWorkflowProgress,
  parseTemplateStepResponse,
  parseIntelligenceUpdate,
  updateUserIntelligenceFromResponse,
  calculateWorkflowProgress,
  estimateTimeRemaining,
} from '@/shared/lib/template-system-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Get user project with template and steps
    const userProject = await prisma.user_projects.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        project_templates: {
          include: {
            project_steps: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        template_responses: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!userProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse workflow progress from metadata
    const metadata = userProject.metadata
      ? JSON.parse(userProject.metadata as string)
      : {};
    const progressResult = parseTemplateWorkflowProgress(
      metadata.initialProgress
    );

    if (!progressResult.success) {
      return NextResponse.json(
        { error: 'Invalid workflow progress' },
        { status: 400 }
      );
    }

    const progress = progressResult.data!;

    // Get current step
    const currentStep = userProject.project_templates.project_steps.find(
      (step: any) => step.stepNumber === userProject.currentStep
    );

    if (!currentStep) {
      return NextResponse.json(
        { error: 'Current step not found' },
        { status: 404 }
      );
    }

    // Parse intelligence updates from progress
    const intelligenceUpdates: IntelligenceUpdate[] =
      progress.intelligenceUpdates || [];

    // Create workflow state
    const workflowState: TemplateWorkflowState = {
      projectId: userProject.id,
      templateId: userProject.project_templates.id,
      userId: userProject.userId,
      status: userProject.status.toLowerCase() as any,
      progress,
      intelligenceProfile:
        getUserIntelligenceProfile(userProject.intelligenceProfile) || {},
      responses: userProject.template_responses.map((response: any) => ({
        stepId: response.stepId,
        questionKey: response.stepId, // This should be mapped properly
        rawAnswer: response.rawAnswer,
        enhancedAnswer: response.enhancedAnswer || undefined,
        confidence: response.confidence || 0.5,
        qualityScore: response.qualityScore || 0.5,
        intelligenceInsights: {
          skillLevelIndicators: [],
          focusAreaSuggestions: [],
          capabilityAssessments: [],
          nextStepRecommendations: [],
        },
        metadata: response.metadata
          ? JSON.parse(response.metadata as string)
          : {},
        submittedAt: response.submittedAt,
      })),
      recommendations: [],
      createdAt: userProject.createdAt,
      updatedAt: userProject.updatedAt,
    };

    return NextResponse.json({
      workflowState,
      currentStep,
      intelligenceUpdates,
    });
  } catch (error) {
    console.error('Error fetching workflow state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
