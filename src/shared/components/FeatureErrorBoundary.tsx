'use client';

import React from 'react';

interface Props {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const DefaultFallback = ({
  error,
  reset,
  featureName,
}: {
  error: Error;
  reset: () => void;
  featureName: string;
}) => {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        {featureName} Error
      </h3>
      <p className="text-sm text-red-700 mb-4">
        This feature encountered an error and could not be loaded.
      </p>
      <div className="text-xs text-red-600 font-mono p-2 bg-red-100 rounded mb-4 overflow-auto max-h-24">
        {error.message}
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

class FeatureErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error(`[${this.props.featureName}] Error:`, error);
    console.error(`[${this.props.featureName}] Error Info:`, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback, featureName } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} reset={this.handleReset} />;
      }
      return (
        <DefaultFallback
          error={error}
          reset={this.handleReset}
          featureName={featureName}
        />
      );
    }

    return children;
  }
}

export default FeatureErrorBoundary;
