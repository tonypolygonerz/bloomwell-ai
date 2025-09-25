#!/usr/bin/env node

/**
 * Setup script for Ollama Cloud integration
 * Helps configure API key and test the connection
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function testOllamaCloudAPI(apiKey) {
  console.log('🔍 Testing Ollama Cloud API connection...')
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-oss:20b-cloud',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message.'
        }
      ],
      stream: false
    })

    const options = {
      hostname: 'ollama.com',
      port: 443,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
          if (res.statusCode === 200) {
            console.log('✅ Ollama Cloud API connection successful!')
            console.log(`📝 Test response: ${parsed.message?.content?.substring(0, 100)}...`)
            resolve(true)
          } else {
            console.log(`❌ API test failed - Status: ${res.statusCode}`)
            console.log(`Response: ${responseData}`)
            resolve(false)
          }
        } catch (error) {
          console.log(`❌ Failed to parse response: ${error.message}`)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log(`❌ Network error: ${error.message}`)
      resolve(false)
    })

    req.write(data)
    req.end()
  })
}

async function updateEnvFile(apiKey) {
  const envPath = path.join(__dirname, '..', '.env.local')
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8')
    
    // Update or add the API key
    if (envContent.includes('OLLAMA_API_KEY=')) {
      envContent = envContent.replace(
        /OLLAMA_API_KEY=.*/,
        `OLLAMA_API_KEY=${apiKey}`
      )
    } else {
      envContent += `\nOLLAMA_API_KEY=${apiKey}\n`
    }
    
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Updated .env.local with your API key')
    return true
  } catch (error) {
    console.log(`❌ Failed to update .env.local: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Ollama Cloud Setup for Bloomwell AI\n')
  
  console.log('To get your Ollama Cloud API key:')
  console.log('1. Go to https://ollama.com')
  console.log('2. Sign in to your account')
  console.log('3. Navigate to your account settings')
  console.log('4. Generate an API key\n')
  
  const apiKey = await askQuestion('Enter your Ollama Cloud API key: ')
  
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Exiting.')
    rl.close()
    return
  }
  
  console.log('\n🔍 Testing API key...')
  const isValid = await testOllamaCloudAPI(apiKey.trim())
  
  if (isValid) {
    console.log('\n💾 Saving API key to .env.local...')
    const saved = await updateEnvFile(apiKey.trim())
    
    if (saved) {
      console.log('\n🎉 Setup complete!')
      console.log('\nNext steps:')
      console.log('1. Restart your development server: npm run dev')
      console.log('2. Visit http://localhost:3000/admin/ai-models')
      console.log('3. Test the chat functionality')
      console.log('\nYour Bloomwell AI platform now has enterprise cloud AI capabilities!')
    }
  } else {
    console.log('\n❌ Setup failed. Please check your API key and try again.')
  }
  
  rl.close()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testOllamaCloudAPI, updateEnvFile }
