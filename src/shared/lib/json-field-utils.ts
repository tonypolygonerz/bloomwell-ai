import {
  UserIntelligence,
  WebinarCategories,
  GuestSpeaker,
  WebinarMaterial,
  ProjectPrerequisite,
  ProjectOutcome,
  ValidationRules,
  StepOptions,
  UserProjectMetadata,
  TemplateResponseMetadata,
  PDFKeyPoint,
  PDFRecommendation,
  OrganizationSearchFilters,
  AdminNotificationTargetData,
  WebinarNotificationSchedule,
  GrantSearchFilters,
  UserActivityTracking,
  SystemConfiguration,
  JSONFieldError,
  ValidationResult,
} from '@/shared/types/json-fields';

/**
 * Utility functions for safe parsing and validation of JSON fields
 * These functions provide type safety and error handling for JSON data stored in Prisma
 */

// Generic JSON parsing function with error handling
export function safeJsonParse<T>(
  jsonString: string | null | undefined,
  fieldName: string
): ValidationResult<T> {
  if (!jsonString) {
    return {
      success: true,
      data: undefined,
      warnings: [`${fieldName} is null or undefined`],
    };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: fieldName,
          message: `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expectedType: 'valid JSON',
          receivedValue: jsonString,
        },
      ],
    };
  }
}

// Generic JSON stringify function with error handling
export function safeJsonStringify<T>(
  data: T,
  fieldName: string
): ValidationResult<string> {
  try {
    const jsonString = JSON.stringify(data);
    return {
      success: true,
      data: jsonString,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: fieldName,
          message: `Failed to stringify data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expectedType: 'serializable object',
          receivedValue: data,
        },
      ],
    };
  }
}

