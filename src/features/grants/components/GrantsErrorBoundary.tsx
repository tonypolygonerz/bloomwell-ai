'use client';

import React, { useState } from 'react';
import FeatureErrorBoundary from '@/shared/components/FeatureErrorBoundary';

interface GrantsErrorFallbackProps {
  error: Error;
  reset: () => void;
}

const GrantsErrorFallback: React.FC<GrantsErrorFallbackProps> = ({
  error,
  reset,
}) => {
  return (
    <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 className="text-lg font-semibold text-amber-800 mb-2">
        Grants Feature Error
      </h3>
      <p className="text-sm text-amber-700 mb-4">
        We encountered an issue with the grants feature. Other features of Bloomwell AI continue to work normally.
      </p>
      <div className="text-xs text-amber-600 font-mono p-2 bg-amber-100 rounded mb-4 overflow-auto max-h-24">
        {error.message}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/chat?prompt=grants-help"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Get Help via Chat
        </a>
      </div>
    </div>
  );
};

// Test component that throws an error on button click
export const GrantsErrorTest: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('This is a test error from the grants feature');
  }
  
  return (
    <div className="p-4 border border-dashed border-red-300 rounded mb-4">
      <p className="text-sm text-gray-700 mb-2">
        This is a test component to demonstrate the error boundary
      </p>
      <button
        onClick={() => setShouldThrow(true)}
        className="px-3 py-1 bg-red-500 text-white text-sm rounded"
      >
        Trigger Error
      </button>
    </div>
  );
};

const GrantsErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FeatureErrorBoundary
      featureName="Grants"
      fallback={GrantsErrorFallback}
    >
      {children}
    </FeatureErrorBoundary>
  );
};

export default GrantsErrorBoundary;
