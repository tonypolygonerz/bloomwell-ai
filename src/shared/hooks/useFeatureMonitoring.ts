import { useEffect, useRef } from 'react';
import { FeatureFlagName } from '../lib/featureFlags';

/**
 * React hook for monitoring feature performance
 * 
 * This hook measures the render time of a component and reports it
 * to the monitoring service. It also reports feature renders.
 * 
 * @param featureName The name of the feature to monitor
 */
export function useFeatureMonitoring(featureName: FeatureFlagName): void {
  // Keep track of render start time
  const renderStartTime = useRef<number>(performance.now());
  
  // Report render on mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !window.BLOOMWELL_MONITORING) {
      return;
    }
    
    // Report feature render
    window.BLOOMWELL_MONITORING.captureFeatureRender(featureName);
    
    // Calculate render time
    const renderTime = performance.now() - renderStartTime.current;
    
    // Report performance
    window.BLOOMWELL_MONITORING.captureFeaturePerformance(featureName, renderTime);
    
    // Reset render start time for next render
    renderStartTime.current = performance.now();
  }, [featureName]);
}

export default useFeatureMonitoring;
