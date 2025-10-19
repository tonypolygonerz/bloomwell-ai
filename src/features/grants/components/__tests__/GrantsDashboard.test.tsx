import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GrantsDashboard from '../GrantsDashboard';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ href, children, className }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
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
    
    // Should show loading state
    expect(screen.getByText('Loading grants management...')).toBeInTheDocument();
  });

  it('renders grant statistics after loading', async () => {
    render(<GrantsDashboard />);
    
    // Fast-forward through the setTimeout
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Grant Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Active Grants')).toBeInTheDocument();
      expect(screen.getByText('Deadline Soon')).toBeInTheDocument();
      expect(screen.getByText('Match Score')).toBeInTheDocument();
    });
    
    // Check for links
    expect(screen.getByText('🔍 Find Matching Grants')).toBeInTheDocument();
    expect(screen.getByText('📝 Grant Application Help')).toBeInTheDocument();
  });

  it('includes the error test component', () => {
    render(<GrantsDashboard />);
    
    // Fast-forward through the setTimeout
    jest.advanceTimersByTime(1000);
    
    // Should include the test error button
    expect(screen.getByText('Trigger Error')).toBeInTheDocument();
  });
});
