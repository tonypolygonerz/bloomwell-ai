/* eslint-disable @typescript-eslint/no-explicit-any */
// TypeScript interfaces for JSON fields in Prisma schema
// These interfaces provide type safety for JSON fields that are stored as Json? in the database

// User Intelligence Profile - LLM-optimized context for user responses
export interface UserIntelligence {
  focusAreas?: string[];
  budgetRange?: string;
  staffSize?: number;
  lastAnalysis?: Date;
  preferences?: {
    communicationStyle?: 'formal' | 'casual';
    detailLevel?: 'high' | 'medium' | 'low';
  };
  grantInterests?: string[];
  organizationType?: 'nonprofit' | 'social_enterprise' | 'faith_based';
  expertiseLevel?: 'beginner' | 'intermediate' | 'advanced';
  fundingHistory?: {
    totalGrants?: number;
    averageAward?: number;
    successRate?: number;
  };
}

// Webinar Categories - Array of category strings
export interface WebinarCategories {
  primary: string;
  secondary?: string[];
  tags?: string[];
}

// Guest Speaker - Individual speaker object
export interface GuestSpeaker {
  name: string;
  title: string;
  organization: string;
  bio?: string;
  imageUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

// Webinar Materials - Array of material objects
export interface WebinarMaterial {
  title: string;
  type: 'document' | 'video' | 'link' | 'resource';
  url?: string;
  description?: string;
  downloadRequired?: boolean;
}

// Validation Rules for Project Steps
export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  customMessage?: string;
  allowedValues?: string[];
  fileTypes?: string[];
  maxFileSize?: number;
}

// Project Step Options for select/multi_select questions
export interface StepOptions {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// User Project Metadata - Additional project-specific data
export interface UserProjectMetadata {
  customFields?: Record<string, any>;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  estimatedCompletion?: Date;
  dependencies?: string[];
  resources?: {
    documents?: string[];
    links?: string[];
    contacts?: string[];
  };
}

// Template Response Metadata - Additional response metadata
export interface TemplateResponseMetadata {
  source?: 'user' | 'ai_enhanced' | 'imported';
  confidence?: number;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewerNotes?: string;
  attachments?: string[];
  relatedResponses?: string[];
}

// PDF Processing Key Points - Array of key points
export interface PDFKeyPoint {
  id: string;
  text: string;
  category?: string;
  importance: 'low' | 'medium' | 'high';
  pageNumber?: number;
  relatedPoints?: string[];
}

// PDF Processing Recommendations - Array of recommendations
export interface PDFRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'funding' | 'compliance' | 'strategy' | 'operations' | 'other';
  actionable: boolean;
  estimatedEffort?: 'low' | 'medium' | 'high';
  relatedPoints?: string[];
}

// Organization Search Filters
export interface OrganizationSearchFilters {
  budgetRange?: string[];
  staffSize?: string[];
  focusAreas?: string[];
  location?: string[];
  organizationType?: string[];
}

// Admin Notification Target Data
export interface AdminNotificationTargetData {
  userIds?: string[];
  webinarId?: string;
  organizationIds?: string[];
  customCriteria?: Record<string, any>;
}

// Webinar Notification Schedule
export interface WebinarNotificationSchedule {
  type: '24_hours' | '1_hour' | '15_minutes' | 'starting_now' | 'followup';
  scheduledAt: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  recipients?: string[];
  templateId?: string;
}

// Grant Search Filters
export interface GrantSearchFilters {
  agencyCodes?: string[];
  cfdaNumbers?: string[];
  categories?: string[];
  fundingInstruments?: string[];
  awardCeiling?: {
    min?: number;
    max?: number;
  };
  closeDate?: {
    from?: Date;
    to?: Date;
  };
  keywords?: string[];
}

// User Activity Tracking
export interface UserActivityTracking {
  lastLogin?: Date;
  sessionDuration?: number;
  pagesVisited?: string[];
  featuresUsed?: string[];
  searchQueries?: string[];
  downloadHistory?: string[];
  engagementScore?: number;
}

// System Configuration
export interface SystemConfiguration {
  features?: {
    pdfProcessing?: boolean;
    grantSearch?: boolean;
    webinars?: boolean;
    templates?: boolean;
  };
  limits?: {
    dailyPdfProcessing?: number;
    maxFileSize?: number;
    sessionTimeout?: number;
  };
  integrations?: {
    emailService?: boolean;
    calendarService?: boolean;
    paymentService?: boolean;
  };
}

// Template System Types

