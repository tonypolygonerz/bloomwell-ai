const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Base config from main jest.config.js with webinars-specific overrides
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Webinars-specific settings
  testMatch: ['<rootDir>/src/features/webinars/**/*.test.{ts,tsx}'],
  displayName: 'Webinars',
  coverageDirectory: '<rootDir>/coverage/webinars',
  collectCoverageFrom: [
    'src/features/webinars/**/*.{ts,tsx}',
    '!src/features/webinars/**/*.d.ts',
    '!src/features/webinars/**/*.stories.{ts,tsx}',
    '!src/features/webinars/**/index.{ts,tsx}',
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
