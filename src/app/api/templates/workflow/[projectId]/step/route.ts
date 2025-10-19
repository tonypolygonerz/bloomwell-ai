import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

import {
  TemplateWorkflowState,
  TemplateStepResponse,
  IntelligenceUpdate as _IntelligenceUpdate,
} from '@/shared/types/json-fields';
import {
  getUserIntelligenceProfile,
  updateUserIntelligenceProfile as _updateUserIntelligenceProfile,
} from '@/features/profile/lib/user-intelligence-utils';
import {
  parseTemplateWorkflowProgress,
  parseTemplateStepResponse as _parseTemplateStepResponse,
  parseIntelligenceUpdate as _parseIntelligenceUpdate,
  updateUserIntelligenceFromResponse,
  calculateWorkflowProgress,
  estimateTimeRemaining,
} from '@/shared/lib/template-system-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const { stepId, response } = await request.json();

    if (!stepId || !response) {
      return NextResponse.json(
        { error: 'Step ID and response are required' },
        { status: 400 }
      );
    }

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
        template_responses: true,
      },
    });

    if (!userProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get the current step
    const currentStep = userProject.project_templates.project_steps.find(
      (step: unknown) => (step as { id: string }).id === stepId
    );
    if (!currentStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    // Check if this is the current step
    if (currentStep.stepNumber !== userProject.currentStep) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    // Parse current intelligence profile
    let currentIntelligence = getUserIntelligenceProfile(
      userProject.intelligenceProfile
    );
    if (!currentIntelligence) {
      currentIntelligence = {
        focusAreas: [],
        budgetRange: 'unknown',
        staffSize: 0,
        lastAnalysis: new Date(),
        preferences: {
          communicationStyle: 'formal',
          detailLevel: 'medium',
        },
        grantInterests: [],
        organizationType: 'nonprofit',
        expertiseLevel: 'beginner',
        fundingHistory: {
          totalGrants: 0,
          averageAward: 0,
          successRate: 0,
        },
      };
    }

    // Create step response
    const stepResponse: TemplateStepResponse = {
      stepId: currentStep.id,
      questionKey: currentStep.questionKey,
      rawAnswer: response,
      confidence: 0.8, // Default confidence, could be calculated based on response quality
      qualityScore: 0.8, // Default quality score, could be calculated based on response quality
      intelligenceInsights: {
        skillLevelIndicators: [],
        focusAreaSuggestions: [],
        capabilityAssessments: [],
        nextStepRecommendations: [],
      },
      metadata: {
        source: 'user',
        confidence: 0.8,
        reviewStatus: 'pending',
      },
      submittedAt: new Date(),
    };

    // Update user intelligence based on response
    const { intelligence: updatedIntelligence, updates: intelligenceUpdates } =
      updateUserIntelligenceFromResponse(
        currentIntelligence,
        stepResponse,
        currentStep
      );

    // Save the response to database
    const savedResponse = await prisma.template_responses.create({
      data: {
        id: `response-${userProject.id}-${currentStep.id}-${Date.now()}`,
        projectId: userProject.id,
        stepId: currentStep.id,
        rawAnswer: response,
        enhancedAnswer: stepResponse.enhancedAnswer,
        confidence: stepResponse.confidence,
        qualityScore: stepResponse.qualityScore,
        isComplete: true,
        submittedAt: new Date(),
        metadata: JSON.stringify(stepResponse.metadata),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update workflow progress
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

    // Mark current step as completed
    if (!progress.completedSteps.includes(currentStep.stepNumber)) {
      progress.completedSteps.push(currentStep.stepNumber);
    }

    // Update step progress
    progress.stepProgress[currentStep.id] = {
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      timeSpent: 5, // Default time spent, could be calculated
      attempts: 1,
      lastResponse: response,
    };

    // Move to next step
    const nextStepNumber = currentStep.stepNumber + 1;
    const nextStep = userProject.project_templates.project_steps.find(
      (step: unknown) =>
        (step as { stepNumber: number }).stepNumber === nextStepNumber
    );

    if (nextStep) {
      progress.currentStep = nextStepNumber;
      progress.stepProgress[nextStep.id] = {
        status: 'not_started',
        attempts: 0,
      };
    } else {
      // Workflow completed
      progress.currentStep = userProject.project_templates.project_steps.length;
    }

    // Update overall progress
    progress.overallProgress = calculateWorkflowProgress(
      progress.currentStep,
      progress.totalSteps,
      progress.completedSteps,
      progress.skippedSteps
    );

    // Update estimated time remaining
    progress.estimatedTimeRemaining = estimateTimeRemaining(
      progress.currentStep,
      progress.totalSteps,
      userProject.project_templates.estimatedTime / progress.totalSteps,
      {
        userProfile: updatedIntelligence,
        completedTemplates: [],
        inProgressTemplates: [],
        skillLevel: 'beginner',
        preferredCategories: [],
        timeAvailability: 'medium',
        learningStyle: 'guided',
        successRate: 0,
        averageCompletionTime: 0,
      }
    );

    progress.lastActiveAt = new Date();
    progress.intelligenceUpdates = [
      ...(progress.intelligenceUpdates || []),
      ...intelligenceUpdates,
    ];

    // Update user project
    const updatedProject = await prisma.user_projects.update({
      where: { id: projectId },
      data: {
        currentStep: progress.currentStep,
        progress: progress.overallProgress / 100,
        lastActiveAt: new Date(),
        metadata: JSON.stringify({
          ...metadata,
          initialProgress: progress,
        }),
        intelligenceProfile: JSON.stringify(updatedIntelligence),
        status: nextStep ? 'ACTIVE' : 'COMPLETED',
        completedAt: nextStep ? null : new Date(),
      },
    });

    // Update project's intelligence profile
    await prisma.user_projects.update({
      where: { id: updatedProject.id },
      data: {
        intelligenceProfile: JSON.stringify(updatedIntelligence),
      },
    });

    // Create updated workflow state
    const workflowState: TemplateWorkflowState = {
      projectId: updatedProject.id,
      templateId: updatedProject.templateId,
      userId: updatedProject.userId,
      status: updatedProject.status.toLowerCase() as 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned',
      progress,
      intelligenceProfile: updatedIntelligence,
      responses: [...userProject.template_responses, savedResponse].map(
        (response: unknown) => ({
          stepId: (response as { stepId: string }).stepId,
          questionKey: (response as { stepId: string }).stepId, // This should be mapped properly
          rawAnswer: (response as { rawAnswer: string }).rawAnswer,
          enhancedAnswer:
            (response as { enhancedAnswer?: string }).enhancedAnswer || undefined,
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
        })
      ),
      recommendations: [],
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    };

    return NextResponse.json({
      workflowState,
      nextStep: nextStep || null,
      intelligenceUpdates,
      message: nextStep
        ? 'Response submitted successfully'
        : 'Workflow completed!',
    });
  } catch (error) {
    console.error('Error submitting step response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
