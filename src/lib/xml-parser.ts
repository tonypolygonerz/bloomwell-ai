import { parseStringPromise } from 'xml2js';

export interface XMLParseOptions {
  explicitArray?: boolean;
  ignoreAttrs?: boolean;
  mergeAttrs?: boolean;
  trim?: boolean;
}

export interface ParsedOpportunity {
  OpportunityID?: string;
  OpportunityTitle?: string;
  OpportunityNumber?: string;
  AgencyCode?: string;
  CFDANumbers?: {
    CFDANumber?: string | string[];
  };
  PostDate?: string;
  CloseDate?: string;
  Description?: string;
  EligibilityInfo?: {
    EligibilityDescription?: string;
  };
  AwardCeiling?: string;
  AwardFloor?: string;
  EstimatedTotalProgramFunding?: string;
  CategoryExplanation?: string;
  FundingInstrumentType?: string;
  [key: string]: any;
}

/**
 * Parse XML string with error handling and validation
 */
export async function parseXML(
  xmlContent: string,
  options: XMLParseOptions = {}
): Promise<any> {
  try {
    const defaultOptions: XMLParseOptions = {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      trim: true,
      ...options,
    };

    const result = await parseStringPromise(xmlContent, defaultOptions);
    return result;
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error(
      `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract opportunities from parsed XML structure
 */
export function extractOpportunities(parsedXML: any): ParsedOpportunity[] {
  try {
    const opportunities = parsedXML?.Opportunities?.Opportunity || [];

    // Handle both single opportunity and array of opportunities
    if (!Array.isArray(opportunities)) {
      return [opportunities].filter(Boolean);
    }

    return opportunities.filter(Boolean);
  } catch (error) {
    console.error('Error extracting opportunities:', error);
    return [];
  }
}

/**
 * Safely extract text content from XML node
 */
export function extractText(node: any): string | undefined {
  if (!node) return undefined;

  // Handle different XML parsing formats
  if (typeof node === 'string') {
    return node.trim();
  }

  if (node['#text']) {
    return node['#text'].trim();
  }

  if (node._) {
    return node._.trim();
  }

  return undefined;
}

/**
 * Safely extract date from XML node
 */
export function extractDate(node: any): Date | undefined {
  const dateStr = extractText(node);
  if (!dateStr) return undefined;

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    console.warn(`Invalid date format: ${dateStr}`);
    return undefined;
  }
}

/**
 * Safely extract number from XML node
 */
export function extractNumber(node: any): number | undefined {
  const numStr = extractText(node);
  if (!numStr) return undefined;

  try {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleanAmount = numStr.replace(/[^0-9.-]/g, '');
    const amount = parseFloat(cleanAmount);

    return isNaN(amount) ? undefined : Math.round(amount);
  } catch (error) {
    console.warn(`Failed to parse number: ${numStr}`);
    return undefined;
  }
}

/**
 * Extract CFDA numbers from various XML structures
 */
export function extractCFDANumbers(node: any): string | undefined {
  if (!node) return undefined;

  // Handle different structures
  if (typeof node === 'string') {
    return node.trim();
  }

  if (node.CFDANumber) {
    if (Array.isArray(node.CFDANumber)) {
      return node.CFDANumber.join(', ');
    }
    return extractText(node.CFDANumber);
  }

  return extractText(node);
}

/**
 * Validate opportunity data structure
 */
export function validateOpportunity(opportunity: ParsedOpportunity): boolean {
  const opportunityId = extractText(opportunity.OpportunityID);
  const title = extractText(opportunity.OpportunityTitle);

  return !!(opportunityId && title);
}

/**
 * Stream XML parsing for large files (memory efficient)
 */
export function createXMLStreamParser(): {
  parser: any;
  opportunities: ParsedOpportunity[];
} {
  const opportunities: ParsedOpportunity[] = [];

  // Note: For true streaming, we'd need a different XML parser
  // This is a placeholder for future streaming implementation
  const parser = {
    write: (chunk: string) => {
      // Process chunk and extract opportunities
      console.log('Processing XML chunk...');
    },
    end: () => {
      console.log('XML stream processing complete');
    },
  };

  return { parser, opportunities };
}

/**
 * Parse XML with streaming support for large files
 */
export async function parseXMLStream(
  xmlContent: string,
  onOpportunity: (opportunity: ParsedOpportunity) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // For now, parse the entire XML and process opportunities one by one
    // In production, this could be enhanced with true streaming XML parsing
    const parsed = await parseXML(xmlContent);
    const opportunities = extractOpportunities(parsed);

    for (const opportunity of opportunities) {
      try {
        if (validateOpportunity(opportunity)) {
          onOpportunity(opportunity);
        }
      } catch (error) {
        console.warn('Error processing opportunity:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    }
  } catch (error) {
    console.error('Stream parsing error:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
    throw error;
  }
}
