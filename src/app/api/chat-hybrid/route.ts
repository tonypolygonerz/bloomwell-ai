import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Keywords that indicate the query should use local Ollama (nonprofit-specific)
const NONPROFIT_KEYWORDS = [
  'nonprofit',
  'non-profit',
  'charity',
  'foundation',
  'ngo',
  'grant',
  'funding',
  'donation',
  'fundraising',
  'development',
  'board',
  'governance',
  'volunteer',
  'mission',
  'budget',
  'compliance',
  'tax',
  '501c3',
  'irs',
  'annual report',
  'strategic plan',
  'program',
  'outreach',
  'advocacy',
  'stakeholder',
  'impact',
  'evaluation',
  'capacity building',
];

// Keywords that indicate a grants search request
const GRANTS_SEARCH_KEYWORDS = [
  'find grants',
  'search grants',
  'federal grants',
  'funding opportunities',
  'grant opportunities',
  'current grants',
  'available grants',
  'grants database',
  'find funding',
  'search funding',
  'funding search',
  'grants for',
  'grants matching',
  'grants that match',
  'suitable grants',
  'relevant grants',
];

// Keywords that indicate the query might benefit from online APIs
const ONLINE_KEYWORDS = [
  'weather',
  'time',
  'date',
  'current',
  'news',
  'today',
  'stock',
  'price',
  'market',
  'exchange rate',
  'currency',
  'sports',
  'score',
  'game',
  'election',
  'politics',
];

function shouldUseLocalOllama(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for nonprofit-specific keywords
  const hasNonprofitKeywords = NONPROFIT_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword)
  );

  // Check for online-specific keywords
  const hasOnlineKeywords = ONLINE_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword)
  );

  // If it has nonprofit keywords, always use local
  if (hasNonprofitKeywords) {
    return true;
  }

  // If it has online keywords, suggest online but let user decide
  if (hasOnlineKeywords) {
    return false;
  }

  // Default to local for privacy
  return true;
}

function shouldSuggestOnline(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return ONLINE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

function isGrantsSearchRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for grants search keywords
  const hasGrantsKeywords = GRANTS_SEARCH_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword)
  );

  return hasGrantsKeywords;
}

async function searchGrantsForUser(
  message: string,
  user: any
): Promise<string> {
  try {
    // Extract potential search terms from the message
    const searchTerms = extractSearchTerms(message);

    // Internal database query - NO API calls
    const whereConditions: any = {
      isActive: true,
      closeDate: { gte: new Date() }, // Only active grants
    };

    // Add search conditions if search terms exist
    if (searchTerms) {
      whereConditions.OR = [
        { title: { contains: searchTerms } },
        { description: { contains: searchTerms } },
        { agencyCode: { contains: searchTerms } },
      ];
    }

    // Query grants directly from database
    const grants = await prisma.grant.findMany({
      where: whereConditions,
      orderBy: { closeDate: 'asc' },
      take: 5, // Limit to top 5 results for chat
      select: {
        id: true,
        title: true,
        agencyCode: true,
        closeDate: true,
        description: true,
        awardCeiling: true,
        category: true,
      },
    });

    if (grants.length === 0) {
      return `I searched our federal grants database but didn't find any current opportunities matching your criteria. 

Here are some suggestions:
- Try broader search terms
- Check if there are any grants in different funding categories
- Consider grants with different award amounts
- Look for grants from different federal agencies

Would you like me to search for grants in a specific category or agency?`;
    }

    let response = `I found ${grants.length} current federal grant opportunities that might match your needs:\n\n`;

    grants.forEach((grant, index) => {
      const closeDate = grant.closeDate
        ? new Date(grant.closeDate).toLocaleDateString()
        : 'TBD';
      const awardAmount = grant.awardCeiling
        ? `$${(grant.awardCeiling / 1000).toFixed(0)}K`
        : 'Amount varies';

      response += `**${index + 1}. ${grant.title}**\n`;
      response += `   • Agency: ${grant.agencyCode || 'Various'}\n`;
      response += `   • Award Amount: ${awardAmount}\n`;
      response += `   • Application Deadline: ${closeDate}\n`;
      if (grant.description) {
        response += `   • Description: ${grant.description.substring(0, 150)}...\n`;
      }
      response += `\n`;
    });

    // Get total count for context
    const totalCount = await prisma.grant.count({
      where: {
        isActive: true,
        closeDate: { gte: new Date() },
      },
    });

    response += `\nThese are just a few of the ${totalCount} active grants in our database. Would you like me to search for grants in a specific area or with different criteria?`;

    return response;
  } catch (error) {
    console.error('Error searching grants:', error);
    return `I encountered an error while searching our grants database. Please try again or contact support if the issue persists.`;
  }
}

