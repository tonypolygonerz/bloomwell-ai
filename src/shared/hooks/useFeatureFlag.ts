import { useState, useEffect } from 'react';
import { 
  isFeatureEnabled, 
  onFeatureChange, 
  FeatureFlagName 
} from '../lib/featureFlags';

/**
 * React hook for using feature flags in components
 * 
 * This hook returns the current state of a feature flag and
 * automatically re-renders the component when the flag changes.
 * 
 * @param featureName The name of the feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(featureName: FeatureFlagName): boolean {
  // Initialize with the current state of the feature flag
  const [enabled, setEnabled] = useState<boolean>(() => isFeatureEnabled(featureName));
  
  useEffect(() => {
    // Update the state when the component mounts (in case it changed)
    setEnabled(isFeatureEnabled(featureName));
    
    // Register a callback to update the state when the feature flag changes
    const unregister = onFeatureChange(featureName, () => {
      setEnabled(isFeatureEnabled(featureName));
    });
    
    // Clean up the callback when the component unmounts
    return unregister;
  }, [featureName]);
  
  return enabled;
}

/**
 * React hook that combines feature flag state with error boundary usage
 * 
 * This hook returns an object with:
 * - enabled: boolean indicating if the feature is enabled
 * - featureName: the name of the feature (for use with ErrorBoundary)
 * 
 * @param featureName The name of the feature flag to check
 * @returns Object with enabled state and feature name
 */
export function useFeatureBoundary(featureName: FeatureFlagName) {
  const enabled = useFeatureFlag(featureName);
  
  return {
    enabled,
    featureName,
  };
}

export default useFeatureFlag;

