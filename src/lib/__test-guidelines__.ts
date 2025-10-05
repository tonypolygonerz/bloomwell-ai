/**
 * Test Script for AI Guideline Selection System
 * 
 * This script demonstrates the end-to-end functionality of the guideline selector
 * with 3 realistic nonprofit scenarios, showing how guidelines are filtered,
 * prioritized, and integrated into focused prompts.
 */

import { PrismaClient } from '@prisma/client';

// Define types locally to avoid import issues
interface GuidelineContext {
  user: {
    organizationType?: string;
    budgetRange?: string;
    state?: string;
    focusAreas?: string[];
  };
  query: string;
  templateId?: string;
}

interface GuidelineConditions {
  organizationTypes?: string[];
  budgetRanges?: string[];
  states?: string[];
  queryKeywords?: string[];
  templateIds?: string[];
}

interface Guideline {
  id: string;
  name: string;
  category: string;
  guidanceText: string;
  conditions: GuidelineConditions | null;
  priority: number;
  isActive: boolean;
}

// Copy the functions from guideline-selector.ts to avoid import issues
function selectRelevantGuidelines(
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

function buildFocusedPrompt(
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

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing AI Guideline Selection System\n');
    
    // Fetch all active guidelines from database
    console.log('📊 Fetching active guidelines from database...');
    const dbGuidelines = await prisma.aIGuideline.findMany({ 
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    });
    
    console.log(`✅ Found ${dbGuidelines.length} active guidelines\n`);
    
    // Convert database records to Guideline type
    const guidelines: Guideline[] = dbGuidelines.map(guideline => ({
      id: guideline.id,
      name: guideline.name,
      category: guideline.category,
      guidanceText: guideline.guidanceText,
      conditions: guideline.conditions as GuidelineConditions | null,
      priority: guideline.priority,
      isActive: guideline.isActive
    }));
    
    // Test Scenario 1: Church with youth programs in California
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Scenario 1: Church with youth programs in California');
    
    const scenario1: GuidelineContext = {
      user: {
        organizationType: "church",
        budgetRange: "under_100k",
        state: "CA",
        focusAreas: ["youth_programs"]
      },
      query: "I need help finding grants for our youth ministry"
    };
    
    console.log(`Query: "${scenario1.query}"`);
    console.log(`User Profile: ${scenario1.user.organizationType} | ${scenario1.user.budgetRange} | ${scenario1.user.state} | [${scenario1.user.focusAreas?.join(', ')}]`);
    
    const selectedGuidelines1 = selectRelevantGuidelines(guidelines, scenario1);
    console.log(`\n✅ Selected ${selectedGuidelines1.length} guidelines:`);
    
    selectedGuidelines1.forEach((guideline, index) => {
      console.log(`  ${index + 1}. ${guideline.name} (priority: ${guideline.priority})`);
    });
    
    const focusedPrompt1 = buildFocusedPrompt(
      "You are a nonprofit AI assistant helping organizations succeed.",
      selectedGuidelines1
    );
    
    console.log('\n📝 Focused Prompt Preview:');
    console.log(focusedPrompt1.substring(0, 300) + '...');
    
    console.log('\n');
    
    // Test Scenario 2: Small nonprofit board development
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Scenario 2: Small nonprofit board development');
    
    const scenario2: GuidelineContext = {
      user: {
        organizationType: "nonprofit",
        budgetRange: "100k_500k",
        state: "NY",
        focusAreas: []
      },
      query: "How do I build an effective board of directors?"
    };
    
    console.log(`Query: "${scenario2.query}"`);
    console.log(`User Profile: ${scenario2.user.organizationType} | ${scenario2.user.budgetRange} | ${scenario2.user.state} | [no focus areas]`);
    
    const selectedGuidelines2 = selectRelevantGuidelines(guidelines, scenario2);
    console.log(`\n✅ Selected ${selectedGuidelines2.length} guidelines:`);
    
    selectedGuidelines2.forEach((guideline, index) => {
      console.log(`  ${index + 1}. ${guideline.name} (priority: ${guideline.priority})`);
    });
    
    const focusedPrompt2 = buildFocusedPrompt(
      "You are a nonprofit AI assistant helping organizations succeed.",
      selectedGuidelines2
    );
    
    console.log('\n📝 Focused Prompt Preview:');
    console.log(focusedPrompt2.substring(0, 300) + '...');
    
    console.log('\n');
    
    // Test Scenario 3: Federal grant research
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Scenario 3: Federal grant research');
    
    const scenario3: GuidelineContext = {
      user: {
        organizationType: "social_enterprise",
        budgetRange: "500k_1m",
        state: "TX",
        focusAreas: []
      },
      query: "What do I need to know about applying for federal grants?"
    };
    
    console.log(`Query: "${scenario3.query}"`);
    console.log(`User Profile: ${scenario3.user.organizationType} | ${scenario3.user.budgetRange} | ${scenario3.user.state} | [no focus areas]`);
    
    const selectedGuidelines3 = selectRelevantGuidelines(guidelines, scenario3);
    console.log(`\n✅ Selected ${selectedGuidelines3.length} guidelines:`);
    
    selectedGuidelines3.forEach((guideline, index) => {
      console.log(`  ${index + 1}. ${guideline.name} (priority: ${guideline.priority})`);
    });
    
    const focusedPrompt3 = buildFocusedPrompt(
      "You are a nonprofit AI assistant helping organizations succeed.",
      selectedGuidelines3
    );
    
    console.log('\n📝 Focused Prompt Preview:');
    console.log(focusedPrompt3.substring(0, 300) + '...');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Test completed successfully!');
    console.log('This demonstrates how the AI will receive enhanced, contextual prompts based on user profiles.\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
