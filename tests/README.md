# Bloomwell AI Testing

This directory contains all tests for the Bloomwell AI platform.

## Directory Structure

### `/unit`
Unit tests for individual functions, components, and modules.
- Test isolated functionality
- Fast execution
- No external dependencies

### `/integration`
Integration tests for API endpoints, database operations, and service interactions.
- Test component interactions
- May use test database
- Verify data flow between modules

### `/e2e`
End-to-end tests for complete user workflows.
- Test full user journeys
- Browser automation
- Test critical paths like registration, subscription, grant search

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- tests/unit

# Run integration tests
npm test -- tests/integration

# Run e2e tests
npm test -- tests/e2e

# Run with coverage
npm test -- --coverage
```

## Writing Tests

### Unit Test Example
```typescript
// tests/unit/lib/profile-completeness.test.ts
import { calculateProfileCompleteness } from '@/lib/profile-completeness';

describe('calculateProfileCompleteness', () => {
  it('should return 0 for empty profile', () => {
    const result = calculateProfileCompleteness({});
    expect(result).toBe(0);
  });
});
```

### Integration Test Example
```typescript
// tests/integration/api/onboarding.test.ts
import { POST } from '@/app/api/onboarding/route';

describe('Onboarding API', () => {
  it('should save organization data', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Example
```typescript
// tests/e2e/registration.test.ts
describe('User Registration Flow', () => {
  it('should complete registration and redirect to dashboard', async () => {
    // Test complete registration flow
  });
});
```

## Test Data

- Use realistic nonprofit data in tests
- Test edge cases (small/large budgets, various organization types)
- Test trial period and subscription logic thoroughly

## Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: Critical API endpoints
- E2E tests: All user-facing workflows






