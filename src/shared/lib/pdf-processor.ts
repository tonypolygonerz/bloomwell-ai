// PDF Processing Service with local text extraction using pdf-parse
import pdf from 'pdf-parse';
import { OllamaCloudClient, CloudResponse } from './ollama-cloud-client';

export interface PDFProcessingResult {
  success: boolean;
  extractedText: string;
  pageCount: number;
  fileSize: number;
  processingTime: number;
  error?: string;
}

export interface PDFAnalysisResult {
  summary: string;
  keyPoints: string[];
  documentType: string;
  recommendations: string[];
  confidence: number;
  model: string;
  processingTime: number;
}

export interface PDFUsageStats {
  userId: string;
  date: string; // YYYY-MM-DD format
  pdfCount: number;
  totalSize: number;
  lastProcessed: Date;
}

export class PDFProcessor {
  private ollamaClient: OllamaCloudClient;
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private readonly DAILY_PDF_LIMIT = 5;
  private readonly MAX_PAGES = 100;

  constructor(ollamaApiKey: string) {
    this.ollamaClient = new OllamaCloudClient(ollamaApiKey);
  }

  // Extract text from PDF buffer
  async extractTextFromPDF(buffer: Buffer): Promise<PDFProcessingResult> {
    const startTime = Date.now();

    try {
      // Validate file size
      if (buffer.length > this.MAX_FILE_SIZE) {
        return {
          success: false,
          extractedText: '',
          pageCount: 0,
          fileSize: buffer.length,
          processingTime: Date.now() - startTime,
          error: `File too large. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
      }

      // Parse PDF using pdf-parse
      const pdfData = await pdf(buffer, {
        // Options for better text extraction
        max: this.MAX_PAGES, // Limit pages to prevent memory issues
        version: 'v1.10.100', // Use specific version for consistency
      });

      // Validate page count
      if (pdfData.numpages > this.MAX_PAGES) {
        return {
          success: false,
          extractedText: '',
          pageCount: pdfData.numpages,
          fileSize: buffer.length,
          processingTime: Date.now() - startTime,
          error: `PDF has too many pages. Maximum is ${this.MAX_PAGES} pages`,
        };
      }

      // Clean and validate extracted text
      const extractedText = this.cleanExtractedText(pdfData.text);

      if (extractedText.length < 50) {
        return {
          success: false,
          extractedText,
          pageCount: pdfData.numpages,
          fileSize: buffer.length,
          processingTime: Date.now() - startTime,
          error:
            'PDF appears to be image-based or contains minimal text. OCR support coming soon.',
        };
      }

      return {
        success: true,
        extractedText,
        pageCount: pdfData.numpages,
        fileSize: buffer.length,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      return {
        success: false,
        extractedText: '',
        pageCount: 0,
        fileSize: buffer.length,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Failed to process PDF',
      };
    }
  }

  // Analyze extracted text using Ollama models
  async analyzePDFText(
    extractedText: string,
    documentType: string = 'general'
  ): Promise<PDFAnalysisResult> {
    const startTime = Date.now();

    try {
      // Truncate text if too long for model context
      const maxTextLength = 50000; // Conservative limit for most models
      const textToAnalyze =
        extractedText.length > maxTextLength
          ? extractedText.substring(0, maxTextLength) +
            '\n\n[Document truncated for analysis]'
          : extractedText;

      // Create analysis prompt based on document type
      const analysisPrompt = this.createAnalysisPrompt(
        textToAnalyze,
        documentType
      );

      // Use appropriate model based on document type and text length
      const model = this.selectAnalysisModel(
        documentType,
        textToAnalyze.length
      );

      // Generate analysis using Ollama Cloud
      const response: CloudResponse =
        await this.ollamaClient.generateWithFallback(analysisPrompt, model, {
          temperature: 0.3, // Lower temperature for more consistent analysis
          contextLength: Math.min(32000, textToAnalyze.length + 2000), // Reserve space for prompt
        });

      // Parse the response into structured format
      const analysis = this.parseAnalysisResponse(response.response);

      return {
        ...analysis,
        model: response.model,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('PDF analysis error:', error);
      throw new Error(
        `Failed to analyze PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Clean and normalize extracted text
  private cleanExtractedText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim();
  }

  // Create analysis prompt based on document type
  private createAnalysisPrompt(text: string, documentType: string): string {
    const basePrompt = `Analyze the following document and provide a structured response in JSON format. Focus on nonprofit and social impact context.

Document Type: ${documentType}
Document Text:
${text}

Please provide a JSON response with the following structure:
{
  "summary": "2-3 sentence summary of the document",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "documentType": "refined document type (e.g., grant proposal, annual report, strategic plan)",
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "confidence": 0.85
}

Focus on:
- Nonprofit relevance and impact
- Actionable insights for organizational development
- Grant opportunities or compliance requirements
- Strategic planning implications`;

    return basePrompt;
  }

  // Select appropriate model based on document type and complexity
  private selectAnalysisModel(
    documentType: string,
    textLength: number
  ): string {
    // For complex documents or long text, use enterprise model
    if (
      textLength > 20000 ||
      documentType.includes('grant') ||
      documentType.includes('proposal')
    ) {
      return 'deepseek-v3.1:671b-cloud';
    }

    // For medium complexity, use professional model
    if (
      textLength > 10000 ||
      documentType.includes('report') ||
      documentType.includes('plan')
    ) {
      return 'gpt-oss:120b-cloud';
    }

    // For simple documents, use standard model
    return 'gpt-oss:20b-cloud';
  }

  // Parse AI response into structured format
  private parseAnalysisResponse(
    response: string
  ): Omit<PDFAnalysisResult, 'model' | 'processingTime'> {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'No summary available',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          documentType: parsed.documentType || 'unknown',
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : [],
          confidence:
            typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback parsing');
    }

    // Fallback parsing if JSON extraction fails
    return {
      summary:
        response.substring(0, 200) + (response.length > 200 ? '...' : ''),
      keyPoints: this.extractKeyPointsFromText(response),
      documentType: 'general',
      recommendations: this.extractRecommendationsFromText(response),
      confidence: 0.3,
    };
  }

  // Extract key points from unstructured text
  private extractKeyPointsFromText(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines
      .filter(
        line => line.includes('•') || line.includes('-') || line.includes('*')
      )
      .slice(0, 5)
      .map(line => line.replace(/^[•\-*]\s*/, '').trim());
  }

  // Extract recommendations from unstructured text
  private extractRecommendationsFromText(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines
      .filter(
        line =>
          line.toLowerCase().includes('recommend') ||
          line.toLowerCase().includes('suggest') ||
          line.toLowerCase().includes('should') ||
          line.toLowerCase().includes('consider')
      )
      .slice(0, 3)
      .map(line => line.trim());
  }

  // Get user's timezone for daily limit calculation
  private getUserTimezone(): string {
    // Default to UTC, can be enhanced with user preference
    return 'UTC';
  }

  // Calculate daily usage key for tracking
  private getDailyUsageKey(userId: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${userId}_${dateStr}`;
  }

  // Check if user has exceeded daily PDF limit
  async checkDailyLimit(
    userId: string,
    currentUsage: number = 0
  ): Promise<{
    canProcess: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const remaining = Math.max(0, this.DAILY_PDF_LIMIT - currentUsage);
    const canProcess = remaining > 0;

    // Calculate reset time (next midnight in user's timezone)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      canProcess,
      remaining,
      resetTime: tomorrow,
    };
  }
}

// Utility function to create PDF processor instance
export function createPDFProcessor(): PDFProcessor {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error('OLLAMA_CLOUD_API_KEY environment variable is required');
  }
  return new PDFProcessor(apiKey);
}
