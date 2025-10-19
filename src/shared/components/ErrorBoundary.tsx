import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  featureName: string;
  featureEnabled?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that isolates feature failures
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * It also supports feature flags for conditional rendering.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error(`Feature Error [${this.props.featureName}]:`, error, errorInfo);
    
    // Send to monitoring service if available
    if (typeof window !== 'undefined' && window.BLOOMWELL_MONITORING) {
      try {
        window.BLOOMWELL_MONITORING.captureFeatureError(
          this.props.featureName,
          error,
          errorInfo
        );
      } catch (monitoringError) {
        console.error('Failed to report to monitoring service:', monitoringError);
      }
    }
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    // If feature is explicitly disabled via feature flag, don't render anything
    if (this.props.featureEnabled === false) {
      return null;
    }
    
    // If there's an error, show the fallback UI
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">
            {this.props.featureName} is currently unavailable
          </h3>
          <p className="mt-2 text-sm text-red-700">
            We&apos;re experiencing some technical difficulties. Please try again later.
          </p>
        </div>
      );
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

// Add type definition for the monitoring service
declare global {
  interface Window {
    BLOOMWELL_MONITORING?: {
      captureFeatureError: (
        featureName: string,
        error: Error,
        errorInfo: ErrorInfo
      ) => void;
    };
  }
}

export default ErrorBoundary;