function extractSearchTerms(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  // Look for specific terms after "grants for" or "funding for"
  const grantsForMatch = lowerMessage.match(/grants?\s+for\s+(.+?)(?:\?|$)/);
  if (grantsForMatch) {
    return grantsForMatch[1].trim();
  }

  const fundingForMatch = lowerMessage.match(/funding\s+for\s+(.+?)(?:\?|$)/);
  if (fundingForMatch) {
    return fundingForMatch[1].trim();
  }

  // Look for specific terms after "find" or "search"
  const findMatch = lowerMessage.match(
    /(?:find|search)\s+(?:grants?\s+for\s+)?(.+?)(?:\?|$)/
  );
  if (findMatch) {
    return findMatch[1].trim();
  }

  // If no specific terms found, return undefined to search all grants
  return undefined;
}

async function generateOllamaResponse(
  message: string,
  conversationHistory: any[]
): Promise<string> {
  try {
    const conversationContext = `You are Bloomwell AI, a helpful AI assistant specializing in nonprofit organization management. You provide expert guidance on topics like grant writing, fundraising, board governance, volunteer management, strategic planning, and nonprofit operations. Be concise but comprehensive in your responses.

Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current question: ${message}

Please provide a helpful, detailed response:`;

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
          max_tokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.response ||
      'I apologize, but I was unable to generate a response. Please try again.'
    );
  } catch (error) {
    console.error('Ollama integration error:', error);
    return `I'm currently experiencing technical difficulties with my AI system. Please try again in a moment, or contact support if the issue persists. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function generateOnlineResponse(message: string): Promise<string> {
  try {
    // This is a placeholder for online API integration
    // You could integrate with services like:
    // - OpenWeatherMap for weather
    // - News APIs for current events
    // - Time APIs for current time
    // - Stock APIs for market data

    const lowerMessage = message.toLowerCase();

    // Handle time/date queries specifically
    if (
      lowerMessage.includes('time') ||
      lowerMessage.includes('date') ||
      lowerMessage.includes('today')
    ) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateString = now.toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return `Here's the current time and date in Los Angeles:

**Time:** ${timeString} PST/PDT
**Date:** ${dateString}

*Note: This is based on the current system time. For the most accurate time, you might want to check a reliable time service like time.gov.*`;
    }

    // For other online queries, return a helpful message
    return `I can help with that! However, I need to access online information to provide accurate, up-to-date data. 

Would you like me to:
1. Search for current information online (requires internet access)
2. Provide general guidance based on my local knowledge
3. Help you find the right resources to look up this information yourself

Please let me know your preference, and I'll adjust my response accordingly.`;
  } catch (error) {
    console.error('Online API error:', error);
    return 'I encountered an error accessing online information. Let me provide a response based on my local knowledge instead.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const {
      message,
      conversationHistory = [],
      conversationId,
      useOnline = false,
    } = await request.json();

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Message and conversation ID are required' },
        { status: 400 }
      );
    }

    // Check if this is a grants search request
    const isGrantsSearch = isGrantsSearchRequest(message);

    // Determine if we should use local Ollama or suggest online
    const useLocal = shouldUseLocalOllama(message);
    const suggestOnline = shouldSuggestOnline(message);

    // Debug logging
    console.log('Hybrid API Debug:', {
      message,
      isGrantsSearch,
      useLocal,
      suggestOnline,
      hasNonprofitKeywords: NONPROFIT_KEYWORDS.some(keyword =>
        message.toLowerCase().includes(keyword)
      ),
      hasOnlineKeywords: ONLINE_KEYWORDS.some(keyword =>
        message.toLowerCase().includes(keyword)
      ),
      hasGrantsKeywords: GRANTS_SEARCH_KEYWORDS.some(keyword =>
        message.toLowerCase().includes(keyword)
      ),
    });

    let aiResponse: string;
    let responseType: 'local' | 'online' | 'suggestion';

    if (isGrantsSearch) {
      // Handle grants search requests
      aiResponse = await searchGrantsForUser(message, user);
      responseType = 'local';
    } else if (useLocal) {
      // Use local Ollama for nonprofit-specific queries
      aiResponse = await generateOllamaResponse(message, conversationHistory);
      responseType = 'local';
    } else if (useOnline && suggestOnline) {
      // User explicitly requested online access
      aiResponse = await generateOnlineResponse(message);
      responseType = 'online';
    } else if (suggestOnline) {
      // Suggest online access but don't use it yet
      aiResponse = `I can help with that! This type of question might benefit from current, up-to-date information from online sources.

Would you like me to:
1. **Search online** for the most current information (requires internet access)
2. **Use local knowledge** to provide general guidance
3. **Help you find** the right resources to look up this information

Please let me know your preference by typing "search online" or "use local knowledge".`;
      responseType = 'suggestion';
    } else {
      // Default to local Ollama
      aiResponse = await generateOllamaResponse(message, conversationHistory);
      responseType = 'local';
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        conversationId: conversationId,
      },
    });

    // Save assistant response
    await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        conversationId: conversationId,
      },
    });

    const response = {
      response: aiResponse,
      responseType: responseType,
      suggestOnline: suggestOnline && !useOnline,
      timestamp: new Date().toISOString(),
    };

    console.log('Hybrid API Response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
