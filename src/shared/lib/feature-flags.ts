'use client';

import { useState, useEffect } from 'react';

export const FEATURE_FLAGS = {
  GRANTS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_GRANTS === 'true',
  WEBINARS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_WEBINARS === 'true',
  CHAT_ENABLED: process.env.NEXT_PUBLIC_FEATURE_CHAT === 'true',
  ADMIN_ENABLED: process.env.NEXT_PUBLIC_FEATURE_ADMIN === 'true',
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

// Local storage key for overridden flags
const LOCAL_STORAGE_KEY = 'bloomwell_feature_flags';

// Function to get flag value considering both environment and local overrides
export function getFeatureFlag(flag: FeatureFlagKey): boolean {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    try {
      const overrides = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      // If flag is explicitly set in local storage, use that value
      if (flag in overrides) {
        return overrides[flag];
      }
    } catch (error) {
      console.error('Error reading feature flags from localStorage:', error);
    }
  }
  
  // Fall back to environment variable
  return FEATURE_FLAGS[flag];
}

// Hook for component use
export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Initial state from environment
    return FEATURE_FLAGS[flag];
  });
  
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Set initial value from local storage or environment
    setIsEnabled(getFeatureFlag(flag));
    
    // Listen for storage events to sync across tabs
    const handleStorageChange = () => {
      setIsEnabled(getFeatureFlag(flag));
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when flags are updated programmatically
    window.addEventListener('feature-flag-change', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('feature-flag-change', handleStorageChange);
    };
  }, [flag]);
  
  return isEnabled;
}

// Function to override a feature flag (for testing/development)
export function setFeatureFlag(flag: FeatureFlagKey, value: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const overrides = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    overrides[flag] = value;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('feature-flag-change'));
  } catch (error) {
    console.error('Error setting feature flag:', error);
  }
}

// Function to reset a feature flag to its environment value
export function resetFeatureFlag(flag: FeatureFlagKey): void {
  if (typeof window === 'undefined') return;
  
  try {
    const overrides = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    delete overrides[flag];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('feature-flag-change'));
  } catch (error) {
    console.error('Error resetting feature flag:', error);
  }
}

// Function to reset all feature flags
export function resetAllFeatureFlags(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('feature-flag-change'));
}
