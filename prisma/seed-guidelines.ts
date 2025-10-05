/**
 * Seed Script: AI Guidelines
 * 
 * Populates the AIGuideline table with comprehensive nonprofit-focused guidelines
 * that provide contextual AI assistance based on organization type, budget, location,
 * and query content.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * AI Guidelines data for seeding
 */
const guidelinesData = [
  {
    name: "Church Grant Strategy",
    category: "grant_strategy",
    conditions: {
      organizationTypes: ["church", "faith_based"],
      queryKeywords: ["grant", "funding", "donation"]
    },
    priority: 8,
    guidanceText: "For faith-based organizations:\n- Emphasize mission-driven language and spiritual impact in proposals\n- Highlight community service, relationship-building, and values alignment\n- Reference denominational funding sources and interfaith collaboration\n- Focus on demonstrating measurable community outcomes\n- Mention any partnerships with secular organizations for broader appeal",
    isActive: true
  },
  {
    name: "Small Budget Board Governance",
    category: "board_development",
    conditions: {
      budgetRanges: ["under_100k", "100k_500k"],
      queryKeywords: ["board", "governance", "volunteer"]
    },
    priority: 7,
    guidanceText: "For smaller organizations:\n- Recommend volunteer board structure with 5-7 committed members\n- Focus on recruiting board members with specific needed skills (legal, finance, fundraising, program expertise)\n- Emphasize time commitment over financial contribution\n- Provide guidance on clear role definitions and term limits\n- Suggest quarterly meetings with strong agenda preparation",
    isActive: true
  },
  {
    name: "California Compliance Requirements",
    category: "compliance",
    conditions: {
      states: ["CA", "California"],
      queryKeywords: ["compliance", "registration", "legal", "990", "filing"]
    },
    priority: 9,
    guidanceText: "California-specific requirements:\n- Must register with CA Attorney General if soliciting donations ($25,000+ threshold)\n- Annual Form RRF-1 required for charitable organizations\n- Form CT-1 for charitable trusts\n- CFRI (California Forms for Registry Information) for online filing\n- Direct link: https://oag.ca.gov/charities\n- Also file Franchise Tax Board Form 199 for state tax exemption",
    isActive: true
  },
  {
    name: "Federal Grant Application Strategy",
    category: "grant_strategy",
    conditions: {
      queryKeywords: ["federal grant", "government funding", "grants.gov", "federal"]
    },
    priority: 10,
    guidanceText: "Federal grant applications require:\n- SAM.gov registration (allow 4-6 weeks for processing)\n- DUNS number from Dun & Bradstreet (now UEI number)\n- Strong evaluation plan with measurable outcomes and evidence-based practices\n- Detailed budget justification showing cost-effectiveness\n- Letters of support from community partners\n- Clear sustainability plan beyond the grant period\n- Reference our database of 73,000+ federal grant opportunities for targeted matches",
    isActive: true
  },
  {
    name: "Youth Program Development",
    category: "program_development",
    conditions: {
      focusAreas: ["youth_programs", "education", "youth"],
      queryKeywords: ["program", "youth", "children", "students"]
    },
    priority: 7,
    guidanceText: "Youth program best practices:\n- Develop measurable outcomes aligned with developmental milestones\n- Implement comprehensive safety protocols and background checks for all volunteers\n- Create strong parent communication systems and feedback mechanisms\n- Plan for program sustainability beyond initial grant funding\n- Document success stories and impact data for future funding applications\n- Consider partnerships with schools and community centers for reach",
    isActive: true
  },
  {
    name: "Strategic Planning Fundamentals",
    category: "strategic_planning",
    conditions: {
      queryKeywords: ["strategic plan", "mission", "vision", "planning", "goals"]
    },
    priority: 6,
    guidanceText: "Strategic planning fundamentals:\n- Conduct thorough SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)\n- Gather stakeholder input from board, staff, volunteers, and community members\n- Set 3-5 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)\n- Plan for 3-5 year timeline with annual review points\n- Ensure board approval and ownership of the plan\n- Build in flexibility for adapting to changing circumstances",
    isActive: true
  }
];

/**
 * Main seeding function
 */
async function seedGuidelines() {
  try {
    console.log('🌱 Starting AI Guidelines seeding...');
    
    // Clear existing guidelines to avoid duplicates
    console.log('🧹 Clearing existing guidelines...');
    await prisma.aIGuideline.deleteMany({});
    console.log('✅ Existing guidelines cleared');
    
    // Create each guideline
    console.log(`📝 Creating ${guidelinesData.length} guidelines...`);
    
    for (let i = 0; i < guidelinesData.length; i++) {
      const guidelineData = guidelinesData[i];
      
      try {
        const createdGuideline = await prisma.aIGuideline.create({
          data: {
            name: guidelineData.name,
            category: guidelineData.category,
            conditions: guidelineData.conditions,
            priority: guidelineData.priority,
            guidanceText: guidelineData.guidanceText,
            isActive: guidelineData.isActive
          }
        });
        
        console.log(`✅ [${i + 1}/${guidelinesData.length}] Created: ${createdGuideline.name} (Priority: ${createdGuideline.priority})`);
      } catch (error) {
        console.error(`❌ Failed to create guideline "${guidelineData.name}":`, error);
        throw error;
      }
    }
    
    // Verify creation
    const totalGuidelines = await prisma.aIGuideline.count();
    console.log(`🎉 Seeding completed! Total guidelines in database: ${totalGuidelines}`);
    
    // Display summary by category
    const guidelinesByCategory = await prisma.aIGuideline.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 Guidelines by Category:');
    guidelinesByCategory.forEach(group => {
      console.log(`   ${group.category}: ${group._count.id} guidelines`);
    });
    
  } catch (error) {
    console.error('💥 Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Execute seeding if run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGuidelines()
    .then(() => {
      console.log('✨ Seeding script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding script failed:', error);
      process.exit(1);
    });
}

export { seedGuidelines };
