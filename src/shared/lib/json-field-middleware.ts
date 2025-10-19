import { NextRequest, NextResponse } from 'next/server';
import { JSONFieldError, ValidationResult } from '@/shared/types/json-fields';

/**
 * Middleware for handling JSON field validation errors
 * This middleware provides consistent error handling for malformed JSON data
 */

export interface JSONFieldErrorResponse {
  error: string;
  details: JSONFieldError[];
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized error response for JSON field validation errors
 */
export function createJSONFieldErrorResponse(
  errors: JSONFieldError[],
  context: string = 'JSON Field Validation',
  requestId?: string
): NextResponse {
  const response: JSONFieldErrorResponse = {
    error: `${context} failed`,
    details: errors,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, { status: 400 });
}

/**
 * Handle validation result and return appropriate response
 */
export function handleValidationResult<T>(
  result: ValidationResult<T>,
  context: string = 'JSON Field Validation',
  requestId?: string
): T | null {
  if (!result.success && result.errors) {
    throw new Error(
      `Validation failed: ${result.errors.map(e => e.message).join(', ')}`
    );
  }

  if (result.warnings) {
    console.warn(`${context} - Warnings:`, result.warnings);
  }

  return result.data || null;
}

/**
 * Middleware to catch and handle JSON field validation errors
 */
export function withJSONFieldErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Validation failed:')
      ) {
        const errors: JSONFieldError[] = [
          {
            field: 'unknown',
            message: error.message,
            expectedType: 'valid JSON',
            receivedValue: null,
          },
        ];

        return createJSONFieldErrorResponse(errors, 'Request Processing');
      }

      console.error('Unexpected error in JSON field middleware:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate JSON field in request body
 */
export function validateRequestBodyJSONField(
  body: any,
  fieldName: string,
  validator: (data: any) => ValidationResult<any>
): any {
  const fieldValue = body[fieldName];
  const result = validator(fieldValue);

  if (!result.success && result.errors) {
    throw new Error(
      `Invalid ${fieldName}: ${result.errors.map(e => e.message).join(', ')}`
    );
  }

  if (result.warnings) {
    console.warn(`${fieldName} validation warnings:`, result.warnings);
  }

  return result.data;
}

/**
 * Sanitize JSON field data before processing
 */
export function sanitizeJSONField<T>(data: T): T {
  if (typeof data === 'string') {
    return data.trim() as T;
  }

  if (Array.isArray(data)) {
    return data.filter(item => item !== null && item !== undefined) as T;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data } as any;
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    }
    return sanitized as T;
  }

  return data;
}

/**
 * Rate limiting for JSON field validation errors
 */
class JSONFieldErrorRateLimiter {
  private errorCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxErrors = 10;
  private readonly windowMs = 60000; // 1 minute

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.errorCounts.get(identifier);

    if (!record || now > record.resetTime) {
      this.errorCounts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (record.count >= this.maxErrors) {
      return true;
    }

    record.count++;
    return false;
  }

  reset(identifier: string): void {
    this.errorCounts.delete(identifier);
  }
}

const rateLimiter = new JSONFieldErrorRateLimiter();

/**
 * Check if client is rate limited for JSON field errors
 */
export function isJSONFieldErrorRateLimited(request: NextRequest): boolean {
  const identifier =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return rateLimiter.isRateLimited(identifier);
}

/**
 * Reset rate limit for client
 */
export function resetJSONFieldErrorRateLimit(request: NextRequest): void {
  const identifier =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  rateLimiter.reset(identifier);
}

/**
 * Comprehensive JSON field validation middleware
 */
export function withComprehensiveJSONFieldValidation(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limiting
    if (isJSONFieldErrorRateLimited(request)) {
      return NextResponse.json(
        { error: 'Too many validation errors. Please try again later.' },
        { status: 429 }
      );
    }

    try {
      const response = await handler(request);

      // Reset rate limit on successful request
      if (response.status < 400) {
        resetJSONFieldErrorRateLimit(request);
      }

      return response;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Validation failed:')
      ) {
        const errors: JSONFieldError[] = [
          {
            field: 'request',
            message: error.message,
            expectedType: 'valid JSON',
            receivedValue: null,
          },
        ];

        return createJSONFieldErrorResponse(errors, 'Request Validation');
      }

      console.error(
        'Unexpected error in comprehensive JSON field middleware:',
        error
      );
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Log JSON field validation errors for monitoring
 */
export function logJSONFieldValidationError(
  error: JSONFieldError,
  context: string,
  request?: NextRequest
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    field: error.field,
    message: error.message,
    expectedType: error.expectedType,
    receivedValue: error.receivedValue,
    path: error.path,
    userAgent: request?.headers.get('user-agent'),
    ip:
      request?.headers.get('x-forwarded-for') ||
      request?.headers.get('x-real-ip'),
    url: request?.url,
  };

  console.error('JSON Field Validation Error:', logData);
}

/**
 * Create a recovery strategy for malformed JSON data
 */
export function createJSONFieldRecoveryStrategy<T>(
  fieldName: string,
  defaultValue: T
): (data: any) => T {
  return (data: any): T => {
    try {
      if (data === null || data === undefined) {
        return defaultValue;
      }

      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        return parsed || defaultValue;
      }

      return data || defaultValue;
    } catch (error) {
      console.warn(`Recovering from malformed JSON in ${fieldName}:`, error);
      return defaultValue;
    }
  };
}
