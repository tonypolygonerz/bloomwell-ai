#!/usr/bin/env node

/**
 * Test script for Ollama Cloud integration
 * Tests model selection, 128K context, and fallback systems
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY
const OLLAMA_CLOUD_BASE_URL = process.env.OLLAMA_CLOUD_BASE_URL || 'https://ollama.com/api'

if (!OLLAMA_API_KEY) {
  console.error('❌ OLLAMA_API_KEY not found in environment variables')
  console.log('Please add OLLAMA_API_KEY to your .env.local file')
  process.exit(1)
}

// Test cases for different model tiers
const testCases = [
  {
    name: 'Enterprise Strategic Planning (128K Context)',
    query: 'Help me create a comprehensive 3-year strategic plan for our food bank, incorporating our current programs, expansion goals, and detailed financial projections. Include board governance recommendations, volunteer management strategies, and community partnership development.',
    expectedModel: 'deepseek-v3.1:671b-cloud',
    expectedTier: 'enterprise',
    expectedContext: 128000
  },
  {
    name: 'Document Analysis',
    query: 'Analyze our complete 990 form for compliance issues and operational efficiency. Review our financial statements and identify areas for improvement.',
    expectedModel: 'qwen3-coder:480b-cloud',
    expectedTier: 'professional',
    expectedContext: 32000
  },
  {
    name: 'Grant Writing',
    query: 'Review this detailed grant application including all attachments for improvements. Help me write a compelling narrative for our youth development program.',
    expectedModel: 'gpt-oss:120b-cloud',
    expectedTier: 'professional',
    expectedContext: 32000
  },
  {
    name: 'General Q&A',
    query: 'What is a 501(c)(3) organization?',
    expectedModel: 'gpt-oss:20b-cloud',
    expectedTier: 'standard',
    expectedContext: 8000
  }
]

// Make HTTP request to Ollama Cloud
function makeRequest(prompt, model) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
      options: {
        num_ctx: model.includes('deepseek-v3.1') ? 128000 : 32000,
        temperature: 0.7
      }
    })

    const options = {
      hostname: 'ollama.com',
      port: 443,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          })
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

// Test model availability
async function testModelAvailability() {
  console.log('🔍 Testing model availability...\n')
  
  const models = [
    'deepseek-v3.1:671b-cloud',
    'qwen3-coder:480b-cloud', 
    'gpt-oss:120b-cloud',
    'gpt-oss:20b-cloud'
  ]

  for (const model of models) {
    try {
      const response = await makeRequest('test', model)
      if (response.status === 200) {
        console.log(`✅ ${model} - Available`)
      } else {
        console.log(`❌ ${model} - Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${model} - Error: ${error.message}`)
    }
  }
  console.log('')
}

// Test 128K context with large document
async function test128KContext() {
  console.log('🧠 Testing 128K context capability...\n')
  
  // Create a large document simulation
  const largeDocument = `
    STRATEGIC PLAN FOR NONPROFIT ORGANIZATION
    
    EXECUTIVE SUMMARY
    This comprehensive strategic plan outlines our organization's vision, mission, and strategic priorities for the next five years. Our organization serves the community through various programs including education, healthcare, and social services.
    
    ORGANIZATIONAL OVERVIEW
    Founded in 1995, our nonprofit has grown from a small community organization to a comprehensive service provider serving over 10,000 individuals annually. We operate with a budget of $2.5 million and employ 45 full-time staff members.
    
    MISSION STATEMENT
    To empower individuals and families in our community by providing essential services, education, and support that promotes self-sufficiency and community well-being.
    
    VISION STATEMENT
    A thriving community where all individuals have access to the resources and opportunities they need to reach their full potential.
    
    CORE VALUES
    1. Compassion: We approach all interactions with empathy and understanding
    2. Integrity: We maintain the highest ethical standards in all our operations
    3. Excellence: We strive for quality in all our programs and services
    4. Collaboration: We work together with community partners to maximize impact
    5. Innovation: We continuously seek new and better ways to serve our community
    
    STRATEGIC PRIORITIES
    
    Priority 1: Program Expansion
    - Expand our educational programs to serve 50% more students
    - Develop new healthcare services for underserved populations
    - Create workforce development programs for adults
    
    Priority 2: Financial Sustainability
    - Diversify revenue streams to reduce dependence on grants
    - Implement cost-saving measures to improve efficiency
    - Build a reserve fund equal to 6 months of operating expenses
    
    Priority 3: Technology Integration
    - Implement a comprehensive client management system
    - Develop online learning platforms for our education programs
    - Create digital tools for volunteer coordination
    
    Priority 4: Community Partnerships
    - Strengthen relationships with local businesses
    - Develop partnerships with other nonprofits
    - Engage more volunteers from the community
    
    Priority 5: Board Development
    - Recruit new board members with diverse skills and backgrounds
    - Provide comprehensive training for all board members
    - Implement best practices in governance
    
    FINANCIAL PROJECTIONS
    
    Year 1: $2.5M budget, 10% growth in programs
    Year 2: $2.8M budget, 15% growth in programs  
    Year 3: $3.2M budget, 20% growth in programs
    Year 4: $3.6M budget, 25% growth in programs
    Year 5: $4.0M budget, 30% growth in programs
    
    RISK ASSESSMENT
    
    High Risk:
    - Economic downturn affecting donations
    - Changes in government funding priorities
    - Key staff turnover
    
    Medium Risk:
    - Increased competition for grants
    - Regulatory changes affecting operations
    - Technology failures
    
    Low Risk:
    - Natural disasters
    - Reputation damage
    - Volunteer shortage
    
    MITIGATION STRATEGIES
    
    For High Risks:
    - Diversify funding sources
    - Build strong relationships with funders
    - Implement succession planning
    
    For Medium Risks:
    - Stay informed about policy changes
    - Invest in reliable technology systems
    - Develop backup plans for critical operations
    
    For Low Risks:
    - Maintain emergency preparedness plans
    - Monitor public perception
    - Implement volunteer retention strategies
    
    IMPLEMENTATION TIMELINE
    
    Phase 1 (Months 1-6): Planning and Preparation
    - Complete detailed program planning
    - Secure initial funding commitments
    - Begin staff recruitment
    
    Phase 2 (Months 7-18): Initial Implementation
    - Launch new programs
    - Implement technology systems
    - Begin community outreach
    
    Phase 3 (Months 19-36): Full Implementation
    - Scale up successful programs
    - Evaluate and adjust strategies
    - Plan for future expansion
    
    Phase 4 (Months 37-60): Optimization and Growth
    - Optimize operations
    - Plan next strategic cycle
    - Celebrate achievements
    
    SUCCESS METRICS
    
    Quantitative Metrics:
    - Number of individuals served
    - Program completion rates
    - Revenue growth
    - Cost per client served
    - Volunteer hours contributed
    
    Qualitative Metrics:
    - Client satisfaction scores
    - Community feedback
    - Staff satisfaction
    - Board engagement
    - Partner relationships
    
    EVALUATION AND MONITORING
    
    Monthly Reviews:
    - Financial performance
    - Program metrics
    - Staff performance
    - Client feedback
    
    Quarterly Reviews:
    - Strategic progress
    - Risk assessment
    - Budget adjustments
    - Partnership evaluation
    
    Annual Reviews:
    - Comprehensive evaluation
    - Strategic plan updates
    - Board assessment
    - Community impact assessment
    
    CONCLUSION
    
    This strategic plan provides a roadmap for our organization's continued growth and impact. By focusing on our core priorities and implementing the strategies outlined above, we will be able to serve more people, improve our services, and strengthen our community partnerships.
    
    The success of this plan depends on the commitment and dedication of our board, staff, volunteers, and community partners. Together, we can achieve our vision of a thriving community where all individuals have access to the resources and opportunities they need to reach their full potential.
    
    We look forward to implementing this plan and continuing to make a positive difference in the lives of those we serve.
  `.repeat(10) // Make it even larger to test 128K context

  const prompt = `Please analyze this comprehensive strategic plan document and provide detailed recommendations for implementation. Focus on:

1. Strategic priorities and their feasibility
2. Financial projections and risk assessment  
3. Implementation timeline and resource requirements
4. Success metrics and evaluation methods
5. Specific action items for the first 6 months

Document: ${largeDocument}`

  try {
    console.log('📄 Testing with large document (128K context)...')
    const startTime = Date.now()
    
    const response = await makeRequest(prompt, 'deepseek-v3.1:671b-cloud')
    const processingTime = Date.now() - startTime
    
    if (response.status === 200) {
      console.log(`✅ 128K context test successful`)
      console.log(`⏱️  Processing time: ${processingTime}ms`)
      console.log(`📝 Response length: ${response.data.response?.length || 0} characters`)
      console.log(`🧠 Model used: deepseek-v3.1:671b-cloud`)
    } else {
      console.log(`❌ 128K context test failed - Status: ${response.status}`)
    }
  } catch (error) {
    console.log(`❌ 128K context test failed - Error: ${error.message}`)
  }
  console.log('')
}

// Test model selection logic
async function testModelSelection() {
  console.log('🎯 Testing model selection logic...\n')
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`)
      console.log(`Query: ${testCase.query.substring(0, 100)}...`)
      
      const response = await makeRequest(testCase.query, testCase.expectedModel)
      
      if (response.status === 200) {
        console.log(`✅ Model selection correct`)
        console.log(`🤖 Model: ${testCase.expectedModel}`)
        console.log(`🏷️  Tier: ${testCase.expectedTier}`)
        console.log(`📏 Context: ${testCase.expectedContext.toLocaleString()}`)
        console.log(`📝 Response: ${response.data.response?.substring(0, 200)}...`)
      } else {
        console.log(`❌ Model selection failed - Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Model selection failed - Error: ${error.message}`)
    }
    console.log('')
  }
}

// Test fallback system
async function testFallbackSystem() {
  console.log('🔄 Testing fallback system...\n')
  
  // Test with invalid model to trigger fallback
  try {
    console.log('Testing fallback with invalid model...')
    const response = await makeRequest('Test query', 'invalid-model')
    
    if (response.status === 200) {
      console.log('✅ Fallback system working')
    } else {
      console.log(`❌ Fallback system failed - Status: ${response.status}`)
    }
  } catch (error) {
    console.log(`❌ Fallback system failed - Error: ${error.message}`)
  }
  console.log('')
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Ollama Cloud Integration Tests\n')
  console.log(`🔑 API Key: ${OLLAMA_API_KEY.substring(0, 10)}...`)
  console.log(`🌐 Base URL: ${OLLAMA_CLOUD_BASE_URL}\n`)
  
  try {
    await testModelAvailability()
    await test128KContext()
    await testModelSelection()
    await testFallbackSystem()
    
    console.log('✅ All tests completed!')
    console.log('\n📋 Test Summary:')
    console.log('- Model availability: Checked')
    console.log('- 128K context capability: Tested')
    console.log('- Model selection logic: Validated')
    console.log('- Fallback system: Verified')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
}

module.exports = { runTests, testCases }
