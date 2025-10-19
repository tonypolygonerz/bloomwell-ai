/**
 * Monitoring configuration for Bloomwell AI
 * 
 * This module provides a centralized way to monitor feature health and errors
 * across the application. It can be configured to use different monitoring
 * services in different environments.
 */

import { ErrorInfo } from 'react';
import { FeatureFlagName } from './featureFlags';

// Interface for monitoring service configuration
interface MonitoringConfig {
  // API key for the monitoring service
  apiKey?: string;
  
  // Endpoint for the monitoring service
  endpoint?: string;
  
  // Environment (production, staging, development)
  environment: 'production' | 'staging' | 'development';
  
  // Whether to enable debug logging
  debug: boolean;
  
  // Sample rate for performance metrics (0-1)
  sampleRate: number;
}

// Feature metrics interface
interface FeatureMetrics {
  // Number of errors for this feature
  errorCount: number;
  
  // Number of successful renders for this feature
  renderCount: number;
  
  // Average render time in milliseconds
  averageRenderTime: number;
  
  // Last error timestamp
  lastErrorTimestamp?: number;
  
  // Last error message
  lastErrorMessage?: string;
}

// Default monitoring configuration
const defaultConfig: MonitoringConfig = {
  apiKey: process.env.NEXT_PUBLIC_MONITORING_API_KEY,
  endpoint: process.env.NEXT_PUBLIC_MONITORING_ENDPOINT,
  environment: (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as 'production' | 'staging' | 'development',
  debug: process.env.NEXT_PUBLIC_MONITORING_DEBUG === 'true',
  sampleRate: parseFloat(process.env.NEXT_PUBLIC_MONITORING_SAMPLE_RATE || '0.1'),
};

// In-memory metrics storage
const featureMetrics: Record<FeatureFlagName, FeatureMetrics> = {} as Record<FeatureFlagName, FeatureMetrics>;

/**
 * Initialize the monitoring service
 * 
 * @param config Optional configuration to override defaults
 */
export function initMonitoring(config?: Partial<MonitoringConfig>): void {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Initialize the global monitoring object
  window.BLOOMWELL_MONITORING = {
    captureFeatureError,
    captureFeatureRender,
    captureFeaturePerformance,
    getFeatureMetrics,
    flushMetrics,
  };
  
  // Log initialization if debug is enabled
  if (finalConfig.debug) {
    console.log('Bloomwell monitoring initialized', finalConfig);
  }
  
  // Set up periodic metrics flushing (every 60 seconds)
  setInterval(() => {
    flushMetrics();
  }, 60000);
}

/**
 * Capture a feature error
 * 
 * @param featureName The name of the feature that had an error
 * @param error The error object
 * @param errorInfo React error info (optional)
 */
export function captureFeatureError(
  featureName: string,
  error: Error,
  errorInfo?: ErrorInfo
): void {
  // Initialize metrics for this feature if needed
  if (!featureMetrics[featureName as FeatureFlagName]) {
    featureMetrics[featureName as FeatureFlagName] = {
      errorCount: 0,
      renderCount: 0,
      averageRenderTime: 0,
    };
  }
  
  // Update metrics
  featureMetrics[featureName as FeatureFlagName].errorCount += 1;
  featureMetrics[featureName as FeatureFlagName].lastErrorTimestamp = Date.now();
  featureMetrics[featureName as FeatureFlagName].lastErrorMessage = error.message;
  
  // Log error if debug is enabled
  if (defaultConfig.debug) {
    console.error(`Feature Error [${featureName}]:`, error, errorInfo);
  }
  
  // Send to monitoring service if configured
  if (defaultConfig.apiKey && defaultConfig.endpoint) {
    try {
      const payload = {
        type: 'feature_error',
        feature: featureName,
        error: {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo?.componentStack,
        },
        timestamp: Date.now(),
        environment: defaultConfig.environment,
      };
      
      // Send using fetch API
      fetch(defaultConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': defaultConfig.apiKey,
        },
        body: JSON.stringify(payload),
      }).catch(err => {
        if (defaultConfig.debug) {
          console.error('Failed to send error to monitoring service:', err);
        }
      });
    } catch (sendError) {
      if (defaultConfig.debug) {
        console.error('Failed to send error to monitoring service:', sendError);
      }
    }
  }
}