// User Intelligence Profile utilities
export function parseUserIntelligence(
  profile: any
): ValidationResult<UserIntelligence> {
  if (!profile || typeof profile !== 'object') {
    return {
      success: true,
      data: undefined,
      warnings: ['User intelligence profile is null or undefined'],
    };
  }

  const errors: JSONFieldError[] = [];
  const warnings: string[] = [];

  try {
    const result: UserIntelligence = {};

    // Validate focusAreas
    if (profile.focusAreas !== undefined) {
      if (Array.isArray(profile.focusAreas)) {
        result.focusAreas = profile.focusAreas.filter(
          (item: any) => typeof item === 'string'
        );
      } else {
        errors.push({
          field: 'focusAreas',
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: profile.focusAreas,
        });
      }
    }

    // Validate budgetRange
    if (profile.budgetRange !== undefined) {
      if (typeof profile.budgetRange === 'string') {
        result.budgetRange = profile.budgetRange;
      } else {
        errors.push({
          field: 'budgetRange',
          message: 'Expected string',
          expectedType: 'string',
          receivedValue: profile.budgetRange,
        });
      }
    }

    // Validate staffSize
    if (profile.staffSize !== undefined) {
      if (typeof profile.staffSize === 'number' && profile.staffSize > 0) {
        result.staffSize = profile.staffSize;
      } else {
        errors.push({
          field: 'staffSize',
          message: 'Expected positive number',
          expectedType: 'number',
          receivedValue: profile.staffSize,
        });
      }
    }

    // Validate lastAnalysis
    if (profile.lastAnalysis !== undefined) {
      const date = new Date(profile.lastAnalysis);
      if (!isNaN(date.getTime())) {
        result.lastAnalysis = date;
      } else {
        errors.push({
          field: 'lastAnalysis',
          message: 'Expected valid date',
          expectedType: 'Date',
          receivedValue: profile.lastAnalysis,
        });
      }
    }

    // Validate preferences
    if (profile.preferences !== undefined) {
      if (
        typeof profile.preferences === 'object' &&
        profile.preferences !== null
      ) {
        result.preferences = {};

        if (profile.preferences.communicationStyle) {
          if (
            ['formal', 'casual'].includes(
              profile.preferences.communicationStyle
            )
          ) {
            result.preferences.communicationStyle =
              profile.preferences.communicationStyle;
          } else {
            warnings.push('Invalid communicationStyle value, using default');
          }
        }

        if (profile.preferences.detailLevel) {
          if (
            ['high', 'medium', 'low'].includes(profile.preferences.detailLevel)
          ) {
            result.preferences.detailLevel = profile.preferences.detailLevel;
          } else {
            warnings.push('Invalid detailLevel value, using default');
          }
        }
      } else {
        errors.push({
          field: 'preferences',
          message: 'Expected object',
          expectedType: 'object',
          receivedValue: profile.preferences,
        });
      }
    }

    // Validate grantInterests
    if (profile.grantInterests !== undefined) {
      if (Array.isArray(profile.grantInterests)) {
        result.grantInterests = profile.grantInterests.filter(
          (item: any) => typeof item === 'string'
        );
      } else {
        errors.push({
          field: 'grantInterests',
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: profile.grantInterests,
        });
      }
    }

    // Validate organizationType
    if (profile.organizationType !== undefined) {
      if (
        ['nonprofit', 'social_enterprise', 'faith_based'].includes(
          profile.organizationType
        )
      ) {
        result.organizationType = profile.organizationType;
      } else {
        warnings.push('Invalid organizationType value, using default');
      }
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: 'userIntelligence',
          message: `Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expectedType: 'UserIntelligence',
          receivedValue: profile,
        },
      ],
    };
  }
}

// Webinar Categories utilities
export function parseWebinarCategories(
  categories: any
): ValidationResult<WebinarCategories> {
  if (!categories || typeof categories !== 'object') {
    return {
      success: true,
      data: undefined,
      warnings: ['Webinar categories is null or undefined'],
    };
  }

  const errors: JSONFieldError[] = [];

  try {
    const result: WebinarCategories = {
      primary: '',
    };

    // Validate primary category
    if (typeof categories.primary === 'string' && categories.primary.trim()) {
      result.primary = categories.primary.trim();
    } else {
      errors.push({
        field: 'primary',
        message: 'Primary category is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: categories.primary,
      });
    }

    // Validate secondary categories
    if (categories.secondary !== undefined) {
      if (Array.isArray(categories.secondary)) {
        result.secondary = categories.secondary.filter(
          (item: any) => typeof item === 'string' && item.trim()
        );
      } else {
        errors.push({
          field: 'secondary',
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: categories.secondary,
        });
      }
    }

    // Validate tags
    if (categories.tags !== undefined) {
      if (Array.isArray(categories.tags)) {
        result.tags = categories.tags.filter(
          (item: any) => typeof item === 'string' && item.trim()
        );
      } else {
        errors.push({
          field: 'tags',
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: categories.tags,
        });
      }
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: 'webinarCategories',
          message: `Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expectedType: 'WebinarCategories',
          receivedValue: categories,
        },
      ],
    };
  }
}

