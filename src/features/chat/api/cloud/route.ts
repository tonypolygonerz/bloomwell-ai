import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/api/[...nextauth]/route';
import {
  OllamaCloudClient,
  CloudError,
} from '../../../../lib/ollama-cloud-client';
import {
  selectRelevantGuidelines,
  buildFocusedPrompt,
  GuidelineContext,
} from '../../../../lib/guideline-selector';
import { getUserIntelligenceProfile } from '../../../../lib/user-intelligence-utils';

/**
 * Determines if a message should trigger web search
 */
function shouldUseWebSearch(message: string): boolean {
  const triggers = [
    // Temporal indicators
    'recent',
    'latest',
    'current',
    'today',
    'this year',
    '2025',

    // Action requests
    'find grants for',
    'research foundation',
    'search for',
    'look up',

    // Current information needs
    'compliance requirements',
    'regulatory changes',
    'irs guidance',
    'best practices',
    'industry trends',
    'what are the current',

    // Discovery requests
    'who received',
    'recent awards',
    'funding priorities',
  ];

  const lowerMessage = message.toLowerCase();
  return triggers.some(trigger => lowerMessage.includes(trigger));
}

/**
 * Extracts clean search query from conversational message
 */
function extractSearchQuery(message: string): string {
  // Remove common question words and punctuation
  const cleanMessage = message
    .toLowerCase()
    .replace(
      /^(what|how|when|where|why|who|can you|please|could you|find|search|look up|tell me about)\s+/gi,
      ''
    )
    .replace(/\?+$/g, '')
    .replace(/for me/gi, '')
    .trim();

  return cleanMessage;
}

/**
 * Categorizes search query for logging
 */
function categorizeQuery(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes('grant') ||
    lowerQuery.includes('foundation') ||
    lowerQuery.includes('funding')
  ) {
    return 'grants';
  }
  if (
    lowerQuery.includes('compliance') ||
    lowerQuery.includes('regulation') ||
    lowerQuery.includes('irs')
  ) {
    return 'compliance';
  }
  if (
    lowerQuery.includes('best practice') ||
    lowerQuery.includes('strategy') ||
    lowerQuery.includes('trend')
  ) {
    return 'best-practices';
  }
  if (lowerQuery.includes('foundation') || lowerQuery.includes('donor')) {
    return 'foundations';
  }

  return 'general';
}

// Cloud model configuration with 128K context support
const CLOUD_MODELS = {
  enterprise: {
    model: 'deepseek-v3.1:671b-cloud',
    contextLength: 128000,
    tier: 'enterprise',
    costTier: 'premium',
    description: 'Enterprise AI Analysis',
  },
  professional_document: {
    model: 'qwen3-coder:480b-cloud',
    contextLength: 32000,
    tier: 'professional',
    costTier: 'professional',
    description: 'Professional Document Analysis',
  },
  professional_grant: {
    model: 'gpt-oss:120b-cloud',
    contextLength: 32000,
    tier: 'professional',
    costTier: 'professional',
    description: 'Professional Grant Writing',
  },
  standard: {
    model: 'gpt-oss:20b-cloud',
    contextLength: 8000,
    tier: 'standard',
    costTier: 'free',
    description: 'Smart AI Assistant',
  },
};

// Keywords for intelligent model selection
const ENTERPRISE_KEYWORDS = [
  'strategic plan',
  'board development',
  'organizational development',
  'comprehensive analysis',
  'multi-year plan',
  'governance',
  'leadership',
  'capacity building',
  'organizational assessment',
  'strategic planning',
  'board governance',
  'executive leadership',
  'organizational transformation',
];

const DOCUMENT_KEYWORDS = [
  '990',
  'form analysis',
  'financial review',
  'document review',
  'parse',
  'analyze document',
  'audit',
  'compliance review',
  'financial statement',
  'annual report',
  'bylaws',
  'policy review',
  'contract analysis',
];

