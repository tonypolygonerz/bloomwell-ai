/**
 * Feature Flag Configuration System for Bloomwell AI
 * 
 * This module provides a centralized way to manage feature flags across the application.
 * Features can be enabled/disabled via environment variables, remote configuration,
 * or runtime overrides.
 */

// Define feature flag names as constants to ensure consistency
export const FEATURE_FLAGS = {
  GRANTS: 'grants',
  WEBINARS: 'webinars',
  CHAT: 'chat',
  PDF_PROCESSING: 'pdf_processing',
  SUBSCRIPTION: 'subscription',
} as const;

export type FeatureFlagName = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Interface for feature flag configuration
interface FeatureFlagConfig {
  // Default state if no other configuration is found
  defaultEnabled: boolean;
  
  // Environment variable name that can override the default
  envVariable: string;
  
  // Optional description for documentation
  description: string;
  
  // Monitoring metrics name for this feature
  metricsName: string;
}

// Configuration for all feature flags
const featureFlagConfigs: Record<FeatureFlagName, FeatureFlagConfig> = {
  [FEATURE_FLAGS.GRANTS]: {
    defaultEnabled: true,
    envVariable: 'NEXT_PUBLIC_FEATURE_GRANTS_ENABLED',
    description: 'Grant search and matching functionality',
    metricsName: 'feature.grants',
  },
  [FEATURE_FLAGS.WEBINARS]: {
    defaultEnabled: true,
    envVariable: 'NEXT_PUBLIC_FEATURE_WEBINARS_ENABLED',
    description: 'Nonprofit webinar platform',
    metricsName: 'feature.webinars',
  },
  [FEATURE_FLAGS.CHAT]: {
    defaultEnabled: true,
    envVariable: 'NEXT_PUBLIC_FEATURE_CHAT_ENABLED',
    description: 'AI chat assistant for nonprofits',
    metricsName: 'feature.chat',
  },
  [FEATURE_FLAGS.PDF_PROCESSING]: {
    defaultEnabled: true,
    envVariable: 'NEXT_PUBLIC_FEATURE_PDF_PROCESSING_ENABLED',
    description: 'PDF document processing and analysis',
    metricsName: 'feature.pdf_processing',
  },
  [FEATURE_FLAGS.SUBSCRIPTION]: {
    defaultEnabled: true,
    envVariable: 'NEXT_PUBLIC_FEATURE_SUBSCRIPTION_ENABLED',
    description: 'Subscription and payment processing',
    metricsName: 'feature.subscription',
  },
};

// Runtime overrides for testing/development
const runtimeOverrides: Partial<Record<FeatureFlagName, boolean>> = {};

/**
 * Check if a feature is enabled
 * 
 * Order of precedence:
 * 1. Runtime override (if set)
 * 2. Environment variable
 * 3. Default value
 * 
 * @param featureName The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(featureName: FeatureFlagName): boolean {
  // Check if there's a runtime override
  if (featureName in runtimeOverrides) {
    return runtimeOverrides[featureName] as boolean;
  }
  
  const config = featureFlagConfigs[featureName];
  
  // Check environment variable if we're in a browser environment
  if (typeof window !== 'undefined') {
    const envValue = process.env[config.envVariable];
    if (envValue !== undefined) {
      return envValue.toLowerCase() === 'true';
    }
  }
  
  // Fall back to default value
  return config.defaultEnabled;
}

/**
 * Set a runtime override for a feature flag
 * 
 * This is useful for testing or for temporary feature toggles
 * 
 * @param featureName The name of the feature to override
 * @param enabled Whether the feature should be enabled
 */
export function setFeatureOverride(featureName: FeatureFlagName, enabled: boolean): void {
  runtimeOverrides[featureName] = enabled;
  
  // Log the override for debugging
  console.log(`Feature override set: ${featureName} = ${enabled}`);
  
  // Trigger any registered callbacks for this feature
  triggerFeatureCallbacks(featureName);
}

/**
 * Clear a runtime override for a feature flag
 * 
 * @param featureName The name of the feature to clear the override for
 */
export function clearFeatureOverride(featureName: FeatureFlagName): void {
  delete runtimeOverrides[featureName];
  
  // Log the cleared override for debugging
  console.log(`Feature override cleared: ${featureName}`);
  
  // Trigger any registered callbacks for this feature
  triggerFeatureCallbacks(featureName);
}

// Callbacks for feature flag changes
const featureCallbacks: Record<string, Array<() => void>> = {};

/**
 * Register a callback to be called when a feature flag changes
 * 
 * @param featureName The name of the feature to watch
 * @param callback The function to call when the feature flag changes
 * @returns A function that unregisters the callback
 */
export function onFeatureChange(featureName: FeatureFlagName, callback: () => void): () => void {
  if (!featureCallbacks[featureName]) {
    featureCallbacks[featureName] = [];
  }
  
  featureCallbacks[featureName].push(callback);
  
  // Return a function to unregister the callback
  return () => {
    const index = featureCallbacks[featureName].indexOf(callback);
    if (index !== -1) {
      featureCallbacks[featureName].splice(index, 1);
    }
  };
}

/**
 * Trigger all callbacks for a feature flag
 * 
 * @param featureName The name of the feature whose callbacks to trigger
 */
function triggerFeatureCallbacks(featureName: FeatureFlagName): void {
  if (featureCallbacks[featureName]) {
    featureCallbacks[featureName].forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error(`Error in feature callback for ${featureName}:`, error);
      }
    });
  }
}

/**
 * Get all feature flags and their current state
 * 
 * @returns A record of all feature flags and whether they are enabled
 */
export function getAllFeatureFlags(): Record<FeatureFlagName, boolean> {
  return Object.values(FEATURE_FLAGS).reduce(
    (acc, featureName) => {
      acc[featureName as FeatureFlagName] = isFeatureEnabled(featureName as FeatureFlagName);
      return acc;
    },
    {} as Record<FeatureFlagName, boolean>
  );
}

/**
 * Get configuration for all features
 * 
 * @returns The configuration for all features
 */
export function getFeatureConfigs(): Record<FeatureFlagName, FeatureFlagConfig> {
  return { ...featureFlagConfigs };
}
