#!/usr/bin/env node

/**
 * Feature Status Verification Script
 * 
 * This script verifies the status of all features in the current environment.
 * It can be used to check if features are properly enabled/disabled.
 * 
 * Usage:
 *   npm run ci:verify-features
 */

const fs = require('fs');
const path = require('path');
const { execSync: _execSync } = require('child_process');
const { program } = require('commander');

// Define available features
const AVAILABLE_FEATURES = ['grants', 'webinars', 'chat', 'pdf_processing', 'subscription'];

// Parse command line arguments
program
  .option('--env <environment>', 'Environment to target', process.env.NEXT_PUBLIC_ENVIRONMENT || 'development')
  .parse(process.argv);

const options = program.opts();

console.log(`Verifying feature status in ${options.env} environment...`);

// Function to check if a feature is enabled
function isFeatureEnabled(feature) {
  const envVar = `NEXT_PUBLIC_FEATURE_${feature.toUpperCase()}_ENABLED`;
  const value = process.env[envVar];
  
  // If the environment variable is not set, assume the feature is enabled
  if (value === undefined) {
    return true;
  }
  
  return value.toLowerCase() === 'true';
}

// Check the status of all features
const featureStatus = {};
let allFeaturesEnabled = true;

AVAILABLE_FEATURES.forEach(feature => {
  const enabled = isFeatureEnabled(feature);
  featureStatus[feature] = enabled;
  
  if (!enabled) {
    allFeaturesEnabled = false;
  }
  
  console.log(`Feature ${feature}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
});

// Create a summary file
const summaryPath = path.resolve(process.cwd(), './feature-status-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(featureStatus, null, 2));
console.log(`Feature status summary written to ${summaryPath}`);

// If all features are enabled, exit with success
if (allFeaturesEnabled) {
  console.log('All features are enabled');
  process.exit(0);
}

// If some features are disabled, exit with a warning code
console.log('Warning: Some features are disabled');
process.exit(2);