const GRANT_KEYWORDS = [
  'grant application',
  'funding strategy',
  'grant writing',
  'proposal review',
  'foundation',
  'federal grant',
  'grant proposal',
  'funding application',
  'rfp',
  'request for proposal',
  'grant guidelines',
  'funding opportunity',
];

// Model selection logic
function selectCloudModel(
  message: string,
  conversationHistory: any[]
): {
  model: string;
  tier: string;
  contextLength: number;
  queryType: string;
  description: string;
} {
  const lowerMessage = message.toLowerCase();
  const fullContext =
    `${message} ${conversationHistory.map(m => m.content).join(' ')}`.toLowerCase();

  // Check for enterprise-level strategic planning
  const hasEnterpriseKeywords = ENTERPRISE_KEYWORDS.some(keyword =>
    fullContext.includes(keyword)
  );

  // Check for document analysis
  const hasDocumentKeywords = DOCUMENT_KEYWORDS.some(keyword =>
    fullContext.includes(keyword)
  );

  // Check for grant writing
  const hasGrantKeywords = GRANT_KEYWORDS.some(keyword =>
    fullContext.includes(keyword)
  );

  // Determine context length needed
  const contextLength = conversationHistory.length * 200 + message.length;

  if (hasEnterpriseKeywords || contextLength > 50000) {
    return {
      ...CLOUD_MODELS.enterprise,
      queryType: 'strategic',
    };
  }

  if (hasDocumentKeywords) {
    return {
      ...CLOUD_MODELS.professional_document,
      queryType: 'documents',
    };
  }

  if (hasGrantKeywords) {
    return {
      ...CLOUD_MODELS.professional_grant,
      queryType: 'grants',
    };
  }

  // Default to standard model for general queries
  return {
    ...CLOUD_MODELS.standard,
    queryType: 'general',
  };
}

// Enhanced prompt building for different model tiers with guideline integration
function buildEnhancedPrompt(
  message: string,
  conversationHistory: any[],
  modelTier: string,
  queryType: string,
  selectedGuidelines: any[] = []
): string {
  const basePrompt = `You are Bloomwell AI, a senior nonprofit consultant with 20+ years of experience helping organizations under $3M budget achieve their mission. You specialize in grant writing, board governance, strategic planning, compliance, and financial sustainability.

Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current question: ${message}

Please provide a helpful, detailed response:`;

  // Build the base prompt with tier-specific enhancements
  let enhancedPrompt = basePrompt;

  if (modelTier === 'enterprise') {
    enhancedPrompt = `${enhancedPrompt}

As an enterprise-level AI consultant, provide:
- Comprehensive strategic frameworks and methodologies
- Detailed step-by-step implementation guides
- Risk assessment and mitigation strategies
- Long-term sustainability considerations
- Board governance best practices
- Organizational development recommendations

Structure your response with clear sections, actionable steps, and professional nonprofit consulting standards.`;
  }

  if (modelTier === 'professional') {
    if (queryType === 'documents') {
      enhancedPrompt = `${enhancedPrompt}

As a professional document analysis specialist, provide:
- Detailed compliance review and recommendations
- Financial analysis and insights
- Risk identification and mitigation
- Best practice recommendations
- Actionable next steps

Focus on accuracy, compliance, and practical implementation.`;
    }

    if (queryType === 'grants') {
      enhancedPrompt = `${enhancedPrompt}

As a professional grant writing consultant, provide:
- Strategic grant application guidance
- Detailed proposal development steps
- Compliance and eligibility analysis
- Budget and narrative recommendations
- Timeline and deadline management

Focus on maximizing funding success and compliance.`;
    }
  }

  // Apply guideline-based context enhancement
  if (selectedGuidelines && selectedGuidelines.length > 0) {
    enhancedPrompt = buildFocusedPrompt(enhancedPrompt, selectedGuidelines);
  }

  return enhancedPrompt;
}

