#!/usr/bin/env node

/**
 * Deployment Rollback Script
 * 
 * This script handles rolling back deployments in case of issues.
 * It can roll back specific features or the entire application.
 * 
 * Usage:
 *   npm run deploy:rollback -- --feature=grants --env=production
 *   npm run deploy:rollback -- --env=production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');

// Define available features
const AVAILABLE_FEATURES = ['grants', 'webinars', 'chat', 'pdf_processing', 'subscription'];

// Define available environments
const AVAILABLE_ENVIRONMENTS = ['development', 'staging', 'production'];

// Parse command line arguments
program
  .option('--feature <feature>', 'Feature to roll back')
  .option('--env <environment>', 'Environment to target', 'production')
  .option('--version <version>', 'Specific version to roll back to')
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

// Log the rollback operation
console.log(`Starting rollback for ${options.feature ? `feature ${options.feature}` : 'all features'} in ${options.env} environment...`);

// Function to find the latest backup of an environment file
function findLatestBackup(envFile) {
  const backupPattern = new RegExp(`^${path.basename(envFile)}\\.backup-\\d+$`);
  const backups = fs.readdirSync(path.dirname(envFile))
    .filter(file => backupPattern.test(file))
    .map(file => ({
      file,
      timestamp: parseInt(file.split('-').pop())
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
  
  return backups.length > 0 ? path.join(path.dirname(envFile), backups[0].file) : null;
}

// Determine the environment file path
const envFilePath = path.resolve(process.cwd(), `.env.${options.env}`);

// Check if the environment file exists
if (!fs.existsSync(envFilePath)) {
  console.error(`Error: Environment file ${envFilePath} does not exist`);
  process.exit(1);
}

// If rolling back a specific feature, just disable it
if (options.feature) {
  console.log(`Rolling back feature ${options.feature} by disabling it...`);
  
  // Use the set-feature-flags script to disable the feature
  try {
    execSync(`node scripts/deployment/set-feature-flags.js --feature=${options.feature} --env=${options.env} --disable`, {
      stdio: 'inherit'
    });
    
    console.log(`Successfully rolled back feature ${options.feature} by disabling it`);
  } catch (error) {
    console.error(`Error rolling back feature ${options.feature}:`, error);
    process.exit(1);
  }
}
// If rolling back the entire application, restore from backup
else {
  // Find the latest backup
  const latestBackup = findLatestBackup(envFilePath);
  
  if (!latestBackup) {
    console.error(`Error: No backup found for ${envFilePath}`);
    process.exit(1);
  }
  
  console.log(`Rolling back to backup ${latestBackup}...`);
  
  // Create a new backup of the current state before rolling back
  const newBackupPath = `${envFilePath}.pre-rollback-${Date.now()}`;
  fs.copyFileSync(envFilePath, newBackupPath);
  console.log(`Created pre-rollback backup at ${newBackupPath}`);
  
  // Restore from the backup
  fs.copyFileSync(latestBackup, envFilePath);
  console.log(`Successfully restored from backup ${latestBackup}`);
  
  // If a specific version was requested, try to roll back to that version
  if (options.version) {
    console.log(`Attempting to roll back to version ${options.version}...`);
    
    try {
      // This would typically involve a deployment system command
      // For example, with Vercel:
      // execSync(`vercel rollback --env=${options.env} --version=${options.version}`, {
      //   stdio: 'inherit'
      // });
      
      console.log(`NOTE: Actual version rollback command would be executed here`);
      console.log(`Implementation depends on your deployment platform (Vercel, Netlify, AWS, etc.)`);
    } catch (error) {
      console.error(`Error rolling back to version ${options.version}:`, error);
      // Continue anyway, since we've already restored the environment file
    }
  }
}

// Log completion
console.log(`Rollback completed successfully`);

// Exit successfully
process.exit(0);
