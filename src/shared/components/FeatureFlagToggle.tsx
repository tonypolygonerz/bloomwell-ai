'use client';

import React, { useState, useEffect } from 'react';
import { 
  FeatureFlagKey, 
  FEATURE_FLAGS, 
  getFeatureFlag, 
  setFeatureFlag, 
  resetFeatureFlag 
} from '@/shared/lib/feature-flags';

interface FeatureFlagToggleProps {
  showResetAll?: boolean;
}

const FeatureFlagToggle: React.FC<FeatureFlagToggleProps> = ({ showResetAll = true }) => {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>({} as Record<FeatureFlagKey, boolean>);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize flags
  useEffect(() => {
    const initialFlags = {} as Record<FeatureFlagKey, boolean>;
    (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).forEach(key => {
      initialFlags[key] = getFeatureFlag(key);
    });
    setFlags(initialFlags);

    // Listen for changes from other components
    const handleFlagChange = () => {
      const updatedFlags = {} as Record<FeatureFlagKey, boolean>;
      (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).forEach(key => {
        updatedFlags[key] = getFeatureFlag(key);
      });
      setFlags(updatedFlags);
    };

    window.addEventListener('feature-flag-change', handleFlagChange);
    return () => {
      window.removeEventListener('feature-flag-change', handleFlagChange);
    };
  }, []);

  // Handle toggle change
  const handleToggle = (flag: FeatureFlagKey) => {
    const newValue = !flags[flag];
    setFeatureFlag(flag, newValue);
    setFlags(prev => ({ ...prev, [flag]: newValue }));
  };

  // Handle reset all
  const handleResetAll = () => {
    (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).forEach(key => {
      resetFeatureFlag(key);
    });
    
    // Update local state
    const resetFlags = {} as Record<FeatureFlagKey, boolean>;
    (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).forEach(key => {
      resetFlags[key] = FEATURE_FLAGS[key];
    });
    setFlags(resetFlags);
  };

  // Format flag name for display
  const formatFlagName = (flag: string): string => {
    return flag
      .replace('_ENABLED', '')
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none"
        title="Feature Flags"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Feature Flags</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {(Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).map((flag) => (
              <div key={flag} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{formatFlagName(flag)}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={flags[flag]}
                    onChange={() => handleToggle(flag)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            ))}
          </div>

          {showResetAll && (
            <button
              onClick={handleResetAll}
              className="mt-4 w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded transition-colors"
            >
              Reset All to Default
            </button>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Changes apply immediately across all components
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureFlagToggle;