// Ollama Cloud API integration with 128K context support
async function generateCloudResponse(
  message: string,
  conversationHistory: any[],
  selectedModel: any,
  selectedGuidelines: any[] = [],
  webSearchContext: string = ''
): Promise<{
  response: string;
  processingTime: number;
  tokenEstimate: number;
}> {
  if (!process.env.OLLAMA_API_KEY) {
    throw new Error('Ollama API key not configured');
  }

  const client = new OllamaCloudClient(process.env.OLLAMA_API_KEY);

  try {
    const enhancedPrompt = buildEnhancedPrompt(
      message,
      conversationHistory,
      selectedModel.tier,
      selectedModel.queryType,
      selectedGuidelines
    );

    // Build messages array with web search context if available
    const messages = [
      { role: 'system', content: enhancedPrompt },
      ...(webSearchContext
        ? [{ role: 'system', content: webSearchContext }]
        : []),
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const result = await client.generateWithFallback(
      messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
      selectedModel.model,
      {
        temperature: 0.7,
        contextLength: selectedModel.contextLength,
      }
    );

    return {
      response: result.response,
      processingTime: result.processingTime,
      tokenEstimate: result.tokenEstimate,
    };
  } catch (error) {
    console.error('Ollama Cloud integration error:', error);

    if (error instanceof CloudError) {
      if (error.code === 'AUTH_ERROR') {
        throw new Error(
          'AI service authentication failed. Please contact support.'
        );
      }

      if (error.code === 'RATE_LIMIT') {
        throw new Error(
          'AI service is currently busy. Please try again in a moment.'
        );
      }

      if (error.code === 'SERVICE_UNAVAILABLE') {
        throw new Error(
          'AI service is temporarily unavailable. Please try again later.'
        );
      }
    }

    throw new Error(
      'AI service temporarily unavailable. Please try again in a moment.'
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      message,
      conversationHistory = [],
      conversationId,
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Check if Ollama Cloud is enabled
    if (
      !process.env.OLLAMA_CLOUD_ENABLED ||
      process.env.OLLAMA_CLOUD_ENABLED !== 'true'
    ) {
      return NextResponse.json(
        { error: 'Ollama Cloud integration is not enabled' },
        { status: 503 }
      );
    }

    // Fetch user data for guideline selection
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Organization: true },
    });

    // Select appropriate cloud model
    const selectedModel = selectCloudModel(message, conversationHistory);

    console.log('Cloud Model Selection:', {
      message: message.substring(0, 100),
      selectedModel: selectedModel.model,
      tier: selectedModel.tier,
      queryType: selectedModel.queryType,
      contextLength: selectedModel.contextLength,
    });

    // Web search integration
    let webSearchResults = null;
    let webSearchContext = '';

    // Check if web search should be triggered
    if (shouldUseWebSearch(message)) {
      try {
        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const searchCount = await (prisma as any).webSearchLog.count({
          where: {
            userId: user?.id,
            timestamp: { gte: today },
          },
        });

        // Only use web search if under daily limit
        if (searchCount < 10) {
          const searchQuery = extractSearchQuery(message);
          const category = categorizeQuery(searchQuery);

          console.log(
            `🔍 Triggering web search: "${searchQuery}" [${category}]`
          );

          // Initialize Ollama client for web search
          if (process.env.OLLAMA_API_KEY) {
            const ollamaCloud = new OllamaCloudClient(
              process.env.OLLAMA_API_KEY
            );

            const startTime = Date.now();
            webSearchResults = await ollamaCloud.webSearch(searchQuery, 5);
            const processingTime = Date.now() - startTime;

            // Create enhanced context with web results
            webSearchContext = `
CURRENT WEB SEARCH RESULTS (${new Date().toISOString()}):
Query: "${searchQuery}"

${webSearchResults.results
  .map(
    (r: any, idx: number) => `
[Source ${idx + 1}] ${r.title}
URL: ${r.url}
Content: ${r.content}
`
  )
  .join('\n---\n')}

INSTRUCTIONS: You have access to current web information above. Use these sources to provide accurate, up-to-date information. When using information from these sources, cite them as [Source #]. Prioritize information from these current sources over your training data when they conflict.
`;

            // Log the search
            if (user) {
              await (prisma as any).webSearchLog.create({
                data: {
                  userId: user.id,
                  query: searchQuery,
                  category,
                  resultsCount: webSearchResults.results.length,
                  processingTime,
                  timestamp: new Date(),
                },
              });
            }

            console.log(
              `✅ Web search completed: ${webSearchResults.results.length} results in ${processingTime}ms`
            );
          }
        } else {
          console.log('⚠️ Daily web search limit reached for user');
        }
      } catch (error) {
        console.error('❌ Web search failed in chat:', error);
        // Continue without web search if it fails
      }
    }

    // Initialize guideline selection variables
    let selectedGuidelines: any[] = [];

    if (user) {
      try {
        // Fetch active guidelines from database
        const guidelines = await prisma.ai_guidelines.findMany({
          where: { isActive: true },
        });

        // Build guideline context using organization data
        const org = user.Organization as any; // Type assertion for new fields
        const guidelineContext: GuidelineContext = {
          user: {
            organizationType: org?.organizationType || undefined,
            budgetRange: org?.budget || undefined,
            state: org?.state || undefined,
            focusAreas: org?.focusAreas ? org.focusAreas.split(',') : [],
          },
          query: message,
          templateId: undefined, // We'll add template support later
        };

        // Select relevant guidelines
        selectedGuidelines = selectRelevantGuidelines(
          guidelines.map((g: any) => ({
            id: g.id,
            name: g.name,
            category: g.category,
            guidanceText: g.guidanceText,
            conditions: g.conditions as any,
            priority: g.priority,
            isActive: g.isActive,
          })),
          guidelineContext
        );

        // Debug logging for guideline selection
        console.log('Guideline Selection:', {
          userProfile: {
            organizationType: org?.organizationType || 'undefined',
            budgetRange: org?.budget || 'undefined',
            state: org?.state || 'undefined',
            focusAreas: org?.focusAreas || 'undefined',
          },
          selectedGuidelinesCount: selectedGuidelines.length,
          selectedGuidelineNames: selectedGuidelines.map((g: any) => g.name),
        });
      } catch (error) {
        console.error('Guideline selection error:', error);
        // Continue without guidelines if there's an error
        selectedGuidelines = [];
      }
    }

    // Generate response using Ollama Cloud with guideline-enhanced prompts and web search context
    const {
      response: aiResponse,
      processingTime,
      tokenEstimate,
    } = await generateCloudResponse(
      message,
      conversationHistory,
      selectedModel,
      selectedGuidelines,
      webSearchContext
    );

    // Save messages to database with cloud tracking
    if (user) {
      // Save user message
      await prisma.message.create({
        data: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: message,
          role: 'user',
          conversationId: conversationId,
          queryType: selectedModel.queryType,
        },
      });

      // Save assistant response with cloud tracking
      await prisma.message.create({
        data: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: aiResponse,
          role: 'assistant',
          conversationId: conversationId,
          aiModel: selectedModel.model,
          modelTier: selectedModel.tier,
          processingTime: processingTime,
          tokenEstimate: tokenEstimate,
          queryType: selectedModel.queryType,
          contextLength: selectedModel.contextLength,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({
      response: aiResponse,
      aiModel: selectedModel.model,
      modelTier: selectedModel.tier,
      modelDescription: selectedModel.description,
      processingTime: processingTime,
      tokenEstimate: tokenEstimate,
      queryType: selectedModel.queryType,
      contextLength: selectedModel.contextLength,
      webSearchUsed: webSearchResults !== null,
      sources:
        webSearchResults?.results.map((r: any) => ({
          title: r.title,
          url: r.url,
        })) || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cloud Chat API error:', error);
    return NextResponse.json(
      {
        error:
          'AI service temporarily unavailable. Please try again in a moment.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
