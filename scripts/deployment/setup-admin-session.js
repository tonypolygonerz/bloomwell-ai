const fetch = require('node-fetch');

async function setupAdminSession() {
  console.log('🔐 Setting up admin session...');
  
  try {
    // Login as admin
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const sessionData = await loginResponse.json();
    console.log('✅ Admin login successful');
    console.log('Admin:', sessionData.admin.username);
    console.log('Token:', sessionData.token.substring(0, 50) + '...');

    // Test AI Models API
    const apiResponse = await fetch('http://localhost:3000/api/admin/ai-models', {
      headers: {
        'Authorization': `Bearer ${sessionData.token}`,
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`AI Models API failed: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    console.log('✅ AI Models API working');
    console.log('Models:', apiData.availableModels.length);

    console.log('\n🎉 Setup complete! You can now:');
    console.log('1. Go to http://localhost:3000/admin/login');
    console.log('2. Login with: admin / admin123');
    console.log('3. Navigate to http://localhost:3000/admin/ai-models');
    console.log('4. Test the toggle switches');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupAdminSession();
