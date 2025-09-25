import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { OllamaCloudClient, CloudError } from '../../../../lib/ollama-cloud-client'

const prisma = new PrismaClient()

// Cloud model configuration with 128K context support
const CLOUD_MODELS = {
  enterprise: {
    model: 'deepseek-v3.1:671b-cloud',
    contextLength: 128000,
    tier: 'enterprise',
    costTier: 'premium',
    description: 'Enterprise AI Analysis'
  },
  professional_document: {
    model: 'qwen3-coder:480b-cloud',
    contextLength: 32000,
    tier: 'professional',
    costTier: 'professional',
    description: 'Professional Document Analysis'
  },
  professional_grant: {
    model: 'gpt-oss:120b-cloud',
    contextLength: 32000,
    tier: 'professional',
    costTier: 'professional',
    description: 'Professional Grant Writing'
  },
  standard: {
    model: 'gpt-oss:20b-cloud',
    contextLength: 8000,
    tier: 'standard',
    costTier: 'free',
    description: 'Smart AI Assistant'
  }
}

// Keywords for intelligent model selection
const ENTERPRISE_KEYWORDS = [
  'strategic plan', 'board development', 'organizational development', 
  'comprehensive analysis', 'multi-year plan', 'governance', 'leadership',
  'capacity building', 'organizational assessment', 'strategic planning',
  'board governance', 'executive leadership', 'organizational transformation'
]

const DOCUMENT_KEYWORDS = [
  '990', 'form analysis', 'financial review', 'document review', 'parse',
  'analyze document', 'audit', 'compliance review', 'financial statement',
  'annual report', 'bylaws', 'policy review', 'contract analysis'
]

const GRANT_KEYWORDS = [
  'grant application', 'funding strategy', 'grant writing', 'proposal review',
  'foundation', 'federal grant', 'grant proposal', 'funding application',
  'rfp', 'request for proposal', 'grant guidelines', 'funding opportunity'
]

// Model selection logic
function selectCloudModel(message: string, conversationHistory: any[]): {
  model: string;
  tier: string;
  contextLength: number;
  queryType: string;
  description: string;
} {
  const lowerMessage = message.toLowerCase()
  const fullContext = `${message} ${conversationHistory.map(m => m.content).join(' ')}`.toLowerCase()

  // Check for enterprise-level strategic planning
  const hasEnterpriseKeywords = ENTERPRISE_KEYWORDS.some(keyword => 
    fullContext.includes(keyword)
  )

  // Check for document analysis
  const hasDocumentKeywords = DOCUMENT_KEYWORDS.some(keyword => 
    fullContext.includes(keyword)
  )

  // Check for grant writing
  const hasGrantKeywords = GRANT_KEYWORDS.some(keyword => 
    fullContext.includes(keyword)
  )

  // Determine context length needed
  const contextLength = conversationHistory.length * 200 + message.length

  if (hasEnterpriseKeywords || contextLength > 50000) {
    return {
      ...CLOUD_MODELS.enterprise,
      queryType: 'strategic'
    }
  }

  if (hasDocumentKeywords) {
    return {
      ...CLOUD_MODELS.professional_document,
      queryType: 'documents'
    }
  }

  if (hasGrantKeywords) {
    return {
      ...CLOUD_MODELS.professional_grant,
      queryType: 'grants'
    }
  }

  // Default to standard model for general queries
  return {
    ...CLOUD_MODELS.standard,
    queryType: 'general'
  }
}

