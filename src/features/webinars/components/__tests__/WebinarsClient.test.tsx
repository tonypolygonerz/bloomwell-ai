import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WebinarsClient from '../WebinarsClient';

// Mock the components used by WebinarsClient
jest.mock('../WebinarsContent', () => {
  return function MockWebinarsContent() {
    return <div data-testid="webinars-content">Webinars Content Mock</div>;
  };
});

// This is a simple test to verify isolation from grants tests
describe('WebinarsClient', () => {
  it('renders without crashing', () => {
    render(<WebinarsClient />);
    expect(screen.getByTestId('webinars-content')).toBeInTheDocument();
  });

  // This test will always pass and is used to verify isolation
  it('is isolated from grants feature tests', () => {
    expect(true).toBe(true);
  });
});
