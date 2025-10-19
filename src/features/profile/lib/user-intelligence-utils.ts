import {
  parseUserIntelligence,
  safeJsonStringify,
  logValidationErrors,
  logValidationWarnings,
} from '@/shared/lib/json-field-utils';
import { UserIntelligence } from '@/shared/types/json-fields';

/**
 * Utility functions for handling user intelligence profiles
 * These functions provide type-safe access to the intelligenceProfile JSON field
 */

/**
 * Safely parse user intelligence profile from database
 */
export function getUserIntelligenceProfile(
  profile: any
): UserIntelligence | null {
  const result = parseUserIntelligence(profile);

  if (!result.success && result.errors) {
    logValidationErrors(result.errors, 'User Intelligence Profile');
  }

  if (result.warnings) {
    logValidationWarnings(result.warnings, 'User Intelligence Profile');
  }

  return result.data || null;
}

/**
 * Safely stringify user intelligence profile for database storage
 */
export function setUserIntelligenceProfile(profile: UserIntelligence): string {
  const result = safeJsonStringify(profile, 'intelligenceProfile');

  if (!result.success && result.errors) {
    logValidationErrors(result.errors, 'User Intelligence Profile Update');
    return JSON.stringify({});
  }

  return result.data || JSON.stringify({});
}

/**
 * Update specific fields in user intelligence profile
 */
export function updateUserIntelligenceProfile(
  currentProfile: any,
  updates: Partial<UserIntelligence>
): string {
  const current = getUserIntelligenceProfile(currentProfile) || {};
  const updated = { ...current, ...updates };
  return setUserIntelligenceProfile(updated);
}

/**
 * Get user's focus areas from intelligence profile
 */
export function getUserFocusAreas(profile: any): string[] {
  const intelligence = getUserIntelligenceProfile(profile);
  return intelligence?.focusAreas || [];
}

/**
 * Get user's budget range from intelligence profile
 */
export function getUserBudgetRange(profile: any): string | null {
  const intelligence = getUserIntelligenceProfile(profile);
  return intelligence?.budgetRange || null;
}

/**
 * Get user's organization type from intelligence profile
 */
export function getUserOrganizationType(profile: any): string | null {
  const intelligence = getUserIntelligenceProfile(profile);
  return intelligence?.organizationType || null;
}

/**
 * Get user's grant interests from intelligence profile
 */
export function getUserGrantInterests(profile: any): string[] {
  const intelligence = getUserIntelligenceProfile(profile);
  return intelligence?.grantInterests || [];
}

/**
 * Check if user has specific focus area
 */
export function hasFocusArea(profile: any, focusArea: string): boolean {
  const focusAreas = getUserFocusAreas(profile);
  return focusAreas.includes(focusArea);
}

/**
 * Check if user has specific grant interest
 */
export function hasGrantInterest(profile: any, interest: string): boolean {
  const interests = getUserGrantInterests(profile);
  return interests.includes(interest);
}

/**
 * Get user's communication preferences
 */
export function getUserCommunicationPreferences(profile: any): {
  style?: 'formal' | 'casual';
  detailLevel?: 'high' | 'medium' | 'low';
} {
  const intelligence = getUserIntelligenceProfile(profile);
  return intelligence?.preferences || {};
}

/**
 * Get user's funding history
 */
export function getUserFundingHistory(profile: any): {
  totalGrants?: number;
  averageAward?: number;
  successRate?: number;
} {
  const intelligence = getUserIntelligenceProfile(profile);
  return intelligence?.fundingHistory || {};
}

/**
 * Create a new user intelligence profile with defaults
 */
export function createDefaultUserIntelligenceProfile(): UserIntelligence {
  return {
    focusAreas: [],
    budgetRange: 'unknown',
    staffSize: 0,
    lastAnalysis: new Date(),
    preferences: {
      communicationStyle: 'formal',
      detailLevel: 'medium',
    },
    grantInterests: [],
    organizationType: 'nonprofit',
    expertiseLevel: 'beginner',
    fundingHistory: {
      totalGrants: 0,
      averageAward: 0,
      successRate: 0,
    },
  };
}

/**
 * Validate user intelligence profile completeness
 */
export function validateUserIntelligenceProfile(profile: any): {
  isComplete: boolean;
  missingFields: string[];
  score: number;
} {
  const intelligence = getUserIntelligenceProfile(profile);
  const missingFields: string[] = [];

  if (!intelligence) {
    return {
      isComplete: false,
      missingFields: ['profile'],
      score: 0,
    };
  }

  if (!intelligence.focusAreas || intelligence.focusAreas.length === 0) {
    missingFields.push('focusAreas');
  }

  if (!intelligence.budgetRange || intelligence.budgetRange === 'unknown') {
    missingFields.push('budgetRange');
  }

  if (!intelligence.staffSize || intelligence.staffSize === 0) {
    missingFields.push('staffSize');
  }

  if (!intelligence.organizationType) {
    missingFields.push('organizationType');
  }

  if (
    !intelligence.grantInterests ||
    intelligence.grantInterests.length === 0
  ) {
    missingFields.push('grantInterests');
  }

  const totalFields = 5;
  const completedFields = totalFields - missingFields.length;
  const score = Math.round((completedFields / totalFields) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    score,
  };
}
