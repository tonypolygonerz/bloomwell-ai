import { NextRequest, NextResponse } from 'next/server'

// Intelligent model selection based on query type
function selectOptimalModel(query: string, hasImages: boolean = false) {
  if (hasImages || query.includes('image') || query.includes('document')) {
    return process.env.OLLAMA_VISION_MODEL // qwen3-vl:235b-cloud
  }
  
  if (query.includes('code') || query.includes('website') || query.includes('app')) {
    return process.env.OLLAMA_CODING_MODEL // glm-4.6:cloud
  }
  
  if (query.includes('grant') || query.includes('proposal')) {
    return process.env.OLLAMA_PROFESSIONAL_MODEL_GRANTS // gpt-oss:120b-cloud
  }
  
  // Strategic planning, complex analysis
  if (query.length > 500 || query.includes('strategic') || query.includes('analysis')) {
    return process.env.OLLAMA_ENTERPRISE_MODEL // deepseek-v3.1:671b-cloud
  }
  
  return process.env.OLLAMA_STANDARD_MODEL // gpt-oss:20b-cloud
}

export async function POST(request: NextRequest) {
  try {
    const { messages, hasImages = false } = await request.json()
    
    // Check if asking for models
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase()
    if (lastMessage?.includes('what models') || lastMessage?.includes('available')) {
      return NextResponse.json({
        response: `Available Ollama Cloud Models:

🏢 ENTERPRISE: ${process.env.OLLAMA_ENTERPRISE_MODEL}
- 671B parameters, 128K context
- Usage: 0/50 requests today

👁️ VISION: ${process.env.OLLAMA_VISION_MODEL}
- 235B parameters, multimodal (text + images)
- Usage: 0/100 requests today

💻 CODING: ${process.env.OLLAMA_CODING_MODEL}
- Advanced code generation and analysis
- Usage: 0/100 requests today

💼 PROFESSIONAL: ${process.env.OLLAMA_PROFESSIONAL_MODEL_DOCS}  
- 480B parameters, 32K context
- Usage: 0/100 requests today

📝 PROFESSIONAL: ${process.env.OLLAMA_PROFESSIONAL_MODEL_GRANTS}
- 120B parameters, 32K context  
- Usage: 0/100 requests today

🤖 STANDARD: ${process.env.OLLAMA_STANDARD_MODEL}
- 20B parameters, 8K context
- Usage: 0/1000 requests today (FREE TIER)`
      })
    }

    // Intelligent model selection
    const selectedModel = selectOptimalModel(lastMessage, hasImages)
    console.log('Selected model:', selectedModel, 'for query:', lastMessage.substring(0, 100))

    // Real Ollama Cloud API call with intelligent model selection
    const ollamaResponse = await fetch(`${process.env.OLLAMA_CLOUD_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OLLAMA_CLOUD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        stream: false
      })
    })

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error('Ollama API Error:', ollamaResponse.status, errorText)
      throw new Error(`Ollama API error: ${ollamaResponse.status}`)
    }

    const data = await ollamaResponse.json()
    
    return NextResponse.json({
      response: data.choices?.[0]?.message?.content || data.message?.content || data.response || 'No response from model',
      model: selectedModel,
      modelType: getModelType(selectedModel)
    })

  } catch (error) {
    console.error('Ollama Cloud API Error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to Ollama Cloud', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function getModelType(model: string): string {
  if (model === process.env.OLLAMA_VISION_MODEL) return 'vision'
  if (model === process.env.OLLAMA_CODING_MODEL) return 'coding'
  if (model === process.env.OLLAMA_ENTERPRISE_MODEL) return 'enterprise'
  if (model === process.env.OLLAMA_PROFESSIONAL_MODEL_GRANTS) return 'grants'
  if (model === process.env.OLLAMA_PROFESSIONAL_MODEL_DOCS) return 'documentation'
  return 'standard'
}