// Enhanced prompt building for different model tiers
function buildEnhancedPrompt(
  message: string, 
  conversationHistory: any[], 
  modelTier: string,
  queryType: string
): string {
  const basePrompt = `You are Bloomwell AI, a senior nonprofit consultant with 20+ years of experience helping organizations under $3M budget achieve their mission. You specialize in grant writing, board governance, strategic planning, compliance, and financial sustainability.

Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current question: ${message}

Please provide a helpful, detailed response:`

  if (modelTier === 'enterprise') {
    return `${basePrompt}

As an enterprise-level AI consultant, provide:
- Comprehensive strategic frameworks and methodologies
- Detailed step-by-step implementation guides
- Risk assessment and mitigation strategies
- Long-term sustainability considerations
- Board governance best practices
- Organizational development recommendations

Structure your response with clear sections, actionable steps, and professional nonprofit consulting standards.`
  }

  if (modelTier === 'professional') {
    if (queryType === 'documents') {
      return `${basePrompt}

As a professional document analysis specialist, provide:
- Detailed compliance review and recommendations
- Financial analysis and insights
- Risk identification and mitigation
- Best practice recommendations
- Actionable next steps

Focus on accuracy, compliance, and practical implementation.`
    }

    if (queryType === 'grants') {
      return `${basePrompt}

As a professional grant writing consultant, provide:
- Strategic grant application guidance
- Detailed proposal development steps
- Compliance and eligibility analysis
- Budget and narrative recommendations
- Timeline and deadline management

Focus on maximizing funding success and compliance.`
    }
  }

  return basePrompt
}

// Ollama Cloud API integration with 128K context support
async function generateCloudResponse(
  message: string,
  conversationHistory: any[],
  selectedModel: any
): Promise<{
  response: string;
  processingTime: number;
  tokenEstimate: number;
}> {
  if (!process.env.OLLAMA_API_KEY) {
    throw new Error('Ollama API key not configured')
  }

  const client = new OllamaCloudClient(process.env.OLLAMA_API_KEY)
  
  try {
    const enhancedPrompt = buildEnhancedPrompt(
      message, 
      conversationHistory, 
      selectedModel.tier,
      selectedModel.queryType
    )

    const result = await client.generateWithFallback(
      enhancedPrompt,
      selectedModel.model,
      {
        temperature: 0.7,
        contextLength: selectedModel.contextLength
      }
    )

    return {
      response: result.response,
      processingTime: result.processingTime,
      tokenEstimate: result.tokenEstimate
    }
  } catch (error) {
    console.error('Ollama Cloud integration error:', error)
    
    if (error instanceof CloudError) {
      if (error.code === 'AUTH_ERROR') {
        throw new Error('AI service authentication failed. Please contact support.')
      }
      
      if (error.code === 'RATE_LIMIT') {
        throw new Error('AI service is currently busy. Please try again in a moment.')
      }
      
      if (error.code === 'SERVICE_UNAVAILABLE') {
        throw new Error('AI service is temporarily unavailable. Please try again later.')
      }
    }
    
    throw new Error('AI service temporarily unavailable. Please try again in a moment.')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory = [], conversationId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Check if Ollama Cloud is enabled
    if (!process.env.OLLAMA_CLOUD_ENABLED || process.env.OLLAMA_CLOUD_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Ollama Cloud integration is not enabled' },
        { status: 503 }
      )
    }

    // Select appropriate cloud model
    const selectedModel = selectCloudModel(message, conversationHistory)
    
    console.log('Cloud Model Selection:', {
      message: message.substring(0, 100),
      selectedModel: selectedModel.model,
      tier: selectedModel.tier,
      queryType: selectedModel.queryType,
      contextLength: selectedModel.contextLength
    })

    // Generate response using Ollama Cloud
    const { response: aiResponse, processingTime, tokenEstimate } = await generateCloudResponse(
      message, 
      conversationHistory, 
      selectedModel
    )

    // Save messages to database with cloud tracking
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user) {
      // Save user message
      await prisma.message.create({
        data: {
          content: message,
          role: 'user',
          conversationId: conversationId,
          queryType: selectedModel.queryType
        }
      })

      // Save assistant response with cloud tracking
      await prisma.message.create({
        data: {
          content: aiResponse,
          role: 'assistant',
          conversationId: conversationId,
          aiModel: selectedModel.model,
          modelTier: selectedModel.tier,
          processingTime: processingTime,
          tokenEstimate: tokenEstimate,
          queryType: selectedModel.queryType,
          contextLength: selectedModel.contextLength
        }
      })

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      })
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
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cloud Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'AI service temporarily unavailable. Please try again in a moment.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