// Template Selection Intelligence - Enhanced user intelligence for template recommendations
export interface TemplateSelectionIntelligence {
  userProfile: UserIntelligence;
  completedTemplates: string[];
  inProgressTemplates: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredCategories: string[];
  timeAvailability: 'low' | 'medium' | 'high';
  learningStyle: 'guided' | 'self_directed' | 'collaborative';
  lastTemplateCompleted?: Date;
  successRate: number;
  averageCompletionTime: number;
}

// Template Workflow Progress - Type-safe progress tracking
export interface TemplateWorkflowProgress {
  templateId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  skippedSteps: number[];
  stepProgress: Record<
    string,
    {
      status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
      startedAt?: Date;
      completedAt?: Date;
      timeSpent?: number; // in minutes
      attempts: number;
      lastResponse?: string;
    }
  >;
  overallProgress: number; // 0-100
  estimatedTimeRemaining: number; // in minutes
  lastActiveAt: Date;
  intelligenceUpdates: IntelligenceUpdate[];
}

// Intelligence Update - Track how user intelligence evolves during template completion
export interface IntelligenceUpdate {
  id: string;
  stepId: string;
  updateType:
    | 'focus_area'
    | 'skill_level'
    | 'preference'
    | 'knowledge'
    | 'capability';
  field: string;
  oldValue: any;
  newValue: any;
  confidence: number; // 0-1
  source: 'user_input' | 'ai_analysis' | 'pattern_recognition';
  timestamp: Date;
  reasoning?: string;
}

// Template Recommendation Score - Scoring system for template recommendations
export interface TemplateRecommendationScore {
  templateId: string;
  score: number; // 0-100
  factors: {
    skillMatch: number;
    categoryPreference: number;
    timeAvailability: number;
    prerequisiteMatch: number;
    successRate: number;
    userEngagement: number;
  };
  reasoning: string[];
  confidence: number;
}

// Template Step Response - Enhanced response structure with intelligence integration
export interface TemplateStepResponse {
  stepId: string;
  questionKey: string;
  rawAnswer: string;
  enhancedAnswer?: string;
  confidence: number;
  qualityScore: number;
  intelligenceInsights: {
    skillLevelIndicators: string[];
    focusAreaSuggestions: string[];
    capabilityAssessments: string[];
    nextStepRecommendations: string[];
  };
  metadata: TemplateResponseMetadata;
  submittedAt: Date;
}

// Template Workflow State - Complete state management for template workflows
export interface TemplateWorkflowState {
  projectId: string;
  templateId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  progress: TemplateWorkflowProgress;
  intelligenceProfile: UserIntelligence;
  responses: TemplateStepResponse[];
  recommendations: TemplateRecommendationScore[];
  createdAt: Date;
  updatedAt: Date;
}

// Template Dashboard Data - Aggregated data for template selection dashboard
export interface TemplateDashboardData {
  userIntelligence: TemplateSelectionIntelligence;
  availableTemplates: {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
    recommendationScore: number;
    isRecommended: boolean;
    prerequisites: any[];
    outcomes: any[];
  }[];
  activeProjects: {
    id: string;
    templateName: string;
    progress: number;
    currentStep: string;
    estimatedTimeRemaining: number;
    lastActiveAt: Date;
  }[];
  completedProjects: {
    id: string;
    templateName: string;
    completedAt: Date;
    finalScore: number;
    skillsGained: string[];
  }[];
  intelligenceInsights: {
    skillGaps: string[];
    recommendedCategories: string[];
    nextSteps: string[];
    successPatterns: string[];
  };
}

// Template Validation Rules - Enhanced validation for template system
export interface TemplateValidationRules extends ValidationRules {
  intelligenceIntegration?: {
    updateFields: string[];
    confidenceThreshold: number;
    analysisRequired: boolean;
  };
  progressTracking?: {
    timeTracking: boolean;
    attemptLimit: number;
    skipAllowed: boolean;
  };
  responseEnhancement?: {
    aiEnhancement: boolean;
    qualityScoring: boolean;
    confidenceThreshold: number;
  };
}

// Template Step Options - Enhanced options for template steps
export interface TemplateStepOptions extends StepOptions {
  intelligenceImpact?: {
    updatesIntelligence: boolean;
    field: string;
    weight: number;
  };
  progressWeight?: number;
  prerequisiteCheck?: string[];
}

// Error Response Structure
export interface JSONFieldError {
  field: string;
  message: string;
  expectedType: string;
  receivedValue: any;
  path?: string;
}

// Validation Result
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: JSONFieldError[];
  warnings?: string[];
}
