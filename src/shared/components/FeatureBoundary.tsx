import React, { ErrorInfo, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { FeatureFlagName, isFeatureEnabled } from '../lib/featureFlags';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { useFeatureMonitoring } from '../hooks/useFeatureMonitoring';

interface FeatureBoundaryProps {
  children: ReactNode;
  featureName: FeatureFlagName;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * FeatureBoundary component
 * 
 * This component combines an ErrorBoundary with feature flag checking.
 * It will:
 * 1. Check if the feature is enabled via feature flags
 * 2. If enabled, render the children inside an ErrorBoundary
 * 3. If disabled, render nothing (or a fallback if provided)
 * 
 * @param props Component props
 * @returns React component
 */
const FeatureBoundary: React.FC<FeatureBoundaryProps> = ({
  children,
  featureName,
  fallback,
  onError,
}) => {
  // Use the feature flag hook to get the current state
  const isEnabled = useFeatureFlag(featureName);
  
  // Use monitoring hook to track render performance
  useFeatureMonitoring(featureName);
  
  // If the feature is disabled, render the fallback or nothing
  if (!isEnabled) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // If the feature is enabled, render the children inside an ErrorBoundary
  return (
    <ErrorBoundary
      featureName={featureName}
      featureEnabled={isEnabled}
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Server-side compatible version of FeatureBoundary
 * 
 * This component doesn't use hooks, so it can be used in server components.
 * It checks the feature flag directly without subscribing to changes.
 * 
 * @param props Component props
 * @returns React component
 */
export const StaticFeatureBoundary: React.FC<FeatureBoundaryProps> = ({
  children,
  featureName,
  fallback,
  onError,
}) => {
  // Check the feature flag directly
  const isEnabled = isFeatureEnabled(featureName);
  
  // If the feature is disabled, render the fallback or nothing
  if (!isEnabled) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // If the feature is enabled, render the children inside an ErrorBoundary
  return (
    <ErrorBoundary
      featureName={featureName}
      featureEnabled={isEnabled}
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default FeatureBoundary;
