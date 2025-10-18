// Template-PDF Integration Service
// Enhances template responses with PDF analysis data

import { OllamaCloudClient } from './ollama-cloud-client';
import { prisma } from '@/lib/prisma';

export interface TemplatePDFEnhancement {
  templateId: string;
  projectId: string;
  pdfProcessingId: string;
  enhancedPrompt: string;
  contextData: {
    documentType: string;
    summary: string;
    keyPoints: string[];
    recommendations: string[];
  };
}

export interface EnhancedTemplateResponse {
  originalResponse: string;
  enhancedResponse: string;
  pdfContext: {
    documentType: string;
    relevantInsights: string[];
    actionableRecommendations: string[];
  };
  confidence: number;
  processingTime: number;
}

export class TemplatePDFIntegration {
  private ollamaClient: OllamaCloudClient;

  constructor(ollamaApiKey: string) {
    this.ollamaClient = new OllamaCloudClient(ollamaApiKey);
  }

  // Enhance template response with PDF analysis
  async enhanceTemplateResponse(
    templateId: string,
    projectId: string,
    stepId: string,
    userResponse: string,
    pdfProcessingId?: string
  ): Promise<EnhancedTemplateResponse> {
    const startTime = Date.now();

    try {
      // Get template step information
      const templateStep = await prisma.project_steps.findUnique({
        where: { id: stepId },
        include: {
          project_templates: true,
        },
      });

      if (!templateStep) {
        throw new Error('Template step not found');
      }

      // Get PDF context if provided
      let pdfContext = null;
      if (pdfProcessingId) {
        const pdfProcessing = await prisma.pdf_processings.findUnique({
          where: { id: pdfProcessingId },
        });

        if (pdfProcessing && pdfProcessing.status === 'COMPLETED') {
          pdfContext = {
            documentType: pdfProcessing.documentType || 'unknown',
            summary: pdfProcessing.summary || '',
            keyPoints: (pdfProcessing.keyPoints as string[]) || [],
            recommendations: (pdfProcessing.recommendations as string[]) || [],
          };
        }
      }

      // Create enhanced prompt
      const enhancedPrompt = this.createEnhancedPrompt(
        templateStep,
        userResponse,
        pdfContext
      );

      // Generate enhanced response using AI
      const aiResponse = await this.ollamaClient.generateWithFallback(
        enhancedPrompt,
        'gpt-oss:120b-cloud', // Use professional model for template enhancement
        {
          temperature: 0.4,
          contextLength: 16000,
        }
      );

      // Parse the enhanced response
      const enhancedData = this.parseEnhancedResponse(aiResponse.response);

      return {
        originalResponse: userResponse,
        enhancedResponse: enhancedData.enhancedResponse,
        pdfContext: pdfContext
          ? {
              documentType: pdfContext.documentType,
              relevantInsights: enhancedData.relevantInsights,
              actionableRecommendations: enhancedData.actionableRecommendations,
            }
          : {
              documentType: 'none',
              relevantInsights: [],
              actionableRecommendations: [],
            },
        confidence: enhancedData.confidence,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Template PDF enhancement error:', error);
      throw new Error(
        `Failed to enhance template response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Create enhanced prompt for AI processing
  private createEnhancedPrompt(
    templateStep: any,
    userResponse: string,
    pdfContext: any
  ): string {
    let prompt = `You are an expert nonprofit consultant helping with a guided project template.

Template: ${templateStep.template.name}
Step: ${templateStep.questionText}
User Response: ${userResponse}

Please provide an enhanced, professional version of the user's response that:
1. Maintains the user's original intent and information
2. Uses professional nonprofit language and terminology
3. Provides additional context and clarity
4. Suggests improvements or considerations
5. Aligns with nonprofit best practices`;

    if (pdfContext) {
      prompt += `

RELEVANT DOCUMENT CONTEXT:
Document Type: ${pdfContext.documentType}
Summary: ${pdfContext.summary}
Key Points: ${pdfContext.keyPoints.join(', ')}
Recommendations: ${pdfContext.recommendations.join(', ')}

Please incorporate relevant insights from the document context to enhance the response.`;

      prompt += `

Respond in JSON format:
{
  "enhancedResponse": "Enhanced version of the user's response",
  "relevantInsights": ["insight 1", "insight 2"],
  "actionableRecommendations": ["recommendation 1", "recommendation 2"],
  "confidence": 0.85
}`;
    } else {
      prompt += `

Respond in JSON format:
{
  "enhancedResponse": "Enhanced version of the user's response",
  "relevantInsights": [],
  "actionableRecommendations": ["recommendation 1", "recommendation 2"],
  "confidence": 0.75
}`;
    }

    return prompt;
  }

  // Parse AI response into structured format
  private parseEnhancedResponse(response: string): {
    enhancedResponse: string;
    relevantInsights: string[];
    actionableRecommendations: string[];
    confidence: number;
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          enhancedResponse: parsed.enhancedResponse || response,
          relevantInsights: Array.isArray(parsed.relevantInsights)
            ? parsed.relevantInsights
            : [],
          actionableRecommendations: Array.isArray(
            parsed.actionableRecommendations
          )
            ? parsed.actionableRecommendations
            : [],
          confidence:
            typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        };
      }
    } catch (error) {
      console.warn('Failed to parse enhanced response JSON, using fallback');
    }

    // Fallback: return the response as-is
    return {
      enhancedResponse: response,
      relevantInsights: [],
      actionableRecommendations: [],
      confidence: 0.3,
    };
  }

  // Get user's recent PDF processings for template context
  async getUserRecentPDFs(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const recentPDFs = await prisma.pdf_processings.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          fileName: true,
          documentType: true,
          summary: true,
          keyPoints: true,
          recommendations: true,
          createdAt: true,
        },
      });

      return recentPDFs;
    } catch (error) {
      console.error('Error fetching user PDFs:', error);
      return [];
    }
  }

  // Suggest relevant PDFs for a template step
  async suggestRelevantPDFs(
    templateId: string,
    stepId: string,
    userId: string
  ): Promise<any[]> {
    try {
      // Get template step information
      const templateStep = await prisma.project_steps.findUnique({
        where: { id: stepId },
        include: { project_templates: true },
      });

      if (!templateStep) {
        return [];
      }

      // Get user's recent PDFs
      const userPDFs = await this.getUserRecentPDFs(userId, 10);

      // Simple keyword matching for relevance
      const stepKeywords = this.extractKeywords(templateStep.questionText);
      const templateKeywords = this.extractKeywords(
        templateStep.project_templates.name
      );

      const relevantPDFs = userPDFs.filter(pdf => {
        const pdfKeywords = [
          ...this.extractKeywords(pdf.documentType || ''),
          ...this.extractKeywords(pdf.summary || ''),
        ];

        // Check for keyword overlap
        const hasStepOverlap = stepKeywords.some(keyword =>
          pdfKeywords.some(
            pdfKeyword =>
              pdfKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(pdfKeyword.toLowerCase())
          )
        );

        const hasTemplateOverlap = templateKeywords.some(keyword =>
          pdfKeywords.some(
            pdfKeyword =>
              pdfKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(pdfKeyword.toLowerCase())
          )
        );

        return hasStepOverlap || hasTemplateOverlap;
      });

      return relevantPDFs.slice(0, 3); // Return top 3 most relevant
    } catch (error) {
      console.error('Error suggesting relevant PDFs:', error);
      return [];
    }
  }

  // Extract keywords from text
  private extractKeywords(text: string): string[] {
    const commonWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
    ];

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10); // Limit to 10 keywords
  }
}

// Utility function to create template PDF integration instance
export function createTemplatePDFIntegration(): TemplatePDFIntegration {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error('OLLAMA_CLOUD_API_KEY environment variable is required');
  }
  return new TemplatePDFIntegration(apiKey);
}
