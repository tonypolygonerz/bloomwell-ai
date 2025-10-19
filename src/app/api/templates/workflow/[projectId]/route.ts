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
  parseTemplateStepResponse as _parseTemplateStepResponse,
  parseIntelligenceUpdate as _parseIntelligenceUpdate,
  updateUserIntelligenceFromResponse as _updateUserIntelligenceFromResponse,
  calculateWorkflowProgress as _calculateWorkflowProgress,
  estimateTimeRemaining as _estimateTimeRemaining,
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
      (step: unknown) => (step as { stepNumber: number }).stepNumber === userProject.currentStep
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
      status: userProject.status.toLowerCase() as unknown,
      progress,
      intelligenceProfile:
        getUserIntelligenceProfile(userProject.intelligenceProfile) || {},
      responses: userProject.template_responses.map((response: unknown) => ({
        stepId: (response as { stepId: string }).stepId,
        questionKey: (response as { stepId: string }).stepId, // This should be mapped properly
        rawAnswer: (response as { rawAnswer: string }).rawAnswer,
        enhancedAnswer: (response as { enhancedAnswer?: string }).enhancedAnswer || undefined,
        confidence: (response as { confidence?: number }).confidence || 0.5,
        qualityScore: (response as { qualityScore?: number }).qualityScore || 0.5,
        intelligenceInsights: {
          skillLevelIndicators: [],
          focusAreaSuggestions: [],
          capabilityAssessments: [],
          nextStepRecommendations: [],
        },
        metadata: (response as { metadata?: string }).metadata
          ? JSON.parse((response as { metadata: string }).metadata as string)
          : {},
        submittedAt: (response as { submittedAt: Date }).submittedAt,
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
