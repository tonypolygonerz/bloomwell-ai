import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as { message?: string }
    const { message } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // TODO: Replace with actual AI service integration (Ollama Cloud API)
    // Current implementation uses placeholder logic
    const response = await generateAIResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    // Log error for debugging in development only
    if (process.env.NODE_ENV === "development") {
      console.error("Chat API error:", error)
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateAIResponse(message: string): Promise<string> {
  // Placeholder AI logic - replace with OpenAI, Anthropic, or local AI
  const nonprofitKeywords = ["grant", "fundraising", "board", "volunteer", "donation", "nonprofit"]
  const hasNonprofitContext = nonprofitKeywords.some((keyword) => message.toLowerCase().includes(keyword))

  if (hasNonprofitContext) {
    return `I understand you're asking about ${message}. As a nonprofit AI assistant, I can help with grants, fundraising strategies, board governance, volunteer management, and compliance requirements. What specific aspect would you like to explore?`
  }

  return `Thank you for your question about "${message}". I'm specialized in nonprofit management. I can assist with grant writing, fundraising campaigns, board development, volunteer coordination, financial planning, and regulatory compliance. How can I help with your nonprofit needs?`
}