// Guest Speakers utilities
export function parseGuestSpeakers(
  speakers: any
): ValidationResult<GuestSpeaker[]> {
  if (!speakers) {
    return {
      success: true,
      data: undefined,
      warnings: ['Guest speakers is null or undefined'],
    };
  }

  if (!Array.isArray(speakers)) {
    return {
      success: false,
      errors: [
        {
          field: 'guestSpeakers',
          message: 'Expected array of speaker objects',
          expectedType: 'GuestSpeaker[]',
          receivedValue: speakers,
        },
      ],
    };
  }

  const errors: JSONFieldError[] = [];
  const validSpeakers: GuestSpeaker[] = [];

  speakers.forEach((speaker, index) => {
    if (typeof speaker !== 'object' || speaker === null) {
      errors.push({
        field: `guestSpeakers[${index}]`,
        message: 'Expected speaker object',
        expectedType: 'GuestSpeaker',
        receivedValue: speaker,
      });
      return;
    }

    const validSpeaker: GuestSpeaker = {
      name: '',
      title: '',
      organization: '',
    };

    // Validate required fields
    if (typeof speaker.name === 'string' && speaker.name.trim()) {
      validSpeaker.name = speaker.name.trim();
    } else {
      errors.push({
        field: `guestSpeakers[${index}].name`,
        message: 'Name is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: speaker.name,
      });
    }

    if (typeof speaker.title === 'string' && speaker.title.trim()) {
      validSpeaker.title = speaker.title.trim();
    } else {
      errors.push({
        field: `guestSpeakers[${index}].title`,
        message: 'Title is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: speaker.title,
      });
    }

    if (
      typeof speaker.organization === 'string' &&
      speaker.organization.trim()
    ) {
      validSpeaker.organization = speaker.organization.trim();
    } else {
      errors.push({
        field: `guestSpeakers[${index}].organization`,
        message: 'Organization is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: speaker.organization,
      });
    }

    // Validate optional fields
    if (speaker.bio !== undefined && typeof speaker.bio === 'string') {
      validSpeaker.bio = speaker.bio.trim();
    }

    if (
      speaker.imageUrl !== undefined &&
      typeof speaker.imageUrl === 'string'
    ) {
      validSpeaker.imageUrl = speaker.imageUrl.trim();
    }

    if (
      speaker.socialLinks !== undefined &&
      typeof speaker.socialLinks === 'object' &&
      speaker.socialLinks !== null
    ) {
      validSpeaker.socialLinks = {};
      if (typeof speaker.socialLinks.linkedin === 'string') {
        validSpeaker.socialLinks.linkedin = speaker.socialLinks.linkedin.trim();
      }
      if (typeof speaker.socialLinks.twitter === 'string') {
        validSpeaker.socialLinks.twitter = speaker.socialLinks.twitter.trim();
      }
      if (typeof speaker.socialLinks.website === 'string') {
        validSpeaker.socialLinks.website = speaker.socialLinks.website.trim();
      }
    }

    validSpeakers.push(validSpeaker);
  });

  return {
    success: errors.length === 0,
    data: validSpeakers,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Validation Rules utilities
export function parseValidationRules(
  rules: any
): ValidationResult<ValidationRules> {
  if (!rules || typeof rules !== 'object') {
    return {
      success: true,
      data: undefined,
      warnings: ['Validation rules is null or undefined'],
    };
  }

  const errors: JSONFieldError[] = [];

  try {
    const result: ValidationRules = {};

    // Validate minLength
    if (rules.minLength !== undefined) {
      if (typeof rules.minLength === 'number' && rules.minLength >= 0) {
        result.minLength = rules.minLength;
      } else {
        errors.push({
          field: 'minLength',
          message: 'Expected non-negative number',
          expectedType: 'number',
          receivedValue: rules.minLength,
        });
      }
    }

    // Validate maxLength
    if (rules.maxLength !== undefined) {
      if (typeof rules.maxLength === 'number' && rules.maxLength > 0) {
        result.maxLength = rules.maxLength;
      } else {
        errors.push({
          field: 'maxLength',
          message: 'Expected positive number',
          expectedType: 'number',
          receivedValue: rules.maxLength,
        });
      }
    }

    // Validate pattern
    if (rules.pattern !== undefined) {
      if (typeof rules.pattern === 'string') {
        try {
          new RegExp(rules.pattern);
          result.pattern = rules.pattern;
        } catch {
          errors.push({
            field: 'pattern',
            message: 'Invalid regular expression pattern',
            expectedType: 'string (valid regex)',
            receivedValue: rules.pattern,
          });
        }
      } else {
        errors.push({
          field: 'pattern',
          message: 'Expected string',
          expectedType: 'string',
          receivedValue: rules.pattern,
        });
      }
    }

    // Validate required
    if (rules.required !== undefined) {
      if (typeof rules.required === 'boolean') {
        result.required = rules.required;
      } else {
        errors.push({
          field: 'required',
          message: 'Expected boolean',
          expectedType: 'boolean',
          receivedValue: rules.required,
        });
      }
    }

    // Validate customMessage
    if (rules.customMessage !== undefined) {
      if (typeof rules.customMessage === 'string') {
        result.customMessage = rules.customMessage.trim();
      } else {
        errors.push({
          field: 'customMessage',
          message: 'Expected string',
          expectedType: 'string',
          receivedValue: rules.customMessage,
        });
      }
    }

    // Validate allowedValues
    if (rules.allowedValues !== undefined) {
      if (Array.isArray(rules.allowedValues)) {
        result.allowedValues = rules.allowedValues.filter(
          (item: any) => typeof item === 'string'
        );
      } else {
        errors.push({
          field: 'allowedValues',
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: rules.allowedValues,
        });
      }
    }

    // Validate fileTypes
    if (rules.fileTypes !== undefined) {
      if (Array.isArray(rules.fileTypes)) {
        result.fileTypes = rules.fileTypes.filter(
          (item: any) => typeof item === 'string'
        );
      } else {
        errors.push({
          field: 'fileTypes',
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: rules.fileTypes,
        });
      }
    }

    // Validate maxFileSize
    if (rules.maxFileSize !== undefined) {
      if (typeof rules.maxFileSize === 'number' && rules.maxFileSize > 0) {
        result.maxFileSize = rules.maxFileSize;
      } else {
        errors.push({
          field: 'maxFileSize',
          message: 'Expected positive number',
          expectedType: 'number',
          receivedValue: rules.maxFileSize,
        });
      }
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: 'validationRules',
          message: `Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expectedType: 'ValidationRules',
          receivedValue: rules,
        },
      ],
    };
  }
}

// PDF Key Points utilities
export function parsePDFKeyPoints(
  keyPoints: any
): ValidationResult<PDFKeyPoint[]> {
  if (!keyPoints) {
    return {
      success: true,
      data: undefined,
      warnings: ['PDF key points is null or undefined'],
    };
  }

  if (!Array.isArray(keyPoints)) {
    return {
      success: false,
      errors: [
        {
          field: 'keyPoints',
          message: 'Expected array of key point objects',
          expectedType: 'PDFKeyPoint[]',
          receivedValue: keyPoints,
        },
      ],
    };
  }

  const errors: JSONFieldError[] = [];
  const validKeyPoints: PDFKeyPoint[] = [];

  keyPoints.forEach((point, index) => {
    if (typeof point !== 'object' || point === null) {
      errors.push({
        field: `keyPoints[${index}]`,
        message: 'Expected key point object',
        expectedType: 'PDFKeyPoint',
        receivedValue: point,
      });
      return;
    }

    const validPoint: PDFKeyPoint = {
      id: '',
      text: '',
      importance: 'medium',
    };

    // Validate required fields
    if (typeof point.id === 'string' && point.id.trim()) {
      validPoint.id = point.id.trim();
    } else {
      validPoint.id = `point-${index}`;
    }

    if (typeof point.text === 'string' && point.text.trim()) {
      validPoint.text = point.text.trim();
    } else {
      errors.push({
        field: `keyPoints[${index}].text`,
        message: 'Text is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: point.text,
      });
    }

    // Validate importance
    if (point.importance !== undefined) {
      if (['low', 'medium', 'high'].includes(point.importance)) {
        validPoint.importance = point.importance;
      } else {
        errors.push({
          field: `keyPoints[${index}].importance`,
          message: 'Expected low, medium, or high',
          expectedType: 'low | medium | high',
          receivedValue: point.importance,
        });
      }
    }

    // Validate optional fields
    if (point.category !== undefined && typeof point.category === 'string') {
      validPoint.category = point.category.trim();
    }

    if (point.pageNumber !== undefined) {
      if (typeof point.pageNumber === 'number' && point.pageNumber > 0) {
        validPoint.pageNumber = point.pageNumber;
      } else {
        errors.push({
          field: `keyPoints[${index}].pageNumber`,
          message: 'Expected positive number',
          expectedType: 'number',
          receivedValue: point.pageNumber,
        });
      }
    }

    if (point.relatedPoints !== undefined) {
      if (Array.isArray(point.relatedPoints)) {
        validPoint.relatedPoints = point.relatedPoints.filter(
          (item: any) => typeof item === 'string'
        );
      } else {
        errors.push({
          field: `keyPoints[${index}].relatedPoints`,
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: point.relatedPoints,
        });
      }
    }

    validKeyPoints.push(validPoint);
  });

  return {
    success: errors.length === 0,
    data: validKeyPoints,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// PDF Recommendations utilities
export function parsePDFRecommendations(
  recommendations: any
): ValidationResult<PDFRecommendation[]> {
  if (!recommendations) {
    return {
      success: true,
      data: undefined,
      warnings: ['PDF recommendations is null or undefined'],
    };
  }

  if (!Array.isArray(recommendations)) {
    return {
      success: false,
      errors: [
        {
          field: 'recommendations',
          message: 'Expected array of recommendation objects',
          expectedType: 'PDFRecommendation[]',
          receivedValue: recommendations,
        },
      ],
    };
  }

  const errors: JSONFieldError[] = [];
  const validRecommendations: PDFRecommendation[] = [];

  recommendations.forEach((rec, index) => {
    if (typeof rec !== 'object' || rec === null) {
      errors.push({
        field: `recommendations[${index}]`,
        message: 'Expected recommendation object',
        expectedType: 'PDFRecommendation',
        receivedValue: rec,
      });
      return;
    }

    const validRec: PDFRecommendation = {
      id: '',
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      actionable: true,
    };

    // Validate required fields
    if (typeof rec.id === 'string' && rec.id.trim()) {
      validRec.id = rec.id.trim();
    } else {
      validRec.id = `rec-${index}`;
    }

    if (typeof rec.title === 'string' && rec.title.trim()) {
      validRec.title = rec.title.trim();
    } else {
      errors.push({
        field: `recommendations[${index}].title`,
        message: 'Title is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: rec.title,
      });
    }

    if (typeof rec.description === 'string' && rec.description.trim()) {
      validRec.description = rec.description.trim();
    } else {
      errors.push({
        field: `recommendations[${index}].description`,
        message: 'Description is required and must be a non-empty string',
        expectedType: 'string',
        receivedValue: rec.description,
      });
    }

    // Validate priority
    if (rec.priority !== undefined) {
      if (['low', 'medium', 'high'].includes(rec.priority)) {
        validRec.priority = rec.priority;
      } else {
        errors.push({
          field: `recommendations[${index}].priority`,
          message: 'Expected low, medium, or high',
          expectedType: 'low | medium | high',
          receivedValue: rec.priority,
        });
      }
    }

    // Validate category
    if (rec.category !== undefined) {
      if (
        ['funding', 'compliance', 'strategy', 'operations', 'other'].includes(
          rec.category
        )
      ) {
        validRec.category = rec.category;
      } else {
        errors.push({
          field: `recommendations[${index}].category`,
          message:
            'Expected funding, compliance, strategy, operations, or other',
          expectedType: 'funding | compliance | strategy | operations | other',
          receivedValue: rec.category,
        });
      }
    }

    // Validate actionable
    if (rec.actionable !== undefined) {
      if (typeof rec.actionable === 'boolean') {
        validRec.actionable = rec.actionable;
      } else {
        errors.push({
          field: `recommendations[${index}].actionable`,
          message: 'Expected boolean',
          expectedType: 'boolean',
          receivedValue: rec.actionable,
        });
      }
    }

    // Validate optional fields
    if (rec.estimatedEffort !== undefined) {
      if (['low', 'medium', 'high'].includes(rec.estimatedEffort)) {
        validRec.estimatedEffort = rec.estimatedEffort;
      } else {
        errors.push({
          field: `recommendations[${index}].estimatedEffort`,
          message: 'Expected low, medium, or high',
          expectedType: 'low | medium | high',
          receivedValue: rec.estimatedEffort,
        });
      }
    }

    if (rec.relatedPoints !== undefined) {
      if (Array.isArray(rec.relatedPoints)) {
        validRec.relatedPoints = rec.relatedPoints.filter(
          (item: any) => typeof item === 'string'
        );
      } else {
        errors.push({
          field: `recommendations[${index}].relatedPoints`,
          message: 'Expected array of strings',
          expectedType: 'string[]',
          receivedValue: rec.relatedPoints,
        });
      }
    }

    validRecommendations.push(validRec);
  });

  return {
    success: errors.length === 0,
    data: validRecommendations,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Generic validation function for any JSON field
export function validateJsonField<T>(
  data: any,
  fieldName: string,
  validator: (data: any) => ValidationResult<T>
): ValidationResult<T> {
  try {
    return validator(data);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: fieldName,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expectedType: 'valid JSON',
          receivedValue: data,
        },
      ],
    };
  }
}

// Utility to log validation errors
export function logValidationErrors(
  errors: JSONFieldError[],
  context: string = 'JSON Field Validation'
) {
  if (errors.length > 0) {
    console.error(`${context} - Validation Errors:`, errors);
  }
}

// Utility to log validation warnings
export function logValidationWarnings(
  warnings: string[],
  context: string = 'JSON Field Validation'
) {
  if (warnings.length > 0) {
    console.warn(`${context} - Validation Warnings:`, warnings);
  }
}
