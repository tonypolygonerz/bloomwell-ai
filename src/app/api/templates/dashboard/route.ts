import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import {
  TemplateDashboardData,
  TemplateSelectionIntelligence,
  UserIntelligence,
} from '@/types/json-fields';
import {
  getUserIntelligenceProfile,
  createDefaultUserIntelligenceProfile,
  validateUserIntelligenceProfile,
} from '@/lib/user-intelligence-utils';
import {
  calculateTemplateRecommendationScore,
  parseTemplateSelectionIntelligence,
} from '@/lib/template-system-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        Organization: true,
        user_projects: {
          include: {
            project_templates: true,
            template_responses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user intelligence profile from most recent project or use default
    let userIntelligence: UserIntelligence;
    const mostRecentProject = user.user_projects[0];
    if (mostRecentProject?.intelligenceProfile) {
      userIntelligence =
        getUserIntelligenceProfile(mostRecentProject.intelligenceProfile) ||
        createDefaultUserIntelligenceProfile();
    } else {
      userIntelligence = createDefaultUserIntelligenceProfile();
    }

    // Get all active templates
    const templates = await prisma.project_templates.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      include: {
        project_steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Get user's project history
    const userProjects = user.user_projects;
    const activeProjects = userProjects.filter(
      (p: any) => p.status === 'ACTIVE'
    );
    const completedProjects = userProjects.filter(
      (p: any) => p.status === 'COMPLETED'
    );

    // Calculate template selection intelligence
    const completedTemplateIds = completedProjects.map(p => p.templateId);
    const inProgressTemplateIds = activeProjects.map(p => p.templateId);

    // Calculate success rate and average completion time
    const successRate =
      completedProjects.length > 0
        ? completedProjects.filter(p => p.progress >= 0.8).length /
          completedProjects.length
        : 0;

    const averageCompletionTime =
      completedProjects.length > 0
        ? completedProjects.reduce((sum, p) => {
            const duration =
              p.completedAt && p.startedAt
                ? p.completedAt.getTime() - p.startedAt.getTime()
                : 0;
            return sum + duration / (1000 * 60 * 60); // Convert to hours
          }, 0) / completedProjects.length
        : 0;

    // Determine skill level based on completed projects and success rate
    let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (completedProjects.length >= 3 && successRate >= 0.7) {
      skillLevel = 'intermediate';
    }
    if (completedProjects.length >= 5 && successRate >= 0.8) {
      skillLevel = 'advanced';
    }

    // Determine preferred categories
    const categoryCounts = completedProjects.reduce(
      (acc, project) => {
        const category = project.project_templates.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Determine time availability based on user activity
    const timeAvailability = user.lastActiveDate
      ? Date.now() - user.lastActiveDate.getTime() < 24 * 60 * 60 * 1000
        ? 'high'
        : 'medium'
      : 'low';

    const templateSelectionIntelligence: TemplateSelectionIntelligence = {
      userProfile: userIntelligence,
      completedTemplates: completedTemplateIds,
      inProgressTemplates: inProgressTemplateIds,
      skillLevel,
      preferredCategories,
      timeAvailability,
      learningStyle: 'guided', // Default, could be determined from user behavior
      lastTemplateCompleted:
        completedProjects.length > 0
          ? completedProjects.sort(
              (a, b) =>
                (b.completedAt?.getTime() || 0) -
                (a.completedAt?.getTime() || 0)
            )[0].completedAt || undefined
          : undefined,
      successRate,
      averageCompletionTime,
    };

    // Calculate recommendation scores for each template
    const availableTemplates = templates
      .map(template => {
        const recommendationScore = calculateTemplateRecommendationScore(
          template.id,
          templateSelectionIntelligence,
          {
            difficulty: template.difficulty,
            category: template.category,
            estimatedTime: template.estimatedTime,
          }
        );

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          difficulty: template.difficulty,
          estimatedTime: template.estimatedTime,
          recommendationScore: recommendationScore.score,
          isRecommended: recommendationScore.score >= 70,
          prerequisites: (template.prerequisites as any[]) || [],
          outcomes: (template.outcomes as any[]) || [],
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Format active projects
    const activeProjectsFormatted = activeProjects.map(project => ({
      id: project.id,
      templateName: project.project_templates.name,
      progress: Math.round(project.progress * 100),
      currentStep: `Step ${project.currentStep}`,
      estimatedTimeRemaining: Math.round(
        (1 - project.progress) * project.project_templates.estimatedTime * 60
      ), // Convert to minutes
      lastActiveAt: project.lastActiveAt,
    }));

    // Format completed projects
    const completedProjectsFormatted = completedProjects.map(project => ({
      id: project.id,
      templateName: project.project_templates.name,
      completedAt: project.completedAt!,
      finalScore: Math.round(project.progress * 100),
      skillsGained: [] as string[], // Could be extracted from project metadata
    }));

    // Generate intelligence insights
    const intelligenceInsights = {
      skillGaps: [], // Could be determined by comparing user skills to available templates
      recommendedCategories: preferredCategories,
      nextSteps: [
        'Complete your current active projects',
        'Explore new categories to expand your skills',
        'Consider advanced templates to challenge yourself',
      ],
      successPatterns: [
        'Consistent daily progress',
        'Focus on one project at a time',
        'Regular review and reflection',
      ],
    };

    const dashboardData: TemplateDashboardData = {
      userIntelligence: templateSelectionIntelligence,
      availableTemplates,
      activeProjects: activeProjectsFormatted,
      completedProjects: completedProjectsFormatted,
      intelligenceInsights,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching template dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
