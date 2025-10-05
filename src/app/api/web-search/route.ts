import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OllamaCloudClient } from '@/lib/ollama-cloud-client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface WebSearchRequest {
  query: string;
  maxResults?: number;
  category?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: WebSearchRequest = await req.json();
    const { query, maxResults = 5, category = 'general' } = body;

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Check daily rate limit (10 searches per day on free tier)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const searchCount = await prisma.webSearchLog.count({
      where: {
        userId: session.user.id,
        timestamp: { gte: today }
      }
    });

    const DAILY_LIMIT = 10;
    if (searchCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { 
          error: 'Daily search limit reached',
          limit: DAILY_LIMIT,
          remaining: 0,
          resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      );
    }

    // Initialize Ollama client
    if (!process.env.OLLAMA_API_KEY) {
      return NextResponse.json({ error: 'Ollama API key not configured' }, { status: 500 });
    }

    const ollamaCloud = new OllamaCloudClient(process.env.OLLAMA_API_KEY);

    // Perform web search
    const startTime = Date.now();
    const searchResults = await ollamaCloud.webSearch(query, maxResults);
    const processingTime = Date.now() - startTime;

    // Log search for analytics
    await prisma.webSearchLog.create({
      data: {
        userId: session.user.id,
        query: query.trim(),
        category,
        resultsCount: searchResults.results.length,
        processingTime,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      results: searchResults.results,
      query: query.trim(),
      metadata: {
        resultsCount: searchResults.results.length,
        processingTime,
        remaining: DAILY_LIMIT - searchCount - 1,
        dailyLimit: DAILY_LIMIT
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Web search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
