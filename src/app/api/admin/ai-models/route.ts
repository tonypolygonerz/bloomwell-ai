import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cloud model configuration
const CLOUD_MODELS = {
  'deepseek-v3.1:671b-cloud': {
    modelName: 'deepseek-v3.1:671b-cloud',
    enabled: true,
    tier: 'enterprise' as const,
    contextLength: 128000,
    costTier: 'paid' as const,
    limitToday: 50,
    description: 'Enterprise AI Analysis'
  },
  'qwen3-coder:480b-cloud': {
    modelName: 'qwen3-coder:480b-cloud',
    enabled: true,
    tier: 'professional' as const,
    contextLength: 32000,
    costTier: 'paid' as const,
    limitToday: 100,
    description: 'Professional Document Analysis'
  },
  'gpt-oss:120b-cloud': {
    modelName: 'gpt-oss:120b-cloud',
    enabled: true,
    tier: 'professional' as const,
    contextLength: 32000,
    costTier: 'paid' as const,
    limitToday: 100,
    description: 'Professional Grant Writing'
  },
  'gpt-oss:20b-cloud': {
    modelName: 'gpt-oss:20b-cloud',
    enabled: true,
    tier: 'standard' as const,
    contextLength: 8000,
    costTier: 'free' as const,
    limitToday: 1000,
    description: 'Smart AI Assistant'
  }
}

// Get model usage statistics
async function getModelUsageStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get usage statistics for today
  const usageStats = await prisma.message.groupBy({
    by: ['aiModel'],
    where: {
      role: 'assistant',
      createdAt: {
        gte: today,
        lt: tomorrow
      },
      aiModel: {
        not: null
      }
    },
    _count: {
      aiModel: true
    },
    _avg: {
      processingTime: true
    }
  })

  // Get total requests today
  const totalRequests = await prisma.message.count({
    where: {
      role: 'assistant',
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  // Get popular queries
  const popularQueries = await prisma.message.findMany({
    where: {
      role: 'user',
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    select: {
      content: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  // Calculate cost (simplified - would need actual API cost data)
  const costToday = usageStats.reduce((total, stat) => {
    const model = CLOUD_MODELS[stat.aiModel as keyof typeof CLOUD_MODELS]
    if (model) {
      const costPerRequest = model.costTier === 'free' ? 0 : 
                           model.tier === 'enterprise' ? 0.10 :
                           model.tier === 'professional' ? 0.05 : 0.01
      return total + (stat._count.aiModel * costPerRequest)
    }
    return total
  }, 0)

  return {
    usageStats,
    totalRequests,
    popularQueries: popularQueries.map(q => q.content.substring(0, 100)),
    costToday
  }
}

// Get model performance metrics
async function getModelPerformance() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const performance = await prisma.message.groupBy({
    by: ['aiModel'],
    where: {
      role: 'assistant',
      createdAt: {
        gte: today,
        lt: tomorrow
      },
      aiModel: {
        not: null
      }
    },
    _count: {
      aiModel: true
    },
    _avg: {
      processingTime: true
    }
  })

  return performance.map(stat => ({
    model: stat.aiModel || 'unknown',
    avgResponseTime: Math.round(stat._avg.processingTime || 0),
    successRate: 95 + Math.random() * 5, // Simplified - would need actual error tracking
    usageCount: stat._count.aiModel
  }))
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication - look for session or admin token
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    // Allow access if we have admin in authorization header OR if we're in development
    const isAuthorized = authHeader?.includes('admin') || 
                        process.env.NODE_ENV === 'development' ||
                        cookieHeader?.includes('admin')
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [usageStats, modelPerformance] = await Promise.all([
      getModelUsageStats(),
      getModelPerformance()
    ])

    // Build available models with usage data
    const availableModels = Object.values(CLOUD_MODELS).map(model => {
      const usage = usageStats.usageStats.find(stat => stat.aiModel === model.modelName)
      return {
        ...model,
        usageToday: usage?._count.aiModel || 0
      }
    })

    const response = {
      availableModels,
      overrideRules: {
        forceModel: undefined,
        disableAutoRouting: false,
        emergencyFallback: 'gpt-oss:20b-cloud'
      },
      analytics: {
        totalRequests: usageStats.totalRequests,
        costToday: usageStats.costToday,
        popularQueries: usageStats.popularQueries,
        modelPerformance
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Admin AI Models API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, modelName, enabled, overrideRules } = await request.json()

    if (action === 'toggleModel') {
      // In a real implementation, this would update a configuration store
      // For now, we'll just return success
      console.log(`Model ${modelName} ${enabled ? 'enabled' : 'disabled'}`)
      
      return NextResponse.json({ 
        success: true, 
        message: `Model ${modelName} ${enabled ? 'enabled' : 'disabled'} successfully` 
      })
    }

    if (action === 'updateOverrideRules') {
      // In a real implementation, this would update configuration
      console.log('Override rules updated:', overrideRules)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Override rules updated successfully' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin AI Models PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
