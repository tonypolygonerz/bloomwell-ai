// Test script for organization API
// This simulates what the frontend form sends

const testData = {
  name: 'Test Nonprofit Organization',
  organizationType: 'nonprofit',
  mission: 'To help communities thrive',
  focusAreas: 'youth_programs,education',
  budget: 'under_100k',
  staffSize: '5',
  state: 'CA',
  ein: '',
  isVerified: false,
};

console.log('Testing organization API with data:', testData);
console.log('\nTo test this endpoint, you need to:');
console.log('1. Be logged in to the application');
console.log('2. Open browser DevTools > Console');
console.log('3. Run this code:\n');
console.log(`
fetch('/api/organization', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${JSON.stringify(testData, null, 2)})
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
`);


