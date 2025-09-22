import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory, conversationId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Generate response using Ollama
    const aiResponse = await generateOllamaResponse(message, conversationHistory)

    // Save messages to database if conversationId is provided
    if (conversationId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (user) {
        // Save user message
        await prisma.message.create({
          data: {
            content: message,
            role: 'user',
            conversationId: conversationId
          }
        })

        // Save assistant response
        await prisma.message.create({
          data: {
            content: aiResponse,
            role: 'assistant',
            conversationId: conversationId
          }
        })

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        })
      }
    }

    return NextResponse.json({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateOllamaResponse(message: string, conversationHistory: any[]): Promise<string> {
  try {
    // Build conversation context for Ollama
    let conversationContext = `You are Bloomwell AI, a helpful AI assistant specializing in nonprofit organization management. You provide expert guidance on topics like grant writing, fundraising, board governance, volunteer management, strategic planning, and nonprofit operations. Be concise but comprehensive in your responses.

Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current question: ${message}

Please provide a helpful, detailed response:`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: conversationContext,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    return data.response || 'I apologize, but I was unable to generate a response. Please try again.'
  } catch (error) {
    console.error('Ollama integration error:', error)
    // Fallback to a simple response if Ollama is not available
    return `I'm currently experiencing technical difficulties with my AI system. Please try again in a moment, or contact support if the issue persists. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}
