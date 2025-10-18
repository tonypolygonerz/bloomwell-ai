# Bloomwell AI Testing Guide

## Overview

This document provides comprehensive guidance for testing the Bloomwell AI platform. Our testing strategy ensures reliability, maintains code quality, and validates critical nonprofit-specific functionality.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions/components
│   └── auth/
│       └── login.test.ts    # Authentication logic tests
├── integration/             # Integration tests for API routes
│   └── api/
│       └── grants.test.ts   # Grants API integration tests
├── e2e/                     # End-to-end user flow tests
│   └── user-registration.test.ts  # Complete registration flow
└── README.md                # Testing documentation
```

## Test Categories

### 1. Unit Tests (`tests/unit/`)

Test individual functions, components, and business logic in isolation.

**Example: Authentication Logic**
- Password validation and hashing
- Token generation and verification
- OAuth callback handling
- Session management

**Run Unit Tests:**
```bash
npm test -- tests/unit
```

### 2. Integration Tests (`tests/integration/`)

Test API routes and database interactions with mocked external services.

**Example: Grants API**
- Grant search and filtering
- Database query optimization
- Subscription status validation
- Performance considerations

**Run Integration Tests:**
```bash
npm test -- tests/integration
```

### 3. End-to-End Tests (`tests/e2e/`)

Test complete user journeys from start to finish.

**Example: User Registration**
- Progressive form validation
- Organization search integration
- Trial period creation
- OAuth alternative flows

**Run E2E Tests:**
```bash
npm test -- tests/e2e
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- tests/unit/auth/login.test.ts
```

### Specific Test Suite
```bash
npm test -- --testNamePattern="Credentials Provider"
```

## Writing Tests

### Best Practices

#### 1. Clear Test Descriptions
```typescript
describe('User Registration', () => {
  it('should create trial period of exactly 14 days', () => {
    // Test implementation
  });
});
```

#### 2. Arrange-Act-Assert Pattern
```typescript
it('should hash password before storing', async () => {
  // Arrange
  const plainPassword = 'MySecurePassword123!';
  
  // Act
  const hashedPassword = await bcrypt.hash(plainPassword);
  
  // Assert
  expect(hashedPassword).not.toBe(plainPassword);
});
```

#### 3. Mock External Dependencies
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

#### 4. Test Edge Cases
```typescript
it('should handle special characters in names', () => {
  const names = ["O'Brien", 'Jean-Pierre', 'María García'];
  // Test implementation
});
```

### Nonprofit-Specific Testing Considerations

#### Trial Period Logic
```typescript
it('should create trial period of exactly 14 days', () => {
  const trialStartDate = new Date();
  const trialEndDate = new Date(
    trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000
  );
  
  const daysDifference = Math.floor(
    (trialEndDate.getTime() - trialStartDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  
  expect(daysDifference).toBe(14);
});
```

#### Subscription Status Validation
```typescript
it('should verify user subscription status before granting access', async () => {
  const mockUser = {
    subscriptionStatus: 'TRIAL',
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  
  const isTrialActive = mockUser.trialEndDate > new Date();
  expect(isTrialActive).toBe(true);
});
```

#### Grant Matching Logic
```typescript
it('should filter grants by nonprofit budget range', async () => {
  const grants = await findMatchingGrants({
    budget: '$200K-$500K',
    category: 'Education',
  });
  
  expect(grants.every(g => g.awardCeiling <= 500000)).toBe(true);
});
```

## Test Coverage Goals

Our coverage targets align with the CI/CD pipeline:

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### Priority Coverage Areas

1. **Authentication & Authorization** (Critical)
   - Login/logout flows
   - OAuth integration
   - Session management
   - Trial period validation

2. **Grant Discovery** (Core Feature)
   - Search and filtering
   - Matching algorithms
   - Deadline tracking
   - State-specific grants

3. **Subscription Management** (Revenue Critical)
   - Trial period logic
   - Payment processing
   - Plan upgrades/downgrades
   - Cancellation flows

4. **Organization Onboarding** (User Experience)
   - ProPublica integration
   - EIN validation
   - Profile completion
   - Progressive registration

## Mocking Strategy

### Database (Prisma)
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

### External APIs
```typescript
jest.mock('@/lib/propublica-api', () => ({
  searchOrganizations: jest.fn(),
}));
```

### NextAuth
```typescript
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));
```

### Environment Variables
```typescript
// jest.setup.js
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'file:./test.db';
```

## Common Test Patterns

### Testing API Routes
```typescript
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/example/route';

describe('API Route', () => {
  it('should return 401 if unauthorized', async () => {
    const request = new NextRequest('http://localhost/api/example');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
  });
});
```

### Testing React Components
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should validate form inputs', async () => {
  render(<RegistrationForm />);
  
  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'invalid-email');
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
  
  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});
```

### Testing Async Operations
```typescript
it('should handle API errors gracefully', async () => {
  (prisma.user.create as jest.Mock).mockRejectedValue(
    new Error('Database connection failed')
  );
  
  await expect(
    createUser({ email: 'test@example.com' })
  ).rejects.toThrow('Database connection failed');
});
```

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions.

### CI Pipeline
```yaml
- Lint & Type Check
- Build Verification
- Test Suite (Unit + Integration + E2E)
```

### Local Pre-Commit Checks
```bash
# Run before committing
npm run lint
npm run type-check
npm test
```

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should create trial period"
```

### Enable Console Output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## Test Data

### Mock Users
```typescript
const mockTrialUser = {
  id: 'user_trial_123',
  email: 'trial@nonprofit.org',
  subscriptionStatus: 'TRIAL',
  trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

const mockActiveUser = {
  id: 'user_active_123',
  email: 'active@nonprofit.org',
  subscriptionStatus: 'ACTIVE',
  subscriptionPlan: 'ANNUAL',
};
```

### Mock Grants
```typescript
const mockGrant = {
  id: 'grant_123',
  title: 'Youth Education Program Grant',
  agencyCode: 'ED-2025-001',
  closeDate: new Date('2025-12-31'),
  awardCeiling: 500000,
  category: 'Education',
  isActive: true,
};
```

## Performance Testing

### Query Performance
```typescript
it('should retrieve grants in under 500ms', async () => {
  const startTime = Date.now();
  
  await prisma.grants.findMany({
    where: { isActive: true },
    take: 10,
  });
  
  const endTime = Date.now();
  expect(endTime - startTime).toBeLessThan(500);
});
```

## Troubleshooting

### Tests Failing Locally

1. **Clear Jest Cache:**
   ```bash
   npm test -- --clearCache
   ```

2. **Check Node Version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Reinstall Dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Database Issues

1. **Reset Test Database:**
   ```bash
   npx prisma migrate reset --force
   npx prisma db seed
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Contributing

When adding new features:

1. ✅ Write tests first (TDD approach)
2. ✅ Ensure coverage meets thresholds
3. ✅ Test nonprofit-specific edge cases
4. ✅ Document test purpose and setup
5. ✅ Verify tests pass in CI

---

**Questions?** Contact the development team or check the main README.

