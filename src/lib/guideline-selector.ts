/**
 * Guideline Selector Utility
 * 
 * Provides contextual AI prompt enhancement by filtering and applying
 * organization-specific guidelines based on user context and query content.
 */

export interface GuidelineContext {
  user: {
    organizationType?: string;
    budgetRange?: string;
    state?: string;
    focusAreas?: string[];
  };
  query: string;
  templateId?: string;
}

export interface GuidelineConditions {
  organizationTypes?: string[];
  budgetRanges?: string[];
  states?: string[];
  queryKeywords?: string[];
  templateIds?: string[];
}

export interface Guideline {
  id: string;
  name: string;
  category: string;
  guidanceText: string;
  conditions: GuidelineConditions | null;
  priority: number;
  isActive: boolean;
}

/**
 * Filters guidelines based on context conditions and returns top 5 by priority
 */
export function selectRelevantGuidelines(
  guidelines: Guideline[],
  context: GuidelineContext
): Guideline[] {
  // Filter out inactive guidelines
  const activeGuidelines = guidelines.filter(guideline => guideline.isActive);

  // Filter guidelines that match context conditions
  const relevantGuidelines = activeGuidelines.filter(guideline => {
    const conditions = guideline.conditions;
    
    // If no conditions, always include
    if (!conditions) {
      return true;
    }

    // Check organization type condition
    if (conditions.organizationTypes && conditions.organizationTypes.length > 0) {
      if (!context.user.organizationType || 
          !conditions.organizationTypes.includes(context.user.organizationType)) {
        return false;
      }
    }

    // Check budget range condition
    if (conditions.budgetRanges && conditions.budgetRanges.length > 0) {
      if (!context.user.budgetRange || 
          !conditions.budgetRanges.includes(context.user.budgetRange)) {
        return false;
      }
    }

    // Check state condition
    if (conditions.states && conditions.states.length > 0) {
      if (!context.user.state || 
          !conditions.states.includes(context.user.state)) {
        return false;
      }
    }

    // Check query keywords condition (case-insensitive)
    if (conditions.queryKeywords && conditions.queryKeywords.length > 0) {
      const queryLower = context.query.toLowerCase();
      const hasMatchingKeyword = conditions.queryKeywords.some(keyword =>
        queryLower.includes(keyword.toLowerCase())
      );
      if (!hasMatchingKeyword) {
        return false;
      }
    }

    // Check template ID condition
    if (conditions.templateIds && conditions.templateIds.length > 0) {
      if (!context.templateId || 
          !conditions.templateIds.includes(context.templateId)) {
        return false;
      }
    }

    return true;
  });

  // Sort by priority (descending) and return top 5
  return relevantGuidelines
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}

/**
 * Builds a focused prompt by appending context-specific guidance
 */
export function buildFocusedPrompt(
  basePrompt: string,
  selectedGuidelines: Guideline[]
): string {
  // If no guidelines selected, return base prompt unchanged
  if (!selectedGuidelines || selectedGuidelines.length === 0) {
    return basePrompt;
  }

  // Build the context-specific guidance section
  const guidanceSection = "\n\nCONTEXT-SPECIFIC GUIDANCE (Priority Order):\n";
  
  const guidanceItems = selectedGuidelines
    .map((guideline, index) => `${index + 1}. ${guideline.guidanceText}`)
    .join("\n");

  return basePrompt + guidanceSection + guidanceItems;
}
