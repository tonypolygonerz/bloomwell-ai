/**
 * Feature flags configuration for Bloomwell AI
 * 
 * This file manages feature flags across different environments.
 * These flags are used by the CI/CD pipeline to enable/disable features
 * based on test results and deployment environments.
 */

const getFeatureFlags = (environment) => {
  // Default configuration - all features enabled
  const defaultFlags = {
    GRANTS_ENABLED: true,
    WEBINARS_ENABLED: true,
    CHAT_ENABLED: true,
  };

  // Environment-specific overrides
  const envFlags = {
    development: {
      // Development environment - all features enabled by default
      // Can be overridden by CI/CD pipeline
    },
    staging: {
      // Staging environment - all features enabled by default
      // Can be overridden by CI/CD pipeline
    },
    production: {
      // Production environment - all features enabled by default
      // Can be overridden by CI/CD pipeline
    },
    test: {
      // Test environment - all features enabled for testing
    },
  };

  // Merge default flags with environment-specific flags
  return {
    ...defaultFlags,
    ...(envFlags[environment] || {}),
  };
};

// Read from environment variables if available (set by CI/CD)
const getEnvironmentFeatureFlags = () => {
  return {
    GRANTS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_GRANTS_ENABLED !== 'false',
    WEBINARS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_WEBINARS_ENABLED !== 'false',
    CHAT_ENABLED: process.env.NEXT_PUBLIC_FEATURE_CHAT_ENABLED !== 'false',
  };
};

// Get the current environment
const getEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

// Export feature flags for current environment
const featureFlags = {
  ...getFeatureFlags(getEnvironment()),
  ...getEnvironmentFeatureFlags(),
};

module.exports = featureFlags;
