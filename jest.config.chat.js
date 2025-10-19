const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Base config from main jest.config.js with chat-specific overrides
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Chat-specific settings
  testMatch: ['<rootDir>/src/features/chat/**/*.test.{ts,tsx}'],
  displayName: 'Chat',
  coverageDirectory: '<rootDir>/coverage/chat',
  collectCoverageFrom: [
    'src/features/chat/**/*.{ts,tsx}',
    '!src/features/chat/**/*.d.ts',
    '!src/features/chat/**/*.stories.{ts,tsx}',
    '!src/features/chat/**/index.{ts,tsx}',
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
