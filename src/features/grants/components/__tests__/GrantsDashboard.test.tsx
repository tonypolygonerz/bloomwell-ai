import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GrantsDashboard from '../GrantsDashboard';

// Mock the next/link component
jest.mock('next/link', () => {
  const TestComponent = ({ href, children, className }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
  
  TestComponent.displayName = 'TestComponent';
  return TestComponent;
});

describe('GrantsDashboard', () => {
  beforeEach(() => {
    // Mock setTimeout to speed up tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    render(<GrantsDashboard />);
    
    // Check for loading skeleton UI
    const skeletonElement = screen.getByRole('status', { hidden: true });
    expect(skeletonElement).toBeInTheDocument();
  });

  it('renders grant statistics after loading', async () => {
    render(<GrantsDashboard />);
    
    // Fast-forward through the setTimeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Wait for the component to update
    await act(async () => {
      // Just ensuring all promises resolve
      await Promise.resolve();
    });
    
    // Check for grant statistics (these should be visible after loading)
    expect(screen.getByText('Grant Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Active Grants')).toBeInTheDocument();
    expect(screen.getByText('Deadline Soon')).toBeInTheDocument();
    expect(screen.getByText('Match Score')).toBeInTheDocument();
  });
});