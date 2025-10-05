// Test script for Ollama Web Search API
const API_KEY = '66f161a3bf6f41b7b73c12b2c3a86a89.AdMxZnAf2gGptgQHTg6QiND-';

async function testWebSearch() {
  console.log('Testing Ollama Web Search API...\n');
  
  try {
    const response = await fetch('https://ollama.com/api/web_search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'nonprofit grant opportunities 2025',
        max_results: 3
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Web Search Test PASSED\n');
    console.log('Results:', data.results.length);
    console.log('\nFirst Result:');
    console.log('Title:', data.results[0].title);
    console.log('URL:', data.results[0].url);
    console.log('Content Preview:', data.results[0].content.substring(0, 150) + '...');
    console.log('\n✅ Ollama Web Search API is working correctly!');
    
  } catch (error) {
    console.error('❌ Web Search Test FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testWebSearch();
