import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OllamaCloudClient } from '@/lib/ollama-cloud-client';

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { url } = await req.json();

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: 'Valid URL required' }, { status: 400 });
    }

    // Initialize Ollama client
    if (!process.env.OLLAMA_API_KEY) {
      return NextResponse.json({ error: 'Ollama API key not configured' }, { status: 500 });
    }

    const ollamaCloud = new OllamaCloudClient(process.env.OLLAMA_API_KEY);

    // Fetch web content
    const startTime = Date.now();
    const fetchResult = await ollamaCloud.webFetch(url);
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      title: fetchResult.title,
      content: fetchResult.content,
      links: fetchResult.links,
      metadata: {
        processingTime,
        contentLength: fetchResult.content.length,
        linkCount: fetchResult.links.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Web fetch API error:', error);
    return NextResponse.json(
      { 
        error: 'Fetch failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
