const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: "Launch My Nonprofit",
    description: "A comprehensive guide to starting your nonprofit organization from scratch, including legal requirements, board formation, and initial operations setup.",
    category: "startup",
    estimatedTime: 8,
    difficulty: "beginner",
    prerequisites: [
      { id: "basic-knowledge", name: "Basic understanding of nonprofit sector", required: true },
      { id: "time-commitment", name: "8-10 hours available", required: true }
    ],
    outcomes: [
      { id: "legal-entity", title: "Legal Entity Formation", description: "Complete nonprofit incorporation process", measurable: true },
      { id: "board-setup", title: "Board of Directors", description: "Establish initial board structure", measurable: true },
      { id: "mission-statement", title: "Mission Statement", description: "Develop clear organizational mission", measurable: true },
      { id: "bylaws", title: "Bylaws and Policies", description: "Create governance documents", measurable: true }
    ],
    steps: [
      {
        stepNumber: 1,
        questionKey: "organization_name",
        questionText: "What is the name of your nonprofit organization?",
        questionType: "text",
        dataType: "string",
        isRequired: true,
        helpText: "Choose a name that reflects your mission and is available for use.",
        order: 1
      },
      {
        stepNumber: 2,
        questionKey: "mission_statement",
        questionText: "Describe your organization's mission statement. What problem are you trying to solve?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "A clear mission statement helps guide all organizational decisions and activities.",
        order: 2
      },
      {
        stepNumber: 3,
        questionKey: "target_population",
        questionText: "Who will your organization serve? Describe your target population.",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Be specific about the demographics and needs of your target population.",
        order: 3
      },
      {
        stepNumber: 4,
        questionKey: "geographic_area",
        questionText: "What geographic area will your organization serve?",
        questionType: "text",
        dataType: "string",
        isRequired: true,
        helpText: "Specify the city, county, state, or region you plan to serve.",
        order: 4
      },
      {
        stepNumber: 5,
        questionKey: "board_members",
        questionText: "Do you have potential board members identified? List their names and qualifications.",
        questionType: "textarea",
        dataType: "string",
        isRequired: false,
        helpText: "Board members should bring diverse skills and represent your community.",
        order: 5
      }
    ]
  },
  {
    name: "Grant Readiness Assessment",
    description: "Evaluate your organization's readiness to apply for and manage grants effectively.",
    category: "funding",
    estimatedTime: 4,
    difficulty: "intermediate",
    prerequisites: [
      { id: "established-org", name: "Established nonprofit organization", required: true },
      { id: "basic-docs", name: "Basic organizational documents", required: true }
    ],
    outcomes: [
      { id: "readiness-score", title: "Grant Readiness Score", description: "Comprehensive assessment of grant readiness", measurable: true },
      { id: "improvement-plan", title: "Improvement Plan", description: "Action plan for grant readiness improvements", measurable: true },
      { id: "document-checklist", title: "Document Checklist", description: "List of required documents for grant applications", measurable: true }
    ],
    steps: [
      {
        stepNumber: 1,
        questionKey: "org_structure",
        questionText: "Describe your organization's current structure and governance.",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Include information about your board, staff, and organizational hierarchy.",
        order: 1
      },
      {
        stepNumber: 2,
        questionKey: "financial_management",
        questionText: "How does your organization currently manage finances?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Describe your accounting systems, financial controls, and reporting processes.",
        order: 2
      },
      {
        stepNumber: 3,
        questionKey: "program_evaluation",
        questionText: "How do you currently evaluate your programs and measure impact?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Funders want to see evidence of program effectiveness and impact measurement.",
        order: 3
      },
      {
        stepNumber: 4,
        questionKey: "grant_experience",
        questionText: "What is your organization's experience with grants?",
        questionType: "select",
        dataType: "string",
        isRequired: true,
        options: [
          { value: "none", label: "No grant experience" },
          { value: "limited", label: "Limited experience (1-3 grants)" },
          { value: "moderate", label: "Moderate experience (4-10 grants)" },
          { value: "extensive", label: "Extensive experience (10+ grants)" }
        ],
        helpText: "Be honest about your current level of grant experience.",
        order: 4
      }
    ]
  },
  {
    name: "Board Development & Governance",
    description: "Strengthen your board of directors and improve organizational governance practices.",
    category: "governance",
    estimatedTime: 6,
    difficulty: "intermediate",
    prerequisites: [
      { id: "existing-board", name: "Existing board of directors", required: true },
      { id: "governance-docs", name: "Basic governance documents", required: false }
    ],
    outcomes: [
      { id: "board-assessment", title: "Board Assessment", description: "Comprehensive evaluation of board effectiveness", measurable: true },
      { id: "governance-policies", title: "Governance Policies", description: "Updated governance policies and procedures", measurable: true },
      { id: "board-development-plan", title: "Board Development Plan", description: "Strategic plan for board improvement", measurable: true }
    ],
    steps: [
      {
        stepNumber: 1,
        questionKey: "board_composition",
        questionText: "Describe your current board composition. How many members do you have and what are their backgrounds?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Include information about board diversity, skills, and experience.",
        order: 1
      },
      {
        stepNumber: 2,
        questionKey: "board_meetings",
        questionText: "How often does your board meet and what is the typical meeting structure?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Describe meeting frequency, agenda structure, and decision-making processes.",
        order: 2
      },
      {
        stepNumber: 3,
        questionKey: "board_roles",
        questionText: "Are board roles and responsibilities clearly defined?",
        questionType: "select",
        dataType: "string",
        isRequired: true,
        options: [
          { value: "yes", label: "Yes, clearly defined" },
          { value: "partially", label: "Partially defined" },
          { value: "no", label: "No, not clearly defined" }
        ],
        helpText: "Board members should understand their specific roles and responsibilities.",
        order: 3
      },
      {
        stepNumber: 4,
        questionKey: "board_evaluation",
        questionText: "How do you currently evaluate board performance?",
        questionType: "textarea",
        dataType: "string",
        isRequired: false,
        helpText: "Regular board evaluation helps identify areas for improvement.",
        order: 4
      }
    ]
  },
  {
    name: "Strategic Planning Workshop",
    description: "Develop a comprehensive strategic plan for your nonprofit organization.",
    category: "operations",
    estimatedTime: 10,
    difficulty: "advanced",
    prerequisites: [
      { id: "established-org", name: "Established nonprofit organization", required: true },
      { id: "board-commitment", name: "Board commitment to strategic planning", required: true },
      { id: "stakeholder-input", name: "Access to key stakeholders", required: true }
    ],
    outcomes: [
      { id: "strategic-plan", title: "Strategic Plan", description: "Comprehensive 3-5 year strategic plan", measurable: true },
      { id: "implementation-plan", title: "Implementation Plan", description: "Detailed plan for executing the strategy", measurable: true },
      { id: "performance-metrics", title: "Performance Metrics", description: "Key performance indicators and measurement systems", measurable: true }
    ],
    steps: [
      {
        stepNumber: 1,
        questionKey: "current_situation",
        questionText: "Describe your organization's current situation. What are your strengths, weaknesses, opportunities, and threats?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Conduct a SWOT analysis to understand your current position.",
        order: 1
      },
      {
        stepNumber: 2,
        questionKey: "vision_statement",
        questionText: "What is your organization's vision for the future? Where do you want to be in 5 years?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "A vision statement describes your desired future state.",
        order: 2
      },
      {
        stepNumber: 3,
        questionKey: "strategic_goals",
        questionText: "What are your top 3-5 strategic goals for the next 3-5 years?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Strategic goals should be specific, measurable, and aligned with your mission.",
        order: 3
      },
      {
        stepNumber: 4,
        questionKey: "resource_needs",
        questionText: "What resources will you need to achieve your strategic goals?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Consider financial, human, and other resources needed.",
        order: 4
      },
      {
        stepNumber: 5,
        questionKey: "success_metrics",
        questionText: "How will you measure success? What key performance indicators will you track?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Define specific metrics to track progress toward your goals.",
        order: 5
      }
    ]
  },
  {
    name: "Fundraising Strategy Development",
    description: "Create a comprehensive fundraising strategy to diversify revenue streams and increase funding.",
    category: "funding",
    estimatedTime: 7,
    difficulty: "intermediate",
    prerequisites: [
      { id: "mission-clarity", name: "Clear mission and programs", required: true },
      { id: "financial-records", name: "Organized financial records", required: true }
    ],
    outcomes: [
      { id: "fundraising-strategy", title: "Fundraising Strategy", description: "Comprehensive fundraising plan", measurable: true },
      { id: "revenue-diversification", title: "Revenue Diversification", description: "Plan for diversifying revenue streams", measurable: true },
      { id: "donor-engagement", title: "Donor Engagement Plan", description: "Strategy for donor cultivation and stewardship", measurable: true }
    ],
    steps: [
      {
        stepNumber: 1,
        questionKey: "current_funding",
        questionText: "What are your current sources of funding? How much do you raise annually?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Include grants, donations, earned income, and other revenue sources.",
        order: 1
      },
      {
        stepNumber: 2,
        questionKey: "funding_goals",
        questionText: "What are your fundraising goals for the next year?",
        questionType: "text",
        dataType: "string",
        isRequired: true,
        helpText: "Set specific, measurable fundraising targets.",
        order: 2
      },
      {
        stepNumber: 3,
        questionKey: "donor_base",
        questionText: "Describe your current donor base. Who are your major supporters?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Include information about individual donors, foundations, and corporate supporters.",
        order: 3
      },
      {
        stepNumber: 4,
        questionKey: "fundraising_capacity",
        questionText: "What is your current fundraising capacity? Do you have dedicated staff or volunteers?",
        questionType: "textarea",
        dataType: "string",
        isRequired: true,
        helpText: "Assess your human resources for fundraising activities.",
        order: 4
      }
    ]
  }
];

async function seedTemplates() {
  try {
    console.log('Starting template seeding...');

    for (const templateData of sampleTemplates) {
      console.log(`Creating template: ${templateData.name}`);

      // Create the template
      const template = await prisma.projectTemplate.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          estimatedTime: templateData.estimatedTime,
          difficulty: templateData.difficulty,
          prerequisites: JSON.stringify(templateData.prerequisites),
          outcomes: JSON.stringify(templateData.outcomes),
          isActive: true,
          isPublic: true,
        },
      });

      console.log(`Created template with ID: ${template.id}`);

      // Create the steps
      for (const stepData of templateData.steps) {
        const step = await prisma.projectStep.create({
          data: {
            templateId: template.id,
            stepNumber: stepData.stepNumber,
            questionKey: stepData.questionKey,
            questionText: stepData.questionText,
            questionType: stepData.questionType,
            dataType: stepData.dataType,
            isRequired: stepData.isRequired,
            helpText: stepData.helpText,
            options: stepData.options ? JSON.stringify(stepData.options) : null,
            order: stepData.order,
            isActive: true,
          },
        });

        console.log(`Created step ${stepData.stepNumber}: ${stepData.questionKey}`);
      }
    }

    console.log('Template seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedTemplates()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
