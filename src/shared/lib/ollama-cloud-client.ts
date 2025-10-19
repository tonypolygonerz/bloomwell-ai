/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
// Ollama Cloud API client with comprehensive error handling and fallbacks

export interface CloudModelConfig {
  model: string;
  tier: 'enterprise' | 'professional' | 'standard';
  contextLength: number;
  costTier: 'free' | 'paid';
  description: string;
}

export interface CloudResponse {
  response: string;
  processingTime: number;
  tokenEstimate: number;
  model: string;
  tier: string;
  contextLength: number;
}

export interface CloudError {
  name: string;
  code: string;
  message: string;
  retryable: boolean;
  fallbackModel?: string;
}

// Add these interfaces for web search
interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

interface WebSearchResponse {
  results: WebSearchResult[];
}

interface WebFetchResponse {
  title: string;
  content: string;
  links: string[];
}

// Cloud model configuration with fallback hierarchy
export const CLOUD_MODELS: Record<string, CloudModelConfig> = {
  'deepseek-v3.1:671b-cloud': {
    model: 'deepseek-v3.1:671b-cloud',
    tier: 'enterprise',
    contextLength: 128000,
    costTier: 'paid',
    description: 'Enterprise AI Analysis',
  },
  'qwen3-coder:480b-cloud': {
    model: 'qwen3-coder:480b-cloud',
    tier: 'professional',
    contextLength: 32000,
    costTier: 'paid',
    description: 'Professional Document Analysis',
  },
  'gpt-oss:120b-cloud': {
    model: 'gpt-oss:120b-cloud',
    tier: 'professional',
    contextLength: 32000,
    costTier: 'paid',
    description: 'Professional Grant Writing',
  },
  'gpt-oss:20b-cloud': {
    model: 'gpt-oss:20b-cloud',
    tier: 'standard',
    contextLength: 8000,
    costTier: 'free',
    description: 'Smart AI Assistant',
  },
};

// Fallback hierarchy: enterprise -> professional -> standard
const FALLBACK_HIERARCHY = {
  'deepseek-v3.1:671b-cloud': ['gpt-oss:120b-cloud', 'gpt-oss:20b-cloud'],
  'qwen3-coder:480b-cloud': ['gpt-oss:120b-cloud', 'gpt-oss:20b-cloud'],
  'gpt-oss:120b-cloud': ['gpt-oss:20b-cloud'],
  'gpt-oss:20b-cloud': [], // No fallback for standard model
};

