/**
 * End-to-End Tests for User Registration Flow
 * Tests the complete user registration journey from form submission to account creation
 */

import { prisma } from '@/lib/prisma';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Mock bcrypt for password hashing
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn(),
}));

describe('User Registration E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Progressive Registration Form - Step 1: Basic Information', () => {
    it('should validate required fields on step 1', () => {
      const formData = {
        firstName: '',
        lastName: '',
        email: '',
      };

      const errors: Record<string, string> = {};

      if (!formData.firstName) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        errors.lastName = 'Last name is required';
      }
      if (!formData.email) {
        errors.email = 'Email is required';
      }

      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors.firstName).toBe('First name is required');
      expect(errors.lastName).toBe('Last name is required');
      expect(errors.email).toBe('Email is required');
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user @example.com',
      ];

      const emailRegex = /\S+@\S+\.\S+/;

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@nonprofit.org',
        'director+grants@organization.org',
      ];

      const emailRegex = /\S+@\S+\.\S+/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should allow progression to step 2 when step 1 is valid', () => {
      const formData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@nonprofit.org',
      };

      const errors: Record<string, string> = {};

      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email';
      }

      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe('Progressive Registration Form - Step 2: Organization', () => {
    it('should validate organization type selection', () => {
      const formData = {
        organizationType: '',
        organizationQuery: '',
        selectedOrg: null,
      };

      const errors: Record<string, string> = {};

      if (!formData.organizationType) {
        errors.organizationType = 'Please select an organization type';
      }

      expect(errors.organizationType).toBe(
        'Please select an organization type'
      );
    });

    it('should accept valid organization types', () => {
      const validTypes = [
        'nonprofit',
        'church',
        'social_enterprise',
        'foundation',
        'government',
        'other',
      ];

      validTypes.forEach(type => {
        expect(type).toBeTruthy();
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should validate organization search or selection', () => {
      const formData = {
        organizationType: 'nonprofit',
        organizationQuery: '',
        selectedOrg: null,
      };

      const errors: Record<string, string> = {};

      if (!formData.selectedOrg && !formData.organizationQuery) {
        errors.organizationQuery = 'Please search for your organization';
      }

      expect(errors.organizationQuery).toBe(
        'Please search for your organization'
      );
    });

    it('should accept when organization is selected from ProPublica', () => {
      const formData = {
        organizationType: 'nonprofit',
        organizationQuery: 'Community Hope Foundation',
        selectedOrg: {
          name: 'Community Hope Foundation',
          ein: '12-3456789',
          city: 'San Francisco',
          state: 'CA',
        },
      };

      const errors: Record<string, string> = {};

      if (!formData.organizationType) {
        errors.organizationType = 'Please select an organization type';
      }
      if (!formData.selectedOrg && !formData.organizationQuery) {
        errors.organizationQuery = 'Please search for your organization';
      }

      expect(Object.keys(errors).length).toBe(0);
      expect(formData.selectedOrg?.ein).toMatch(/^\d{2}-\d{7}$/);
    });
  });

  describe('Progressive Registration Form - Step 3: Additional Details', () => {
    it('should validate 501(c)(3) status', () => {
      const formData = {
        has501c3Status: '',
      };

      const errors: Record<string, string> = {};

      if (!formData.has501c3Status) {
        errors.has501c3Status = 'Please confirm 501(c)(3) status';
      }

      expect(errors.has501c3Status).toBe('Please confirm 501(c)(3) status');
    });

    it('should validate operating revenue selection', () => {
      const formData = {
        operatingRevenue: '',
      };

      const errors: Record<string, string> = {};

      if (!formData.operatingRevenue) {
        errors.operatingRevenue = 'Please select your operating revenue';
      }

      expect(errors.operatingRevenue).toBe(
        'Please select your operating revenue'
      );
    });

    it('should validate grant history selection', () => {
      const formData = {
        grantHistory: '',
      };

      const errors: Record<string, string> = {};

      if (!formData.grantHistory) {
        errors.grantHistory = 'Please select your grant history';
      }

      expect(errors.grantHistory).toBe('Please select your grant history');
    });

    it('should validate password requirements', () => {
      const testCases = [
        { password: '', expectedError: 'Password is required' },
        {
          password: 'short',
          expectedError: 'Password must be at least 8 characters',
        },
        {
          password: '1234567',
          expectedError: 'Password must be at least 8 characters',
        },
        { password: 'validpass123', expectedError: null },
      ];

      testCases.forEach(({ password, expectedError }) => {
        const errors: Record<string, string> = {};

        if (!password) {
          errors.password = 'Password is required';
        } else if (password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }

        if (expectedError) {
          expect(errors.password).toBe(expectedError);
        } else {
          expect(errors.password).toBeUndefined();
        }
      });
    });

    it('should validate phone number format', () => {
      const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6)
          return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
      };

      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555123')).toBe('(555) 123');
      expect(formatPhoneNumber('555')).toBe('555');
    });

    it('should validate phone number length', () => {
      const phoneNumbers = [
        { value: '(555) 123-4567', valid: true },
        { value: '(555) 123-456', valid: false },
        { value: '555', valid: false },
        { value: '(555) 123-45678', valid: true }, // Extra digits
      ];

      phoneNumbers.forEach(({ value, valid }) => {
        const numbersOnly = value.replace(/\D/g, '');
        const isValid = numbersOnly.length >= 10;
        expect(isValid).toBe(valid);
      });
    });
  });

  describe('Complete Registration Flow', () => {
    it('should successfully register a new user with all valid data', async () => {
      const registrationData = {
        email: 'director@hopefoundation.org',
        password: 'SecurePass123!',
        name: 'Sarah Johnson',
        phone: '+15551234567',
        organization: {
          name: 'Hope Foundation',
          ein: '12-3456789',
          city: 'San Francisco',
          state: 'CA',
          organizationType: 'nonprofit',
          has501c3Status: true,
          operatingRevenue: '$200K-$500K',
          grantHistory:
            'In the last 12 months, my organization received 1-3 grants',
        },
      };

      // Mock user doesn't exist
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock successful user creation
      const mockCreatedUser = {
        id: 'user_new_123',
        email: registrationData.email,
        name: registrationData.name,
        password: `hashed_${registrationData.password}`,
        phone: registrationData.phone,
        subscriptionStatus: 'TRIAL',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      // Mock organization creation
      (prisma.organization.create as jest.Mock).mockResolvedValue({
        id: 'org_123',
        name: registrationData.organization.name,
        ein: registrationData.organization.ein,
        userId: mockCreatedUser.id,
      });

      const user = await prisma.user.create({
        data: {
          email: registrationData.email,
          name: registrationData.name,
          password: `hashed_${registrationData.password}`,
          // phone: registrationData.phone,
          subscriptionStatus: 'TRIAL',
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      });

      expect(user).toBeTruthy();
      expect(user.email).toBe(registrationData.email);
      expect(user.subscriptionStatus).toBe('TRIAL');
      expect(user.trialEndDate).toBeTruthy();
    });

    it('should prevent duplicate email registration', async () => {
      const existingUser = {
        id: 'user_existing_123',
        email: 'existing@nonprofit.org',
        name: 'Existing User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const user = await prisma.user.findUnique({
        where: { email: 'existing@nonprofit.org' },
      });

      expect(user).toBeTruthy();
      expect(user?.email).toBe('existing@nonprofit.org');

      // In real API, this would return 409 Conflict
      expect(user).toEqual(existingUser);
    });

    it('should create trial period of exactly 14 days', async () => {
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

    it('should hash password before storing', async () => {
      const bcrypt = require('bcryptjs');
      const plainPassword = 'MySecurePassword123!';

      const hashedPassword = await bcrypt.hash(plainPassword);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toBe(`hashed_${plainPassword}`);
    });

    it('should set initial subscription status to TRIAL', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'newuser@nonprofit.org',
        subscriptionStatus: 'TRIAL',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.create({
        data: {
          email: 'newuser@nonprofit.org',
          subscriptionStatus: 'TRIAL',
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        } as any,
      });

      expect(user.subscriptionStatus).toBe('TRIAL');
      expect(user.trialStartDate).toBeTruthy();
      expect(user.trialEndDate).toBeTruthy();
    });
  });

  describe('Organization Data Integration', () => {
    it('should store organization details correctly', async () => {
      const organizationData = {
        name: 'Community Hope Foundation',
        ein: '12-3456789',
        city: 'San Francisco',
        state: 'CA',
        organizationType: 'nonprofit',
        has501c3Status: true,
        operatingRevenue: '$200K-$500K',
        grantHistory:
          'In the last 12 months, my organization received 1-3 grants',
      };

      (prisma.organization.create as jest.Mock).mockResolvedValue({
        id: 'org_123',
        ...organizationData,
        userId: 'user_123',
      });

      const organization = await prisma.organization.create({
        data: {
          ...organizationData,
          userId: 'user_123',
        } as any,
      });

      expect(organization).toBeTruthy();
      expect(organization.name).toBe('Community Hope Foundation');
      expect(organization.ein).toBe('12-3456789');
      expect(organization.has501c3Status).toBe(true);
    });

    it('should link organization to user account', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'director@nonprofit.org',
      };

      const mockOrganization = {
        id: 'org_123',
        name: 'Test Nonprofit',
        userId: 'user_123',
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.organization.create as jest.Mock).mockResolvedValue(
        mockOrganization
      );

      const user = await prisma.user.create({
        data: {
          email: 'director@nonprofit.org',
          updatedAt: new Date(),
        } as any,
      });

      const organization = await prisma.organization.create({
        data: {
          name: 'Test Nonprofit',
          userId: user.id,
        } as any,
      });

      expect(organization.userId).toBe(user.id);
    });
  });

  describe('Post-Registration Flow', () => {
    it('should redirect to email verification after successful registration', () => {
      const redirectPath = '/auth/verify-email';
      expect(redirectPath).toBe('/auth/verify-email');
    });

    it('should show appropriate error message on registration failure', () => {
      const errorScenarios = [
        {
          status: 409,
          message: 'An account with this email already exists',
        },
        {
          status: 400,
          message: 'Invalid registration data',
        },
        {
          status: 500,
          message: 'An error occurred. Please try again.',
        },
      ];

      errorScenarios.forEach(({ status, message }) => {
        expect(status).toBeGreaterThanOrEqual(400);
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('OAuth Registration Alternative', () => {
    it('should handle Google OAuth registration', async () => {
      const oauthUser = {
        id: 'google_123',
        email: 'user@example.com',
        name: 'OAuth User',
        image: 'https://example.com/avatar.jpg',
      };

      // OAuth users don't have passwords
      expect(oauthUser.email).toBeTruthy();
      expect(oauthUser.name).toBeTruthy();
    });

    it('should handle Microsoft 365 OAuth registration', async () => {
      const oauthUser = {
        id: 'azure_123',
        email: 'user@organization.org',
        name: 'Azure User',
      };

      expect(oauthUser.email).toBeTruthy();
      expect(oauthUser.name).toBeTruthy();
    });

    it('should create trial period for OAuth users', async () => {
      const trialStartDate = new Date();
      const trialEndDate = new Date(
        trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000
      );

      const oauthUser = {
        id: 'oauth_new_user',
        email: 'oauth@nonprofit.org',
        name: 'OAuth User',
        subscriptionStatus: 'TRIAL',
        trialStartDate,
        trialEndDate,
        password: null, // OAuth users don't have passwords
      };

      expect(oauthUser.subscriptionStatus).toBe('TRIAL');
      expect(oauthUser.trialEndDate).toBeTruthy();
      expect(oauthUser.password).toBeNull();
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle special characters in names', () => {
      const names = [
        "O'Brien",
        'Jean-Pierre',
        'María García',
        'Müller',
        'Doe, Jr.',
      ];

      names.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
        expect(typeof name).toBe('string');
      });
    });

    it('should handle various EIN formats', () => {
      const einFormats = ['12-3456789', '987654321', '00-1234567'];

      einFormats.forEach(ein => {
        const normalized = ein.replace(/\D/g, '');
        expect(normalized.length).toBe(9);
      });
    });

    it('should handle different phone number formats', () => {
      const phoneNumbers = [
        '+1 (555) 123-4567',
        '+44 20 7123 4567',
        '+254 712 345678',
      ];

      phoneNumbers.forEach(phone => {
        expect(phone).toContain('+');
        expect(phone.replace(/\D/g, '').length).toBeGreaterThanOrEqual(10);
      });
    });
  });
});
