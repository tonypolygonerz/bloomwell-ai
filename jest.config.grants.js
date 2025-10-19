const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Base config from main jest.config.js with grants-specific overrides
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Grants-specific settings
  testMatch: ['<rootDir>/src/features/grants/**/*.test.{ts,tsx}'],
  displayName: 'Grants',
  coverageDirectory: '<rootDir>/coverage/grants',
  collectCoverageFrom: [
    'src/features/grants/**/*.{ts,tsx}',
    '!src/features/grants/**/*.d.ts',
    '!src/features/grants/**/*.stories.{ts,tsx}',
    '!src/features/grants/**/index.{ts,tsx}',
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
