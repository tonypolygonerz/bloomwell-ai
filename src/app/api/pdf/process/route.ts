import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/features/auth/api/[...nextauth]/route';

import { createPDFProcessor } from '@/shared/lib/pdf-processor';

import {
  safeJsonStringify,
  parsePDFKeyPoints,
  parsePDFRecommendations,
  logValidationErrors,
  logValidationWarnings,
} from '@/shared/lib/json-field-utils';
import { PDFKeyPoint, PDFRecommendation } from '@/shared/types/json-fields';

// PDF processing limits
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const DAILY_PDF_LIMIT = 5;
const ALLOWED_TYPES = ['application/pdf'];

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check user's subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        trialEndDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is in trial or has active subscription
    const isTrialActive =
      user.subscriptionStatus === 'TRIAL' &&
      user.trialEndDate &&
      new Date() < user.trialEndDate;
    const isSubscribed = user.subscriptionStatus === 'ACTIVE';

    if (!isTrialActive && !isSubscribed) {
      return NextResponse.json(
        {
          error: 'PDF processing requires an active subscription or trial',
        },
        { status: 403 }
      );
    }

    // Get today's PDF processing count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayProcessingCount = await prisma.pdf_processings.count({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Check daily limit
    if (todayProcessingCount >= DAILY_PDF_LIMIT) {
      return NextResponse.json(
        {
          error: 'Daily PDF processing limit reached',
          limit: DAILY_PDF_LIMIT,
          used: todayProcessingCount,
          resetTime: tomorrow.toISOString(),
        },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = (formData.get('documentType') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF files are allowed.',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Create PDF processing record
    const pdfProcessing = await prisma.pdf_processings.create({
      data: {
        id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date(),
        User: {
          connect: { id: userId },
        },
        fileName: file.name,
        fileSize: file.size,
        pageCount: 0, // Will be updated after processing
        extractedText: '', // Will be updated after processing
        documentType,
        status: 'PROCESSING',
      },
    });

    try {
      // Initialize PDF processor
      const pdfProcessor = createPDFProcessor();

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from PDF
      const extractionResult = await pdfProcessor.extractTextFromPDF(buffer);

      if (!extractionResult.success) {
        await prisma.pdf_processings.update({
          where: { id: pdfProcessing.id },
          data: {
            status: 'FAILED',
            errorMessage: extractionResult.error,
          },
        });

        return NextResponse.json(
          {
            error: extractionResult.error,
            processingId: pdfProcessing.id,
          },
          { status: 400 }
        );
      }

      // Analyze the extracted text
      const analysisResult = await pdfProcessor.analyzePDFText(
        extractionResult.extractedText,
        documentType
      );

      // Validate and stringify JSON fields
      const keyPointsResult = safeJsonStringify(
        analysisResult.keyPoints,
        'keyPoints'
      );
      if (!keyPointsResult.success && keyPointsResult.errors) {
        logValidationErrors(keyPointsResult.errors, 'PDF Key Points');
      }

      const recommendationsResult = safeJsonStringify(
        analysisResult.recommendations,
        'recommendations'
      );
      if (!recommendationsResult.success && recommendationsResult.errors) {
        logValidationErrors(
          recommendationsResult.errors,
          'PDF Recommendations'
        );
      }

      // Update processing record with results
      const updatedProcessing = await prisma.pdf_processings.update({
        where: { id: pdfProcessing.id },
        data: {
          pageCount: extractionResult.pageCount,
          extractedText: extractionResult.extractedText,
          documentType: analysisResult.documentType,
          summary: analysisResult.summary,
          keyPoints: keyPointsResult.data || JSON.stringify([]),
          recommendations: recommendationsResult.data || JSON.stringify([]),
          confidence: analysisResult.confidence,
          aiModel: analysisResult.model,
          processingTime: analysisResult.processingTime,
          status: 'COMPLETED',
        },
      });

      // Return success response
      return NextResponse.json({
        success: true,
        processingId: pdfProcessing.id,
        result: {
          summary: analysisResult.summary,
          keyPoints: analysisResult.keyPoints,
          documentType: analysisResult.documentType,
          recommendations: analysisResult.recommendations,
          confidence: analysisResult.confidence,
          pageCount: extractionResult.pageCount,
          fileSize: extractionResult.fileSize,
          processingTime: analysisResult.processingTime,
          model: analysisResult.model,
        },
        usage: {
          dailyLimit: DAILY_PDF_LIMIT,
          used: todayProcessingCount + 1,
          remaining: DAILY_PDF_LIMIT - (todayProcessingCount + 1),
          resetTime: tomorrow.toISOString(),
        },
      });
    } catch (error) {
      // Update processing record with error
      await prisma.pdf_processings.update({
        where: { id: pdfProcessing.id },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      console.error('PDF processing error:', error);
      return NextResponse.json(
        {
          error: 'Failed to process PDF',
          processingId: pdfProcessing.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF processing API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get user's PDF processing history and usage stats
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayProcessingCount = await prisma.pdf_processings.count({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get recent processing history
    const recentProcessings = await prisma.pdf_processings.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        pageCount: true,
        documentType: true,
        summary: true,
        status: true,
        createdAt: true,
        processingTime: true,
      },
    });

    return NextResponse.json({
      usage: {
        dailyLimit: DAILY_PDF_LIMIT,
        used: todayProcessingCount,
        remaining: DAILY_PDF_LIMIT - todayProcessingCount,
        resetTime: tomorrow.toISOString(),
      },
      recentProcessings,
    });
  } catch (error) {
    console.error('PDF usage API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
