const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Base config from main jest.config.js with pdf-processing-specific overrides
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // PDF Processing-specific settings
  testMatch: ['<rootDir>/src/features/pdf_processing/**/*.test.{ts,tsx}'],
  displayName: 'PDF Processing',
  coverageDirectory: '<rootDir>/coverage/pdf-processing',
  collectCoverageFrom: [
    'src/features/pdf_processing/**/*.{ts,tsx}',
    '!src/features/pdf_processing/**/*.d.ts',
    '!src/features/pdf_processing/**/*.stories.{ts,tsx}',
    '!src/features/pdf_processing/**/index.{ts,tsx}',
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