export class OllamaCloudClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimitTracker: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(apiKey: string, baseUrl: string = 'https://ollama.com/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Check if we're within rate limits
  private checkRateLimit(model: string): boolean {
    const now = Date.now();
    const key = `${model}_${Math.floor(now / 60000)}`; // Per minute tracking

    const current = this.rateLimitTracker.get(key) || {
      count: 0,
      resetTime: now + 60000,
    };

    if (now > current.resetTime) {
      this.rateLimitTracker.set(key, { count: 1, resetTime: now + 60000 });
      return true;
    }

    const modelConfig = CLOUD_MODELS[model];
    const limit = modelConfig?.costTier === 'free' ? 100 : 1000; // Simplified limits

    if (current.count >= limit) {
      return false;
    }

    current.count++;
    this.rateLimitTracker.set(key, current);
    return true;
  }

  // Parse error response and determine if retryable
  private parseError(error: any, response?: Response): CloudError {
    if (response?.status === 401) {
      return {
        name: 'CloudError',
        code: 'AUTH_ERROR',
        message: 'Invalid API key or authentication failed',
        retryable: false,
      };
    }

    if (response?.status === 429) {
      return {
        name: 'CloudError',
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again later.',
        retryable: true,
      };
    }

    if (response?.status === 503) {
      return {
        name: 'CloudError',
        code: 'SERVICE_UNAVAILABLE',
        message: 'Ollama Cloud service temporarily unavailable',
        retryable: true,
      };
    }

    if (response?.status === 500) {
      return {
        name: 'CloudError',
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        retryable: true,
      };
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        name: 'CloudError',
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        retryable: true,
      };
    }

    return {
      name: 'CloudError',
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      retryable: true,
    };
  }

  // Generate response with fallback support
  async generateResponse(
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      contextLength?: number;
    } = {}
  ): Promise<CloudResponse> {
    const startTime = Date.now();

    // Check rate limits
    if (!this.checkRateLimit(model)) {
      throw new CloudError({
        name: 'CloudError',
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded for this model',
        retryable: true,
        fallbackModel: (FALLBACK_HIERARCHY as any)[model]?.[0],
      });
    }

    const modelConfig = CLOUD_MODELS[model];
    if (!modelConfig) {
      throw new CloudError({
        name: 'CloudError',
        code: 'INVALID_MODEL',
        message: `Unknown model: ${model}`,
        retryable: false,
      });
    }

    try {
      // Use the official Ollama Cloud API format from docs.ollama.com/cloud#javascript
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false,
          options: {
            num_ctx: options.contextLength || modelConfig.contextLength,
            temperature: options.temperature || 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const error = this.parseError(
          new Error(`HTTP ${response.status}`),
          response
        );
        throw error;
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      const tokenEstimate = Math.ceil(
        (prompt.length + (data.message?.content?.length || 0)) / 4
      );

      return {
        response:
          data.message?.content ||
          'I apologize, but I was unable to generate a response.',
        processingTime,
        tokenEstimate,
        model,
        tier: modelConfig.tier,
        contextLength: options.contextLength || modelConfig.contextLength,
      };
    } catch (error) {
      if (error instanceof CloudError) {
        throw error;
      }

      const cloudError = this.parseError(error);
      throw cloudError;
    }
  }

  // Generate response with automatic fallback
  async generateWithFallback(
    prompt: string,
    primaryModel: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      contextLength?: number;
    } = {}
  ): Promise<CloudResponse> {
    const modelsToTry = [
      primaryModel,
      ...((FALLBACK_HIERARCHY as any)[primaryModel] || []),
    ];

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];

      try {
        return await this.generateResponse(prompt, model, options);
      } catch (error) {
        if (error instanceof CloudError && !error.retryable) {
          throw error; // Don't retry non-retryable errors
        }

        if (i === modelsToTry.length - 1) {
          // Last model failed, throw the error
          throw error;
        }

        console.warn(
          `Model ${model} failed, trying fallback:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    throw new CloudError({
      name: 'CloudError',
      code: 'ALL_MODELS_FAILED',
      message: 'All available models failed to generate a response',
      retryable: false,
    });
  }

  // Get model availability status
  async getModelStatus(model: string): Promise<{
    available: boolean;
    rateLimitRemaining?: number;
    lastError?: string;
  }> {
    try {
      // Simple health check by making a minimal request
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt: 'test',
          stream: false,
          options: { num_ctx: 100 },
        }),
      });

      return {
        available: response.ok,
        rateLimitRemaining: response.headers.get('X-RateLimit-Remaining')
          ? parseInt(response.headers.get('X-RateLimit-Remaining')!)
          : undefined,
      };
    } catch (error) {
      return {
        available: false,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Performs web search using Ollama's web search API
   * @param query - Search query string
   * @param maxResults - Maximum results to return (default 5, max 10)
   */
  async webSearch(
    query: string,
    maxResults: number = 5
  ): Promise<WebSearchResponse> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
      }

      const response = await fetch(`${this.baseUrl}/web_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query: query.trim(),
          max_results: Math.min(maxResults, 10), // API maximum is 10
        }),
      });

      if (!response.ok) {
        const error = this.parseError(
          new Error(`HTTP ${response.status}`),
          response
        );
        throw error;
      }

      const results = await response.json();
      console.log(
        `Web search completed: "${query}" - ${results.results.length} results`
      );
      return results;
    } catch (error) {
      console.error('Ollama web search error:', error);
      throw new Error(
        `Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetches content from a specific URL using Ollama's web fetch API
   * @param url - URL to fetch
   */
  async webFetch(url: string): Promise<WebFetchResponse> {
    try {
      if (!url || !this.isValidUrl(url)) {
        throw new Error('Valid URL required');
      }

      const response = await fetch(`${this.baseUrl}/web_fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = this.parseError(
          new Error(`HTTP ${response.status}`),
          response
        );
        throw error;
      }

      const result = await response.json();
      console.log(`Web fetch completed: ${url}`);
      return result;
    } catch (error) {
      console.error('Ollama web fetch error:', error);
      throw new Error(
        `Web fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validates URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Custom error class for cloud-specific errors
export class CloudError extends Error {
  public code: string;
  public retryable: boolean;
  public fallbackModel?: string;

  constructor(error: CloudError) {
    super(error.message);
    this.name = 'CloudError';
    this.code = error.code;
    this.retryable = error.retryable;
    this.fallbackModel = error.fallbackModel;
  }
}
