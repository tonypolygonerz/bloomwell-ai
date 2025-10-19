#!/usr/bin/env node

/**
 * Feature Flag Management Script
 * 
 * This script allows enabling/disabling features in different environments.
 * It can be used both by the CI/CD pipeline and manually by developers.
 * 
 * Usage:
 *   npm run deploy:disable-feature -- --feature=grants --env=production
 *   npm run deploy:enable-feature -- --feature=webinars --env=staging
 *   npm run deploy:set-feature-flags -- --env=production
 */

const fs = require('fs');
const path = require('path');
const { execSync: _execSync } = require('child_process');
const { program } = require('commander');

// Define available features
const AVAILABLE_FEATURES = ['grants', 'webinars', 'chat', 'pdf_processing', 'subscription'];

// Define available environments
const AVAILABLE_ENVIRONMENTS = ['development', 'staging', 'production'];

// Parse command line arguments
program
  .option('--feature <feature>', 'Feature to enable/disable')
  .option('--env <environment>', 'Environment to target', 'production')
  .option('--enable', 'Enable the feature (default)')
  .option('--disable', 'Disable the feature')
  .option('--reset', 'Reset all features to their default state')
  .parse(process.argv);

const options = program.opts();

// Validate environment
if (!AVAILABLE_ENVIRONMENTS.includes(options.env)) {
  console.error(`Error: Invalid environment "${options.env}". Available environments: ${AVAILABLE_ENVIRONMENTS.join(', ')}`);
  process.exit(1);
}

// Validate feature if specified
if (options.feature && !AVAILABLE_FEATURES.includes(options.feature)) {
  console.error(`Error: Invalid feature "${options.feature}". Available features: ${AVAILABLE_FEATURES.join(', ')}`);
  process.exit(1);
}

// Determine the environment file path
const envFilePath = path.resolve(process.cwd(), `.env.${options.env}`);
const envExamplePath = path.resolve(process.cwd(), `.env.example`);

// Create the environment file if it doesn't exist
if (!fs.existsSync(envFilePath)) {
  console.log(`Creating ${options.env} environment file...`);
  
  // If .env.example exists, copy it as a starting point
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envFilePath);
  } else {
    // Otherwise, create an empty file
    fs.writeFileSync(envFilePath, '');
  }
}

// Read the current environment file
let envContent = fs.readFileSync(envFilePath, 'utf8');

// Function to update a feature flag in the environment file
function updateFeatureFlag(feature, enabled) {
  const featureEnvVar = `NEXT_PUBLIC_FEATURE_${feature.toUpperCase()}_ENABLED`;
  const featureRegex = new RegExp(`^${featureEnvVar}=.*$`, 'm');
  const featureValue = enabled ? 'true' : 'false';
  
  if (featureRegex.test(envContent)) {
    // Update existing feature flag
    envContent = envContent.replace(featureRegex, `${featureEnvVar}=${featureValue}`);
  } else {
    // Add new feature flag
    envContent += `\n${featureEnvVar}=${featureValue}`;
  }
  
  console.log(`Set ${featureEnvVar}=${featureValue} in ${options.env} environment`);
}

// Handle reset option
if (options.reset) {
  console.log(`Resetting all features to default state in ${options.env} environment...`);
  
  // Default state: all features enabled
  AVAILABLE_FEATURES.forEach(feature => {
    updateFeatureFlag(feature, true);
  });
}
// Handle feature-specific options
else if (options.feature) {
  const enabled = options.disable ? false : true;
  console.log(`${enabled ? 'Enabling' : 'Disabling'} ${options.feature} feature in ${options.env} environment...`);
  
  updateFeatureFlag(options.feature, enabled);
}
// Handle environment setup (used by CI/CD)
else {
  console.log(`Setting up feature flags for ${options.env} environment...`);
  
  // Check for feature status file from CI/CD pipeline
  const featureStatusPath = path.resolve(process.cwd(), './feature-status/status.env');
  
  if (fs.existsSync(featureStatusPath)) {
    console.log('Feature status file found, applying feature flags...');
    
    const featureStatus = fs.readFileSync(featureStatusPath, 'utf8');
    const featureLines = featureStatus.split('\n');
    
    // Process each feature status
    featureLines.forEach(line => {
      if (!line.trim()) return;
      
      const [feature, status] = line.split('=');
      if (AVAILABLE_FEATURES.includes(feature)) {
        const enabled = status.trim() === 'true';
        updateFeatureFlag(feature, enabled);
      }
    });
  } else {
    console.log('No feature status file found, using default feature flags');
    
    // Default state: all features enabled
    AVAILABLE_FEATURES.forEach(feature => {
      updateFeatureFlag(feature, true);
    });
  }
}

// Write the updated environment file
fs.writeFileSync(envFilePath, envContent);
console.log(`Updated ${options.env} environment file at ${envFilePath}`);

// Create a backup of the environment file
const backupPath = `${envFilePath}.backup-${Date.now()}`;
fs.copyFileSync(envFilePath, backupPath);
console.log(`Created backup at ${backupPath}`);

// Exit successfully
process.exit(0);