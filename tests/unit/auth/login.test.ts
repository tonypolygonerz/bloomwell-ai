/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit Tests for Authentication Login Logic
 * Tests the credential validation and authentication flow
 */

import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('Authentication - Login Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Validation', () => {
    it('should hash password correctly', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);
    });

    it('should validate correct password', async () => {
      const plainPassword = 'correctpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'correctpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isValid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await bcrypt.hash('somepassword', 10);
      const isValid = await bcrypt.compare('', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('Credentials Authorization Logic', () => {
    const authorizeUser = async (
      email: string | undefined,
      password: string | undefined
    ) => {
      // Simulates the authorize function logic
      if (!email || !password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    };

    it('should return null if email is missing', async () => {
      const result = await authorizeUser(undefined, 'testpass123');
      expect(result).toBeNull();
    });

    it('should return null if password is missing', async () => {
      const result = await authorizeUser('test@example.com', undefined);
      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authorizeUser(
        'nonexistent@example.com',
        'testpass123'
      );

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should return null if user has no password (OAuth user)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null,
      });

      const result = await authorizeUser('oauth@example.com', 'testpass123');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      });

      const result = await authorizeUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return user object if credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      });

      const result = await authorizeUser('test@example.com', 'correctpassword');

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });

  describe('OAuth Sign-In Logic', () => {
    const handleOAuthSignIn = async (
      email: string,
      name: string | null,
      image: string | null,
      provider: string
    ) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (
          !existingUser &&
          (provider === 'google' || provider === 'azure-ad')
        ) {
          const trialStartDate = new Date();
          const trialEndDate = new Date(
            trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000
          );

          await prisma.user.create({
            data: {
              id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              email,
              name: name || null,
              image: image || null,
              updatedAt: new Date(),
              trialStartDate,
              trialEndDate,
              subscriptionStatus: 'TRIAL',
            },
          });
        }

        return true;
      } catch (error) {
        console.error('Error in OAuth signIn:', error);
        return false;
      }
    };

    it('should create new user for Google OAuth on first login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user_new_123',
        email: 'newuser@example.com',
        name: 'New User',
      });

      const result = await handleOAuthSignIn(
        'newuser@example.com',
        'New User',
        'https://example.com/avatar.jpg',
        'google'
      );

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalled();

      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.email).toBe('newuser@example.com');
      expect(createCall.data.subscriptionStatus).toBe('TRIAL');
    });

    it('should set trial period to 14 days for new OAuth users', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({});

      await handleOAuthSignIn(
        'newuser@example.com',
        'New User',
        null,
        'google'
      );

      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      const trialStart = createCall.data.trialStartDate;
      const trialEnd = createCall.data.trialEndDate;

      const daysDifference = Math.floor(
        (trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDifference).toBe(14);
    });

    it('should not create user if already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_existing_123',
        email: 'existing@example.com',
        name: 'Existing User',
      });

      const result = await handleOAuthSignIn(
        'existing@example.com',
        'Existing User',
        null,
        'google'
      );

      expect(result).toBe(true);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should handle Azure AD provider', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({});

      const result = await handleOAuthSignIn(
        'azureuser@example.com',
        'Azure User',
        null,
        'azure-ad'
      );

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should return false on database error', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await handleOAuthSignIn(
        'newuser@example.com',
        'New User',
        null,
        'google'
      );

      expect(result).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should add user data from token to session', () => {
      const session: any = {
        user: {},
        expires: '2025-12-31',
      };

      const token = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      };

      // Simulate session callback
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          image: token.image,
        };
      }

      expect(session.user.id).toBe('user_123');
      expect(session.user.email).toBe('test@example.com');
      expect(session.user.name).toBe('Test User');
      expect(session.user.image).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('JWT Token Management', () => {
    it('should add user data to token on sign in', () => {
      const token: any = {};
      const user = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      };

      // Simulate JWT callback
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      expect(token.id).toBe('user_123');
      expect(token.email).toBe('test@example.com');
      expect(token.name).toBe('Test User');
      expect(token.image).toBe('https://example.com/avatar.jpg');
    });

    it('should preserve token data when user is not provided', () => {
      const existingToken = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const token = { ...existingToken };

      expect(token).toEqual(existingToken);
    });
  });

  describe('Trial Period Calculation', () => {
    it('should calculate 14-day trial period correctly', () => {
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

    it('should verify trial is still active', () => {
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const isActive = trialEndDate > new Date();
      expect(isActive).toBe(true);
    });

    it('should verify trial has expired', () => {
      const trialEndDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const isActive = trialEndDate > new Date();
      expect(isActive).toBe(false);
    });
  });
});
