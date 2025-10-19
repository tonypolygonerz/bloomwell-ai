import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

import { createTemplatePDFIntegration } from '@/shared/lib/template-pdf-integration';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { templateId, projectId, stepId, userResponse, pdfProcessingId } =
      await request.json();

    // Validate required fields
    if (!templateId || !projectId || !stepId || !userResponse) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: templateId, projectId, stepId, userResponse',
        },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await prisma.user_projects.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Initialize template PDF integration
    const templatePDFIntegration = createTemplatePDFIntegration();

    // Enhance the template response with PDF context
    const enhancedResponse =
      await templatePDFIntegration.enhanceTemplateResponse(
        templateId,
        projectId,
        stepId,
        userResponse,
        pdfProcessingId
      );

    // Save the enhanced response to the database
    const templateResponse = await prisma.template_responses.upsert({
      where: {
        projectId_stepId: {
          projectId,
          stepId,
        },
      },
      update: {
        rawAnswer: userResponse,
        enhancedAnswer: enhancedResponse.enhancedResponse,
        confidence: enhancedResponse.confidence,
        qualityScore: enhancedResponse.confidence,
        metadata: {
          pdfContext: enhancedResponse.pdfContext,
          processingTime: enhancedResponse.processingTime,
          enhancedAt: new Date().toISOString(),
        },
      },
      create: {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date(),
        user_projects: {
          connect: { id: projectId },
        },
        project_steps: {
          connect: { id: stepId },
        },
        rawAnswer: userResponse,
        enhancedAnswer: enhancedResponse.enhancedResponse,
        confidence: enhancedResponse.confidence,
        qualityScore: enhancedResponse.confidence,
        metadata: {
          pdfContext: enhancedResponse.pdfContext,
          processingTime: enhancedResponse.processingTime,
          enhancedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      response: {
        id: templateResponse.id,
        originalResponse: enhancedResponse.originalResponse,
        enhancedResponse: enhancedResponse.enhancedResponse,
        pdfContext: enhancedResponse.pdfContext,
        confidence: enhancedResponse.confidence,
        processingTime: enhancedResponse.processingTime,
      },
    });
  } catch (error) {
    console.error('Template PDF enhancement error:', error);
    return NextResponse.json(
      {
        error: 'Failed to enhance template response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get suggested PDFs for a template step
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const stepId = searchParams.get('stepId');

    if (!templateId || !stepId) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: templateId, stepId',
        },
        { status: 400 }
      );
    }

    // Initialize template PDF integration
    const templatePDFIntegration = createTemplatePDFIntegration();

    // Get suggested relevant PDFs
    const suggestedPDFs = await templatePDFIntegration.suggestRelevantPDFs(
      templateId,
      stepId,
      userId
    );

    return NextResponse.json({
      success: true,
      suggestedPDFs,
    });
  } catch (error) {
    console.error('PDF suggestion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get PDF suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
