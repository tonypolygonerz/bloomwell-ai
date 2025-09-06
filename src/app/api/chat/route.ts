import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory, conversationId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // For now, we'll create a mock response since we don't have Claude API key set up
    // In production, you would integrate with Claude API here
    const mockResponse = generateNonprofitResponse(message, conversationHistory)

    // Save messages to database if conversationId is provided
    if (conversationId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (user) {
        // Save user message
        await prisma.message.create({
          data: {
            content: message,
            role: 'user',
            conversationId: conversationId
          }
        })

        // Save assistant response
        await prisma.message.create({
          data: {
            content: mockResponse,
            role: 'assistant',
            conversationId: conversationId
          }
        })

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        })
      }
    }

    return NextResponse.json({ 
      response: mockResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateNonprofitResponse(message: string, conversationHistory: any[]): string {
  const lowerMessage = message.toLowerCase()
  
  // Grant finding responses
  if (lowerMessage.includes('find grants') || lowerMessage.includes('finding grants') || lowerMessage.includes('identifying and applying')) {
    return `Great question about finding grants! Here's a comprehensive guide to grant research and application:

**1. Research Strategies**
• Use grant databases: Grants.gov, Foundation Directory Online, GrantWatch
• Check federal agencies relevant to your mission
• Research local and regional foundations
• Look for corporate giving programs
• Network with other nonprofits for leads

**2. Foundation Research**
• Review foundation websites and annual reports
• Check their giving history and focus areas
• Look for geographic restrictions
• Understand their application process and deadlines
• Note their typical grant amounts

**3. Federal Grants**
• Register on Grants.gov and SAM.gov
• Review agency-specific opportunities
• Understand federal requirements and compliance
• Consider smaller federal programs for new organizations

**4. Application Strategy**
• Start with smaller, local foundations
• Build relationships before applying
• Ensure perfect alignment with funder priorities
• Follow all guidelines exactly
• Submit well before deadlines

**5. Tracking & Management**
• Use a spreadsheet or CRM to track opportunities
• Set up alerts for new opportunities
• Maintain detailed records of applications
• Follow up appropriately on submissions

Would you like me to help you develop a specific grant research strategy for your organization?`
  }

  // Starting a nonprofit responses
  if (lowerMessage.includes('starting a nonprofit') || lowerMessage.includes('new nonprofit organization') || lowerMessage.includes('key steps and requirements')) {
    return `Starting a nonprofit is an exciting but complex process! Here's a step-by-step guide:

**1. Planning & Research**
• Define your mission and vision clearly
• Research existing organizations to avoid duplication
• Identify your target population and geographic area
• Develop a business plan and sustainability model
• Consider fiscal sponsorship as an alternative

**2. Legal Structure**
• Choose your state of incorporation
• File articles of incorporation
• Apply for federal tax-exempt status (501(c)(3))
• Obtain state tax-exempt status
• Apply for necessary licenses and permits

**3. Governance Setup**
• Recruit a diverse, committed board of directors
• Develop bylaws and governance policies
• Hold your first board meeting
• Establish conflict of interest policies
• Set up proper record-keeping systems

**4. Financial Setup**
• Open a nonprofit bank account
• Set up accounting systems
• Develop a budget and financial policies
• Consider insurance needs (D&O, general liability)
• Establish fundraising policies

**5. Operations**
• Develop programs and services
• Create policies and procedures
• Hire staff or recruit volunteers
• Establish evaluation and reporting systems
• Build community relationships

**6. Compliance**
• Understand ongoing reporting requirements
• Set up proper record-keeping
• Develop compliance monitoring systems
• Plan for annual renewals and filings

What specific aspect of starting your nonprofit would you like to explore further?`
  }

  // Funding ideas responses
  if (lowerMessage.includes('funding ideas') || lowerMessage.includes('alternative revenue streams') || lowerMessage.includes('fundraising strategies')) {
    return `Here are creative funding strategies to diversify your nonprofit's revenue:

**1. Earned Income**
• Fee-for-service programs
• Consulting and training services
• Product sales (merchandise, publications)
• Facility rentals
• Event hosting and management

**2. Individual Giving**
• Monthly giving programs
• Major donor cultivation
• Planned giving and bequests
• Crowdfunding campaigns
• Peer-to-peer fundraising

**3. Corporate Partnerships**
• Corporate sponsorships
• Cause marketing partnerships
• Employee giving programs
• In-kind donations and services
• Corporate volunteer programs

**4. Foundation Funding**
• Program-specific grants
• Capacity-building grants
• Operating support grants
• Multi-year partnerships
• Collaborative grants

**5. Government Funding**
• Federal grants and contracts
• State and local government funding
• Fee-for-service contracts
• Public-private partnerships
• Economic development grants

**6. Creative Strategies**
• Social enterprise ventures
• Investment income and endowments
• Membership programs
• Special events and galas
• Online fundraising platforms

**7. Capacity Building**
• Board development for fundraising
• Staff training and development
• Technology and systems upgrades
• Marketing and communications
• Evaluation and impact measurement

Which of these funding strategies interests you most for your organization?`
  }

  // Grant writing responses
  if (lowerMessage.includes('grant') || lowerMessage.includes('funding') || lowerMessage.includes('proposal')) {
    return `Great question about grant writing! Here are some key strategies for successful grant proposals:

**1. Research & Alignment**
• Thoroughly research the funder's priorities and past grants
• Ensure your project aligns with their mission and goals
• Review their application guidelines carefully

**2. Strong Narrative**
• Start with a compelling problem statement
• Clearly articulate your solution and expected outcomes
• Include specific, measurable objectives

**3. Budget & Sustainability**
• Create a detailed, realistic budget
• Show how you'll sustain the project after funding ends
• Include matching funds or in-kind contributions

**4. Evaluation Plan**
• Define clear metrics for success
• Explain how you'll measure and report progress
• Include both quantitative and qualitative measures

Would you like me to elaborate on any of these areas or help you with a specific grant application?`
  }

  // Board governance responses
  if (lowerMessage.includes('board') || lowerMessage.includes('governance') || lowerMessage.includes('director')) {
    return `Excellent question about board governance! Here are essential best practices:

**1. Board Composition**
• Recruit diverse members with relevant skills and expertise
• Maintain clear term limits and rotation policies
• Ensure independence from management

**2. Roles & Responsibilities**
• Clearly define board vs. staff responsibilities
• Establish effective committee structures
• Maintain proper oversight of finances and operations

**3. Meetings & Communication**
• Hold regular, well-structured meetings
• Provide comprehensive materials in advance
• Maintain detailed minutes and records

**4. Legal & Ethical Standards**
• Ensure compliance with all applicable laws
• Maintain conflict of interest policies
• Regular training on fiduciary duties

**5. Strategic Planning**
• Participate in long-term strategic planning
• Monitor progress toward organizational goals
• Support executive leadership effectively

What specific aspect of board governance would you like to explore further?`
  }

  // Volunteer management responses
  if (lowerMessage.includes('volunteer') || lowerMessage.includes('retention') || lowerMessage.includes('recruitment')) {
    return `Volunteer management is crucial for nonprofit success! Here are proven strategies:

**1. Recruitment**
• Clearly define volunteer roles and expectations
• Use multiple channels (social media, community events, word-of-mouth)
• Highlight the impact volunteers will make

**2. Onboarding & Training**
• Provide comprehensive orientation
• Offer role-specific training and resources
• Assign mentors or buddies for new volunteers

**3. Recognition & Retention**
• Regularly acknowledge and appreciate volunteers
• Provide meaningful work that aligns with their interests
• Offer professional development opportunities
• Create a positive, inclusive culture

**4. Communication**
• Maintain regular, clear communication
• Provide feedback and performance reviews
• Create opportunities for volunteer input and feedback

**5. Data Management**
• Track volunteer hours and impact
• Maintain up-to-date contact information
• Monitor satisfaction and engagement levels

Would you like specific strategies for any of these areas?`
  }

  // Strategic planning responses
  if (lowerMessage.includes('strategic') || lowerMessage.includes('plan') || lowerMessage.includes('planning')) {
    return `Strategic planning is essential for nonprofit success! Here's a comprehensive approach:

**1. Assessment Phase**
• Conduct SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
• Gather input from stakeholders (board, staff, clients, community)
• Review current programs and their effectiveness

**2. Vision & Mission**
• Ensure your mission statement is clear and compelling
• Develop a vision for where you want to be in 3-5 years
• Align all activities with your core mission

**3. Goal Setting**
• Establish 3-5 major strategic goals
• Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
• Prioritize goals based on impact and feasibility

**4. Implementation Planning**
• Break goals into specific action steps
• Assign responsibilities and timelines
• Identify required resources and funding

**5. Monitoring & Evaluation**
• Establish key performance indicators (KPIs)
• Schedule regular progress reviews
• Be prepared to adjust plans as needed

**6. Communication**
• Share the plan with all stakeholders
• Create accountability systems
• Celebrate milestones and achievements

What aspect of strategic planning would you like to focus on?`
  }

  // General nonprofit management
  if (lowerMessage.includes('management') || lowerMessage.includes('leadership') || lowerMessage.includes('organization')) {
    return `Nonprofit management requires a unique blend of skills! Here are key areas to focus on:

**1. Financial Management**
• Maintain accurate financial records and reporting
• Develop diverse revenue streams
• Create and monitor budgets carefully
• Ensure compliance with financial regulations

**2. Program Development**
• Design programs that address real community needs
• Establish clear outcomes and evaluation methods
• Ensure programs align with your mission
• Seek continuous improvement through feedback

**3. Human Resources**
• Recruit and retain talented staff and volunteers
• Provide professional development opportunities
• Maintain clear policies and procedures
• Foster a positive organizational culture

**4. Marketing & Communications**
• Develop a strong brand and messaging
• Use multiple channels to reach your audience
• Tell compelling stories about your impact
• Build relationships with media and community partners

**5. Technology & Systems**
• Leverage technology to improve efficiency
• Maintain secure data management systems
• Use digital tools for fundraising and communication
• Stay current with relevant software and platforms

What specific management challenge are you facing?`
  }

  // Default response for other questions
  return `Thank you for your question! As your nonprofit AI assistant, I'm here to help with a wide range of topics including:

• **Grant Writing & Fundraising** - Proposal development, donor relations, funding strategies
• **Program Development** - Design, implementation, evaluation, and improvement
• **Board Governance** - Best practices, policies, legal compliance
• **Volunteer Management** - Recruitment, training, retention strategies
• **Strategic Planning** - Vision development, goal setting, implementation
• **Financial Management** - Budgeting, reporting, compliance
• **Marketing & Communications** - Brand development, outreach, storytelling
• **Technology & Operations** - Systems, efficiency, digital tools

Could you provide more specific details about what you'd like help with? I'm here to provide detailed, actionable guidance for your nonprofit organization.`
}
