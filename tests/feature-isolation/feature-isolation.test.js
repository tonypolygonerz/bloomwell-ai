/**
 * Feature Isolation Tests
 * 
 * These tests verify that features can be properly isolated from each other.
 * This ensures that if one feature fails, it doesn't affect other features.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../src/shared/components/ErrorBoundary';
import FeatureBoundary from '../../src/shared/components/FeatureBoundary';
import { FEATURE_FLAGS } from '../../src/shared/lib/featureFlags';

// Mock components for testing
const WorkingComponent = () => <div>Working Component</div>;
const FailingComponent = () => {
  throw new Error('Component failed');
  return <div>This should not render</div>;
};

// Silence console errors during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('Feature Isolation', () => {
  test('ErrorBoundary should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary featureName="test" fallback={<div>Fallback UI</div>}>
        <FailingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Working Component')).not.toBeInTheDocument();
    expect(screen.queryByText('This should not render')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback UI')).toBeInTheDocument();
  });
  
  test('ErrorBoundary should render children normally when no errors occur', () => {
    render(
      <ErrorBoundary featureName="test">
        <WorkingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Working Component')).toBeInTheDocument();
  });
  
  test('FeatureBoundary should not render when feature is disabled', () => {
    render(
      <FeatureBoundary featureName={FEATURE_FLAGS.GRANTS} featureEnabled={false}>
        <WorkingComponent />
      </FeatureBoundary>
    );
    
    expect(screen.queryByText('Working Component')).not.toBeInTheDocument();
  });
  
  test('FeatureBoundary should render fallback when provided and feature is disabled', () => {
    render(
      <FeatureBoundary 
        featureName={FEATURE_FLAGS.GRANTS} 
        featureEnabled={false}
        fallback={<div>Feature Disabled</div>}
      >
        <WorkingComponent />
      </FeatureBoundary>
    );
    
    expect(screen.queryByText('Working Component')).not.toBeInTheDocument();
    expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
  });
  
  test('Multiple features should be isolated from each other', () => {
    render(
      <div>
        <ErrorBoundary featureName="feature1" fallback={<div>Feature 1 Failed</div>}>
          <FailingComponent />
        </ErrorBoundary>
        
        <ErrorBoundary featureName="feature2">
          <WorkingComponent />
        </ErrorBoundary>
      </div>
    );
    
    expect(screen.getByText('Feature 1 Failed')).toBeInTheDocument();
    expect(screen.getByText('Working Component')).toBeInTheDocument();
  });
  
  test('Nested features should be isolated', () => {
    render(
      <ErrorBoundary featureName="outer" fallback={<div>Outer Feature Failed</div>}>
        <div>
          <div>Outer Feature Content</div>
          <ErrorBoundary featureName="inner" fallback={<div>Inner Feature Failed</div>}>
            <FailingComponent />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Outer Feature Content')).toBeInTheDocument();
    expect(screen.getByText('Inner Feature Failed')).toBeInTheDocument();
    expect(screen.queryByText('Outer Feature Failed')).not.toBeInTheDocument();
  });
});