/**
 * Capture a feature render
 * 
 * @param featureName The name of the feature that was rendered
 */
export function captureFeatureRender(featureName: string): void {
  // Initialize metrics for this feature if needed
  if (!featureMetrics[featureName as FeatureFlagName]) {
    featureMetrics[featureName as FeatureFlagName] = {
      errorCount: 0,
      renderCount: 0,
      averageRenderTime: 0,
    };
  }
  
  // Update metrics
  featureMetrics[featureName as FeatureFlagName].renderCount += 1;
}

/**
 * Capture feature performance metrics
 * 
 * @param featureName The name of the feature
 * @param renderTime The time it took to render in milliseconds
 */
export function captureFeaturePerformance(featureName: string, renderTime: number): void {
  // Initialize metrics for this feature if needed
  if (!featureMetrics[featureName as FeatureFlagName]) {
    featureMetrics[featureName as FeatureFlagName] = {
      errorCount: 0,
      renderCount: 0,
      averageRenderTime: 0,
    };
  }
  
  // Update average render time
  const metrics = featureMetrics[featureName as FeatureFlagName];
  const totalTime = metrics.averageRenderTime * metrics.renderCount;
  metrics.averageRenderTime = (totalTime + renderTime) / (metrics.renderCount + 1);
  
  // Only sample a percentage of performance metrics
  if (Math.random() > defaultConfig.sampleRate) {
    return;
  }
  
  // Send to monitoring service if configured
  if (defaultConfig.apiKey && defaultConfig.endpoint) {
    try {
      const payload = {
        type: 'feature_performance',
        feature: featureName,
        renderTime,
        timestamp: Date.now(),
        environment: defaultConfig.environment,
      };
      
      // Send using fetch API
      fetch(defaultConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': defaultConfig.apiKey,
        },
        body: JSON.stringify(payload),
      }).catch(err => {
        if (defaultConfig.debug) {
          console.error('Failed to send performance metrics to monitoring service:', err);
        }
      });
    } catch (sendError) {
      if (defaultConfig.debug) {
        console.error('Failed to send performance metrics to monitoring service:', sendError);
      }
    }
  }
}

/**
 * Get metrics for all features
 * 
 * @returns A copy of the current feature metrics
 */
export function getFeatureMetrics(): Record<string, FeatureMetrics> {
  return { ...featureMetrics };
}

/**
 * Flush metrics to the monitoring service
 */
export function flushMetrics(): void {
  // Only flush if monitoring is configured
  if (!defaultConfig.apiKey || !defaultConfig.endpoint) {
    return;
  }
  
  try {
    const payload = {
      type: 'feature_metrics',
      metrics: featureMetrics,
      timestamp: Date.now(),
      environment: defaultConfig.environment,
    };
    
    // Send using fetch API
    fetch(defaultConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': defaultConfig.apiKey,
      },
      body: JSON.stringify(payload),
    }).catch(err => {
      if (defaultConfig.debug) {
        console.error('Failed to flush metrics to monitoring service:', err);
      }
    });
  } catch (sendError) {
    if (defaultConfig.debug) {
      console.error('Failed to flush metrics to monitoring service:', sendError);
    }
  }
}

// Update the global Window interface
declare global {
  interface Window {
    BLOOMWELL_MONITORING?: {
      captureFeatureError: typeof captureFeatureError;
      captureFeatureRender: typeof captureFeatureRender;
      captureFeaturePerformance: typeof captureFeaturePerformance;
      getFeatureMetrics: typeof getFeatureMetrics;
      flushMetrics: typeof flushMetrics;
    };
  }
}

// Export all functions
export default {
  initMonitoring,
  captureFeatureError,
  captureFeatureRender,
  captureFeaturePerformance,
  getFeatureMetrics,
  flushMetrics,
};
