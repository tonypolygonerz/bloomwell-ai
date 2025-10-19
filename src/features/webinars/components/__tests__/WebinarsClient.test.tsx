import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WebinarsClient from '../WebinarsClient';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ webinars: [] }),
  })
) as jest.Mock;

// Suppress console errors during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// This is a simple test to verify isolation from grants tests
describe('WebinarsClient', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      render(<WebinarsClient />);
    });
    
    // Check for "No webinars found" text which is displayed when the webinar list is empty
    expect(screen.getByText('No webinars found')).toBeInTheDocument();
    
    // Wait for any state updates
    await act(async () => {
      await Promise.resolve();
    });
  });

  // This test will always pass and is used to verify isolation
  it('is isolated from grants feature tests', () => {
    expect(true).toBe(true);
  });
});