/**
 * Setup Feature Flags
 * 
 * This script helps set up the feature flags in .env.local file
 * Run with: node scripts/setup-feature-flags.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');

// Feature flags with default values
const featureFlags = {
  'NEXT_PUBLIC_FEATURE_GRANTS': true,
  'NEXT_PUBLIC_FEATURE_WEBINARS': true,
  'NEXT_PUBLIC_FEATURE_CHAT': true,
  'NEXT_PUBLIC_FEATURE_ADMIN': true,
};

// Check if .env.local exists
const envExists = fs.existsSync(envPath);

// Read existing content if file exists
let existingContent = '';
if (envExists) {
  existingContent = fs.readFileSync(envPath, 'utf8');
}

// Parse existing variables
const existingVars = {};
if (existingContent) {
  existingContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        existingVars[match[1].trim()] = match[2].trim();
      }
    }
  });
}

// Merge existing vars with feature flags, prioritizing existing values
Object.keys(featureFlags).forEach(key => {
  if (existingVars[key] === undefined) {
    existingVars[key] = featureFlags[key].toString();
  }
});

// Prepare new content
let newContent = '# Feature Flags - Added by setup script\n';
Object.keys(featureFlags).forEach(key => {
  newContent += `${key}=${existingVars[key]}\n`;
});

// Add a separator and the rest of existing content (excluding feature flags)
newContent += '\n# Other environment variables\n';
if (existingContent) {
  existingContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !Object.keys(featureFlags).includes(match[1].trim())) {
        newContent += `${line}\n`;
      }
    } else if (line && !line.includes('Feature Flags')) {
      newContent += `${line}\n`;
    }
  });
}

// Write the new content to .env.local
fs.writeFileSync(envPath, newContent);

console.log(`Feature flags have been ${envExists ? 'updated' : 'added'} in .env.local file.`);
console.log('Current feature flag settings:');
Object.keys(featureFlags).forEach(key => {
  console.log(`  ${key}=${existingVars[key]}`);
});
console.log('\nTo change a feature flag, edit the .env.local file directly or run this script again.');
