# Bloomwell AI CI/CD Pipeline

This document describes the CI/CD pipeline for Bloomwell AI, focusing on the feature-specific CI jobs and deployment strategy.

## Overview

The Bloomwell AI CI/CD pipeline is designed to allow independent testing and deployment of features. This means that a failure in one feature's tests will not block the deployment of other working features. The pipeline uses feature flags to control which features are enabled in each environment.

## Pipeline Structure

The CI/CD pipeline consists of several GitHub Actions workflows:

1. **Feature Tests (`feature-tests.yml`)**: Runs tests for each feature independently
2. **Main CI/CD Pipeline (`ci.yml`)**: Orchestrates the entire CI/CD process, including linting, type checking, building, and deployment

## Feature-Specific Tests

Each feature has its own dedicated test job in the `feature-tests.yml` workflow:

- `test-grants`: Tests the grants feature
- `test-webinars`: Tests the webinars feature
- `test-chat`: Tests the chat feature

These jobs run independently, allowing failures in one feature to be isolated from others.

## Feature Flags

Feature flags are used to control which features are enabled in each environment. The feature flags are set based on the results of the feature-specific tests. If a feature's tests fail, that feature will be disabled in the deployed environment.

### Feature Flag Configuration

Feature flags are managed through environment variables:

- `NEXT_PUBLIC_FEATURE_GRANTS_ENABLED`: Controls the grants feature
- `NEXT_PUBLIC_FEATURE_WEBINARS_ENABLED`: Controls the webinars feature
- `NEXT_PUBLIC_FEATURE_CHAT_ENABLED`: Controls the chat feature

These environment variables are set by the CI/CD pipeline based on test results and are used by the application to determine which features are available.

## Deployment Strategy

The deployment strategy is designed to ensure that working features can be deployed even if some features are failing tests:

1. Run feature-specific tests
2. Determine which features passed their tests
3. Set feature flags based on test results
4. Deploy the application with the appropriate feature flags

### Environments

The pipeline supports multiple deployment environments:

- **Development**: Used for local development
- **Staging**: Used for testing before production
- **Production**: The live environment used by customers

Each environment can have its own set of enabled features based on test results and manual configuration.

## Scripts

The following npm scripts are available for working with the CI/CD pipeline:

- `npm run test:grants`: Run tests for the grants feature
- `npm run test:webinars`: Run tests for the webinars feature
- `npm run test:chat`: Run tests for the chat feature
- `npm run test:all-features`: Run tests for all features
- `npm run deploy:set-feature-flags`: Set feature flags manually
- `npm run deploy:staging`: Deploy to staging with appropriate feature flags
- `npm run deploy:production`: Deploy to production with appropriate feature flags
- `npm run deploy:disable-feature`: Disable a specific feature
- `npm run ci:verify-features`: Verify feature status based on test results

## Using Feature Flags in Code

Feature flags can be used in code to conditionally render components or enable functionality:

```typescript
import { isFeatureEnabled } from '../utils/featureFlags';

// Check if a feature is enabled
const isGrantsEnabled = isFeatureEnabled('grants');

// Conditionally render a component
if (isGrantsEnabled) {
  // Render grants feature
} else {
  // Render fallback
}
```

Alternatively, you can use the higher-order component:

```typescript
import { withFeatureFlag } from '../utils/featureFlags';

// Component to render if feature is enabled
const FeatureComponent = () => <div>Feature is enabled!</div>;

// Component to render if feature is disabled
const FallbackComponent = () => <div>Feature is disabled.</div>;

// Create a feature-flagged component
const FeatureFlaggedComponent = withFeatureFlag(
  'grants',
  FeatureComponent,
  FallbackComponent
);
```

## Troubleshooting

If a feature is unexpectedly disabled, check the following:

1. Verify that the feature's tests are passing
2. Check the feature flags in the environment
3. Review the deployment logs for any errors
4. Check the feature status in the GitHub Actions output

## Adding a New Feature

To add a new feature to the CI/CD pipeline:

1. Create a Jest configuration file for the feature (e.g., `jest.config.newfeature.js`)
2. Add a test script to `package.json` (e.g., `"test:newfeature": "jest --config jest.config.newfeature.js"`)
3. Add a job to the `feature-tests.yml` workflow
4. Add the feature to the feature flag utilities
5. Update the deployment scripts to include the new feature flag

## Conclusion

The feature-specific CI/CD pipeline allows Bloomwell AI to deploy working features independently, improving development velocity and reducing the impact of failures in specific features. By using feature flags, we can control which features are enabled in each environment, providing a more reliable experience for users.
