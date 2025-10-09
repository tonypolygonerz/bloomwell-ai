import {
  TemplateSelectionIntelligence,
  TemplateWorkflowProgress,
  IntelligenceUpdate,
  TemplateRecommendationScore,
  TemplateStepResponse,
  TemplateWorkflowState,
  TemplateDashboardData,
  TemplateValidationRules,
  TemplateStepOptions,
  UserIntelligence,
  ValidationResult,
  JSONFieldError,
} from '@/types/json-fields';
import {
  validateJsonField,
  logValidationErrors,
  logValidationWarnings,
} from './json-field-utils';

/**
 * Template System Utilities
 * Type-safe utilities for template selection, workflow management, and intelligence integration
 */

// Template Selection Intelligence utilities
export function parseTemplateSelectionIntelligence(
  data: any
): ValidationResult<TemplateSelectionIntelligence> {
  return validateJsonField(data, 'templateSelectionIntelligence', profile => {
    if (!profile || typeof profile !== 'object') {
      return {
        success: false,
        errors: [
          {
            field: 'templateSelectionIntelligence',
            message: 'Template selection intelligence is required',
            expectedType: 'TemplateSelectionIntelligence',
            receivedValue: profile,
          },
        ],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: TemplateSelectionIntelligence = {
      userProfile: {} as UserIntelligence,
      completedTemplates: [],
      inProgressTemplates: [],
      skillLevel: 'beginner',
      preferredCategories: [],
      timeAvailability: 'medium',
      learningStyle: 'guided',
      successRate: 0,
      averageCompletionTime: 0,
    };

    // Validate userProfile
    if (profile.userProfile && typeof profile.userProfile === 'object') {
      result.userProfile = profile.userProfile;
    } else {
      errors.push({
        field: 'userProfile',
        message: 'User profile is required',
        expectedType: 'UserIntelligence',
        receivedValue: profile.userProfile,
      });
    }

    // Validate completedTemplates
    if (Array.isArray(profile.completedTemplates)) {
      result.completedTemplates = profile.completedTemplates.filter(
        (item: any) => typeof item === 'string'
      );
    }

    // Validate inProgressTemplates
    if (Array.isArray(profile.inProgressTemplates)) {
      result.inProgressTemplates = profile.inProgressTemplates.filter(
        (item: any) => typeof item === 'string'
      );
    }

    // Validate skillLevel
    if (['beginner', 'intermediate', 'advanced'].includes(profile.skillLevel)) {
      result.skillLevel = profile.skillLevel;
    }

    // Validate preferredCategories
    if (Array.isArray(profile.preferredCategories)) {
      result.preferredCategories = profile.preferredCategories.filter(
        (item: any) => typeof item === 'string'
      );
    }

    // Validate timeAvailability
    if (['low', 'medium', 'high'].includes(profile.timeAvailability)) {
      result.timeAvailability = profile.timeAvailability;
    }

    // Validate learningStyle
    if (
      ['guided', 'self_directed', 'collaborative'].includes(
        profile.learningStyle
      )
    ) {
      result.learningStyle = profile.learningStyle;
    }

    // Validate lastTemplateCompleted
    if (profile.lastTemplateCompleted) {
      const date = new Date(profile.lastTemplateCompleted);
      if (!isNaN(date.getTime())) {
        result.lastTemplateCompleted = date;
      }
    }

    // Validate successRate
    if (
      typeof profile.successRate === 'number' &&
      profile.successRate >= 0 &&
      profile.successRate <= 1
    ) {
      result.successRate = profile.successRate;
    }

    // Validate averageCompletionTime
    if (
      typeof profile.averageCompletionTime === 'number' &&
      profile.averageCompletionTime >= 0
    ) {
      result.averageCompletionTime = profile.averageCompletionTime;
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Template Workflow Progress utilities
export function parseTemplateWorkflowProgress(
  data: any
): ValidationResult<TemplateWorkflowProgress> {
  return validateJsonField(data, 'templateWorkflowProgress', progress => {
    if (!progress || typeof progress !== 'object') {
      return {
        success: false,
        errors: [
          {
            field: 'templateWorkflowProgress',
            message: 'Template workflow progress is required',
            expectedType: 'TemplateWorkflowProgress',
            receivedValue: progress,
          },
        ],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: TemplateWorkflowProgress = {
      templateId: '',
      currentStep: 1,
      totalSteps: 1,
      completedSteps: [],
      skippedSteps: [],
      stepProgress: {},
      overallProgress: 0,
      estimatedTimeRemaining: 0,
      lastActiveAt: new Date(),
      intelligenceUpdates: [],
    };

    // Validate templateId
    if (typeof progress.templateId === 'string' && progress.templateId.trim()) {
      result.templateId = progress.templateId.trim();
    } else {
      errors.push({
        field: 'templateId',
        message: 'Template ID is required',
        expectedType: 'string',
        receivedValue: progress.templateId,
      });
    }

    // Validate currentStep
    if (typeof progress.currentStep === 'number' && progress.currentStep > 0) {
      result.currentStep = progress.currentStep;
    }

    // Validate totalSteps
    if (typeof progress.totalSteps === 'number' && progress.totalSteps > 0) {
      result.totalSteps = progress.totalSteps;
    }

    // Validate completedSteps
    if (Array.isArray(progress.completedSteps)) {
      result.completedSteps = progress.completedSteps.filter(
        (item: any) => typeof item === 'number'
      );
    }

    // Validate skippedSteps
    if (Array.isArray(progress.skippedSteps)) {
      result.skippedSteps = progress.skippedSteps.filter(
        (item: any) => typeof item === 'number'
      );
    }

    // Validate stepProgress
    if (progress.stepProgress && typeof progress.stepProgress === 'object') {
      result.stepProgress = progress.stepProgress;
    }

    // Validate overallProgress
    if (
      typeof progress.overallProgress === 'number' &&
      progress.overallProgress >= 0 &&
      progress.overallProgress <= 100
    ) {
      result.overallProgress = progress.overallProgress;
    }

    // Validate estimatedTimeRemaining
    if (
      typeof progress.estimatedTimeRemaining === 'number' &&
      progress.estimatedTimeRemaining >= 0
    ) {
      result.estimatedTimeRemaining = progress.estimatedTimeRemaining;
    }

    // Validate lastActiveAt
    if (progress.lastActiveAt) {
      const date = new Date(progress.lastActiveAt);
      if (!isNaN(date.getTime())) {
        result.lastActiveAt = date;
      }
    }

    // Validate intelligenceUpdates
    if (Array.isArray(progress.intelligenceUpdates)) {
      result.intelligenceUpdates = progress.intelligenceUpdates;
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Intelligence Update utilities
export function parseIntelligenceUpdate(
  data: any
): ValidationResult<IntelligenceUpdate> {
  return validateJsonField(data, 'intelligenceUpdate', update => {
    if (!update || typeof update !== 'object') {
      return {
        success: false,
        errors: [
          {
            field: 'intelligenceUpdate',
            message: 'Intelligence update is required',
            expectedType: 'IntelligenceUpdate',
            receivedValue: update,
          },
        ],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: IntelligenceUpdate = {
      id: '',
      stepId: '',
      updateType: 'knowledge',
      field: '',
      oldValue: null,
      newValue: null,
      confidence: 0.5,
      source: 'user_input',
      timestamp: new Date(),
    };

    // Validate id
    if (typeof update.id === 'string' && update.id.trim()) {
      result.id = update.id.trim();
    } else {
      errors.push({
        field: 'id',
        message: 'ID is required',
        expectedType: 'string',
        receivedValue: update.id,
      });
    }

    // Validate stepId
    if (typeof update.stepId === 'string' && update.stepId.trim()) {
      result.stepId = update.stepId.trim();
    } else {
      errors.push({
        field: 'stepId',
        message: 'Step ID is required',
        expectedType: 'string',
        receivedValue: update.stepId,
      });
    }

    // Validate updateType
    if (
      [
        'focus_area',
        'skill_level',
        'preference',
        'knowledge',
        'capability',
      ].includes(update.updateType)
    ) {
      result.updateType = update.updateType;
    }

    // Validate field
    if (typeof update.field === 'string' && update.field.trim()) {
      result.field = update.field.trim();
    } else {
      errors.push({
        field: 'field',
        message: 'Field is required',
        expectedType: 'string',
        receivedValue: update.field,
      });
    }

    // Validate oldValue and newValue
    result.oldValue = update.oldValue;
    result.newValue = update.newValue;

    // Validate confidence
    if (
      typeof update.confidence === 'number' &&
      update.confidence >= 0 &&
      update.confidence <= 1
    ) {
      result.confidence = update.confidence;
    }

    // Validate source
    if (
      ['user_input', 'ai_analysis', 'pattern_recognition'].includes(
        update.source
      )
    ) {
      result.source = update.source;
    }

    // Validate timestamp
    if (update.timestamp) {
      const date = new Date(update.timestamp);
      if (!isNaN(date.getTime())) {
        result.timestamp = date;
      }
    }

    // Validate reasoning
    if (typeof update.reasoning === 'string') {
      result.reasoning = update.reasoning;
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Template Recommendation Score utilities
export function parseTemplateRecommendationScore(
  data: any
): ValidationResult<TemplateRecommendationScore> {
  return validateJsonField(data, 'templateRecommendationScore', score => {
    if (!score || typeof score !== 'object') {
      return {
        success: false,
        errors: [
          {
            field: 'templateRecommendationScore',
            message: 'Template recommendation score is required',
            expectedType: 'TemplateRecommendationScore',
            receivedValue: score,
          },
        ],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: TemplateRecommendationScore = {
      templateId: '',
      score: 0,
      factors: {
        skillMatch: 0,
        categoryPreference: 0,
        timeAvailability: 0,
        prerequisiteMatch: 0,
        successRate: 0,
        userEngagement: 0,
      },
      reasoning: [],
      confidence: 0,
    };

    // Validate templateId
    if (typeof score.templateId === 'string' && score.templateId.trim()) {
      result.templateId = score.templateId.trim();
    } else {
      errors.push({
        field: 'templateId',
        message: 'Template ID is required',
        expectedType: 'string',
        receivedValue: score.templateId,
      });
    }

    // Validate score
    if (
      typeof score.score === 'number' &&
      score.score >= 0 &&
      score.score <= 100
    ) {
      result.score = score.score;
    }

    // Validate factors
    if (score.factors && typeof score.factors === 'object') {
      const factors = score.factors;
      if (typeof factors.skillMatch === 'number')
        result.factors.skillMatch = factors.skillMatch;
      if (typeof factors.categoryPreference === 'number')
        result.factors.categoryPreference = factors.categoryPreference;
      if (typeof factors.timeAvailability === 'number')
        result.factors.timeAvailability = factors.timeAvailability;
      if (typeof factors.prerequisiteMatch === 'number')
        result.factors.prerequisiteMatch = factors.prerequisiteMatch;
      if (typeof factors.successRate === 'number')
        result.factors.successRate = factors.successRate;
      if (typeof factors.userEngagement === 'number')
        result.factors.userEngagement = factors.userEngagement;
    }

    // Validate reasoning
    if (Array.isArray(score.reasoning)) {
      result.reasoning = score.reasoning.filter(
        (item: any) => typeof item === 'string'
      );
    }

    // Validate confidence
    if (
      typeof score.confidence === 'number' &&
      score.confidence >= 0 &&
      score.confidence <= 1
    ) {
      result.confidence = score.confidence;
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Template Step Response utilities
export function parseTemplateStepResponse(
  data: any
): ValidationResult<TemplateStepResponse> {
  return validateJsonField(data, 'templateStepResponse', response => {
    if (!response || typeof response !== 'object') {
      return {
        success: false,
        errors: [
          {
            field: 'templateStepResponse',
            message: 'Template step response is required',
            expectedType: 'TemplateStepResponse',
            receivedValue: response,
          },
        ],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: TemplateStepResponse = {
      stepId: '',
      questionKey: '',
      rawAnswer: '',
      confidence: 0.5,
      qualityScore: 0.5,
      intelligenceInsights: {
        skillLevelIndicators: [],
        focusAreaSuggestions: [],
        capabilityAssessments: [],
        nextStepRecommendations: [],
      },
      metadata: {} as any,
      submittedAt: new Date(),
    };

    // Validate stepId
    if (typeof response.stepId === 'string' && response.stepId.trim()) {
      result.stepId = response.stepId.trim();
    } else {
      errors.push({
        field: 'stepId',
        message: 'Step ID is required',
        expectedType: 'string',
        receivedValue: response.stepId,
      });
    }

    // Validate questionKey
    if (
      typeof response.questionKey === 'string' &&
      response.questionKey.trim()
    ) {
      result.questionKey = response.questionKey.trim();
    } else {
      errors.push({
        field: 'questionKey',
        message: 'Question key is required',
        expectedType: 'string',
        receivedValue: response.questionKey,
      });
    }

    // Validate rawAnswer
    if (typeof response.rawAnswer === 'string') {
      result.rawAnswer = response.rawAnswer;
    } else {
      errors.push({
        field: 'rawAnswer',
        message: 'Raw answer is required',
        expectedType: 'string',
        receivedValue: response.rawAnswer,
      });
    }

    // Validate enhancedAnswer
    if (typeof response.enhancedAnswer === 'string') {
      result.enhancedAnswer = response.enhancedAnswer;
    }

    // Validate confidence
    if (
      typeof response.confidence === 'number' &&
      response.confidence >= 0 &&
      response.confidence <= 1
    ) {
      result.confidence = response.confidence;
    }

    // Validate qualityScore
    if (
      typeof response.qualityScore === 'number' &&
      response.qualityScore >= 0 &&
      response.qualityScore <= 1
    ) {
      result.qualityScore = response.qualityScore;
    }

    // Validate intelligenceInsights
    if (
      response.intelligenceInsights &&
      typeof response.intelligenceInsights === 'object'
    ) {
      const insights = response.intelligenceInsights;
      if (Array.isArray(insights.skillLevelIndicators)) {
        result.intelligenceInsights.skillLevelIndicators =
          insights.skillLevelIndicators.filter(
            (item: any) => typeof item === 'string'
          );
      }
      if (Array.isArray(insights.focusAreaSuggestions)) {
        result.intelligenceInsights.focusAreaSuggestions =
          insights.focusAreaSuggestions.filter(
            (item: any) => typeof item === 'string'
          );
      }
      if (Array.isArray(insights.capabilityAssessments)) {
        result.intelligenceInsights.capabilityAssessments =
          insights.capabilityAssessments.filter(
            (item: any) => typeof item === 'string'
          );
      }
      if (Array.isArray(insights.nextStepRecommendations)) {
        result.intelligenceInsights.nextStepRecommendations =
          insights.nextStepRecommendations.filter(
            (item: any) => typeof item === 'string'
          );
      }
    }

    // Validate metadata
    if (response.metadata && typeof response.metadata === 'object') {
      result.metadata = response.metadata;
    }

    // Validate submittedAt
    if (response.submittedAt) {
      const date = new Date(response.submittedAt);
      if (!isNaN(date.getTime())) {
        result.submittedAt = date;
      }
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Template Validation Rules utilities
export function parseTemplateValidationRules(
  data: any
): ValidationResult<TemplateValidationRules> {
  return validateJsonField(data, 'templateValidationRules', rules => {
    if (!rules || typeof rules !== 'object') {
      return {
        success: true,
        data: undefined,
        warnings: ['Template validation rules is null or undefined'],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: TemplateValidationRules = {};

    // Validate intelligenceIntegration
    if (
      rules.intelligenceIntegration &&
      typeof rules.intelligenceIntegration === 'object'
    ) {
      result.intelligenceIntegration = {
        updateFields: [],
        confidenceThreshold: 0.5,
        analysisRequired: false,
      };

      if (Array.isArray(rules.intelligenceIntegration.updateFields)) {
        result.intelligenceIntegration.updateFields =
          rules.intelligenceIntegration.updateFields.filter(
            (item: any) => typeof item === 'string'
          );
      }

      if (
        typeof rules.intelligenceIntegration.confidenceThreshold === 'number'
      ) {
        result.intelligenceIntegration.confidenceThreshold =
          rules.intelligenceIntegration.confidenceThreshold;
      }

      if (typeof rules.intelligenceIntegration.analysisRequired === 'boolean') {
        result.intelligenceIntegration.analysisRequired =
          rules.intelligenceIntegration.analysisRequired;
      }
    }

    // Validate progressTracking
    if (rules.progressTracking && typeof rules.progressTracking === 'object') {
      result.progressTracking = {
        timeTracking: false,
        attemptLimit: 3,
        skipAllowed: false,
      };

      if (typeof rules.progressTracking.timeTracking === 'boolean') {
        result.progressTracking.timeTracking =
          rules.progressTracking.timeTracking;
      }

      if (typeof rules.progressTracking.attemptLimit === 'number') {
        result.progressTracking.attemptLimit =
          rules.progressTracking.attemptLimit;
      }

      if (typeof rules.progressTracking.skipAllowed === 'boolean') {
        result.progressTracking.skipAllowed =
          rules.progressTracking.skipAllowed;
      }
    }

    // Validate responseEnhancement
    if (
      rules.responseEnhancement &&
      typeof rules.responseEnhancement === 'object'
    ) {
      result.responseEnhancement = {
        aiEnhancement: false,
        qualityScoring: false,
        confidenceThreshold: 0.5,
      };

      if (typeof rules.responseEnhancement.aiEnhancement === 'boolean') {
        result.responseEnhancement.aiEnhancement =
          rules.responseEnhancement.aiEnhancement;
      }

      if (typeof rules.responseEnhancement.qualityScoring === 'boolean') {
        result.responseEnhancement.qualityScoring =
          rules.responseEnhancement.qualityScoring;
      }

      if (typeof rules.responseEnhancement.confidenceThreshold === 'number') {
        result.responseEnhancement.confidenceThreshold =
          rules.responseEnhancement.confidenceThreshold;
      }
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Template Step Options utilities
export function parseTemplateStepOptions(
  data: any
): ValidationResult<TemplateStepOptions> {
  return validateJsonField(data, 'templateStepOptions', options => {
    if (!options || typeof options !== 'object') {
      return {
        success: true,
        data: undefined,
        warnings: ['Template step options is null or undefined'],
      };
    }

    const errors: JSONFieldError[] = [];
    const result: TemplateStepOptions = {
      value: '',
      label: '',
    };

    // Validate basic options
    if (typeof options.value === 'string') {
      result.value = options.value;
    }

    if (typeof options.label === 'string') {
      result.label = options.label;
    }

    if (typeof options.description === 'string') {
      result.description = options.description;
    }

    if (typeof options.disabled === 'boolean') {
      result.disabled = options.disabled;
    }

    // Validate intelligenceImpact
    if (
      options.intelligenceImpact &&
      typeof options.intelligenceImpact === 'object'
    ) {
      result.intelligenceImpact = {
        updatesIntelligence: false,
        field: '',
        weight: 1,
      };

      if (typeof options.intelligenceImpact.updatesIntelligence === 'boolean') {
        result.intelligenceImpact.updatesIntelligence =
          options.intelligenceImpact.updatesIntelligence;
      }

      if (typeof options.intelligenceImpact.field === 'string') {
        result.intelligenceImpact.field = options.intelligenceImpact.field;
      }

      if (typeof options.intelligenceImpact.weight === 'number') {
        result.intelligenceImpact.weight = options.intelligenceImpact.weight;
      }
    }

    // Validate progressWeight
    if (typeof options.progressWeight === 'number') {
      result.progressWeight = options.progressWeight;
    }

    // Validate prerequisiteCheck
    if (Array.isArray(options.prerequisiteCheck)) {
      result.prerequisiteCheck = options.prerequisiteCheck.filter(
        (item: any) => typeof item === 'string'
      );
    }

    return {
      success: errors.length === 0,
      data: result,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

// Utility functions for template system operations

/**
 * Calculate template recommendation score based on user intelligence
 */
export function calculateTemplateRecommendationScore(
  templateId: string,
  userIntelligence: TemplateSelectionIntelligence,
  templateData: any
): TemplateRecommendationScore {
  const factors = {
    skillMatch: 0,
    categoryPreference: 0,
    timeAvailability: 0,
    prerequisiteMatch: 0,
    successRate: 0,
    userEngagement: 0,
  };

  const reasoning: string[] = [];

  // Calculate skill match
  if (templateData.difficulty === userIntelligence.skillLevel) {
    factors.skillMatch = 100;
    reasoning.push('Perfect skill level match');
  } else if (
    (templateData.difficulty === 'intermediate' &&
      userIntelligence.skillLevel === 'beginner') ||
    (templateData.difficulty === 'advanced' &&
      userIntelligence.skillLevel === 'intermediate')
  ) {
    factors.skillMatch = 70;
    reasoning.push('Appropriate skill progression');
  } else {
    factors.skillMatch = 30;
    reasoning.push('Skill level mismatch - may be challenging');
  }

  // Calculate category preference
  if (userIntelligence.preferredCategories.includes(templateData.category)) {
    factors.categoryPreference = 100;
    reasoning.push('Matches preferred category');
  } else {
    factors.categoryPreference = 50;
    reasoning.push('New category to explore');
  }

  // Calculate time availability
  const timeMatch =
    templateData.estimatedTime <= 2
      ? 'high'
      : templateData.estimatedTime <= 5
        ? 'medium'
        : 'low';

  if (timeMatch === userIntelligence.timeAvailability) {
    factors.timeAvailability = 100;
    reasoning.push('Time commitment matches availability');
  } else if (
    (timeMatch === 'medium' && userIntelligence.timeAvailability === 'high') ||
    (timeMatch === 'low' && userIntelligence.timeAvailability === 'medium')
  ) {
    factors.timeAvailability = 80;
    reasoning.push('Manageable time commitment');
  } else {
    factors.timeAvailability = 40;
    reasoning.push('May require more time than available');
  }

  // Calculate overall score
  const score = Math.round(
    factors.skillMatch * 0.3 +
      factors.categoryPreference * 0.25 +
      factors.timeAvailability * 0.2 +
      factors.prerequisiteMatch * 0.15 +
      factors.successRate * 0.05 +
      factors.userEngagement * 0.05
  );

  return {
    templateId,
    score: Math.min(100, Math.max(0, score)),
    factors,
    reasoning,
    confidence: 0.8,
  };
}

/**
 * Update user intelligence based on template step response
 */
export function updateUserIntelligenceFromResponse(
  currentIntelligence: UserIntelligence,
  response: TemplateStepResponse,
  stepData: any
): { intelligence: UserIntelligence; updates: IntelligenceUpdate[] } {
  const updates: IntelligenceUpdate[] = [];
  const intelligence = { ...currentIntelligence };

  // Analyze response for intelligence updates
  if (response.intelligenceInsights.skillLevelIndicators.length > 0) {
    const update: IntelligenceUpdate = {
      id: `update-${Date.now()}`,
      stepId: response.stepId,
      updateType: 'skill_level',
      field: 'expertiseLevel',
      oldValue: intelligence.expertiseLevel,
      newValue: response.intelligenceInsights.skillLevelIndicators[0],
      confidence: response.confidence,
      source: 'ai_analysis',
      timestamp: new Date(),
      reasoning: 'Skill level assessment based on response quality',
    };
    updates.push(update);
    intelligence.expertiseLevel = response.intelligenceInsights
      .skillLevelIndicators[0] as any;
  }

  if (response.intelligenceInsights.focusAreaSuggestions.length > 0) {
    const newFocusAreas = [...(intelligence.focusAreas || [])];
    response.intelligenceInsights.focusAreaSuggestions.forEach(suggestion => {
      if (!newFocusAreas.includes(suggestion)) {
        newFocusAreas.push(suggestion);
        const update: IntelligenceUpdate = {
          id: `update-${Date.now()}-${suggestion}`,
          stepId: response.stepId,
          updateType: 'focus_area',
          field: 'focusAreas',
          oldValue: intelligence.focusAreas,
          newValue: newFocusAreas,
          confidence: response.confidence,
          source: 'ai_analysis',
          timestamp: new Date(),
          reasoning: 'Focus area identified from response content',
        };
        updates.push(update);
      }
    });
    intelligence.focusAreas = newFocusAreas;
  }

  return { intelligence, updates };
}

/**
 * Calculate workflow progress based on completed steps
 */
export function calculateWorkflowProgress(
  currentStep: number,
  totalSteps: number,
  completedSteps: number[],
  skippedSteps: number[]
): number {
  const completedCount = completedSteps.length;
  const skippedCount = skippedSteps.length;
  const totalCompleted = completedCount + skippedCount;

  return Math.round((totalCompleted / totalSteps) * 100);
}

/**
 * Estimate time remaining based on progress and average completion time
 */
export function estimateTimeRemaining(
  currentStep: number,
  totalSteps: number,
  averageStepTime: number,
  userIntelligence: TemplateSelectionIntelligence
): number {
  const remainingSteps = totalSteps - currentStep + 1;
  const baseTime = remainingSteps * averageStepTime;

  // Adjust based on user's learning style and time availability
  let multiplier = 1;
  if (userIntelligence.learningStyle === 'guided') multiplier *= 0.8;
  if (userIntelligence.timeAvailability === 'high') multiplier *= 0.7;
  if (userIntelligence.timeAvailability === 'low') multiplier *= 1.3;

  return Math.round(baseTime * multiplier);
}
