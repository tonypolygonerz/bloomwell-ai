const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Base config from main jest.config.js with subscription-specific overrides
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Subscription-specific settings
  testMatch: ['<rootDir>/src/features/subscription/**/*.test.{ts,tsx}'],
  displayName: 'Subscription',
  coverageDirectory: '<rootDir>/coverage/subscription',
  collectCoverageFrom: [
    'src/features/subscription/**/*.{ts,tsx}',
    '!src/features/subscription/**/*.d.ts',
    '!src/features/subscription/**/*.stories.{ts,tsx}',
    '!src/features/subscription/**/index.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
