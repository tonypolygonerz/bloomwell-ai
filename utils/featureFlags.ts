/**
 * Feature flags utility for Bloomwell AI
 * 
 * This utility provides type-safe access to feature flags across the application.
 * It reads from environment variables set by the CI/CD pipeline.
 */
import React from 'react';

// Feature flag types
export type FeatureFlag = 'grants' | 'webinars' | 'chat';

// Interface for feature flag configuration
export interface FeatureFlagConfig {
  grants: boolean;
  webinars: boolean;
  chat: boolean;
}

/**
 * Get the current state of all feature flags
 * @returns Object containing all feature flag states
 */
export const getFeatureFlags = (): FeatureFlagConfig => {
  // In browser context, read from Next.js public env vars
  if (typeof window !== 'undefined') {
    return {
      grants: process.env.NEXT_PUBLIC_FEATURE_GRANTS_ENABLED !== 'false',
      webinars: process.env.NEXT_PUBLIC_FEATURE_WEBINARS_ENABLED !== 'false',
      chat: process.env.NEXT_PUBLIC_FEATURE_CHAT_ENABLED !== 'false',
    };
  }
  
  // In server context, can read from both public and private env vars
  return {
    grants: process.env.NEXT_PUBLIC_FEATURE_GRANTS_ENABLED !== 'false',
    webinars: process.env.NEXT_PUBLIC_FEATURE_WEBINARS_ENABLED !== 'false',
    chat: process.env.NEXT_PUBLIC_FEATURE_CHAT_ENABLED !== 'false',
  };
};

/**
 * Check if a specific feature is enabled
 * @param feature The feature to check
 * @returns boolean indicating if the feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  const flags = getFeatureFlags();
  return flags[feature];
};

/**
 * Higher-order component to conditionally render based on feature flag
 * @param feature The feature to check
 * @param Component The component to render if feature is enabled
 * @param FallbackComponent Optional component to render if feature is disabled
 * @returns The component or fallback based on feature flag state
 */
export const withFeatureFlag = (
  feature: FeatureFlag,
  Component: React.ComponentType<any>,
  FallbackComponent?: React.ComponentType<any>
) => {
  const ComponentName = (props: any) => {
    const isEnabled = isFeatureEnabled(feature);
    
    if (isEnabled) {
      return React.createElement(Component, props);
    }
    
    return FallbackComponent ? React.createElement(FallbackComponent, props) : null;
  };
  
  ComponentName.displayName = 'ComponentName';
  return ComponentName;
};
