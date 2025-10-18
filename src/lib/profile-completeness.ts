import type {
  Organization,
  Program,
  TeamMember,
  FundingHistory,
} from '@prisma/client';

// Note: Document model will need to be added to Prisma schema
type Document = {
  id: string;
  documentType: string;
};

type OrganizationWithRelations = Organization & {
  programs: Program[];
  teamMembers: TeamMember[];
  fundingHistory: FundingHistory[];
  documents?: Document[];
};

export type ProfileSection = {
  id: string;
  name: string;
  description: string;
  score: number; // 0-100
  icon: string; // Icon name for Heroicons
  href: string;
  estimatedMinutes: number;
  requiredFields: string[];
  optionalFields: string[];
};

export function calculateSectionCompleteness(
  organization: OrganizationWithRelations | null
): ProfileSection[] {
  return [
    {
      id: 'basics',
      name: 'Organization Basics',
      description: 'Your organization name, mission, and focus areas',
      score: calculateBasicsScore(organization),
      icon: 'BuildingOfficeIcon',
      href: '/profile/basics',
      estimatedMinutes: 5,
      requiredFields: ['name', 'mission', 'focusAreas'],
      optionalFields: ['ein', 'organizationType', 'state'],
    },
    {
      id: 'programs',
      name: 'Programs & Services',
      description: 'Tell us about the programs you run',
      score: calculateProgramsScore(organization),
      icon: 'LightBulbIcon',
      href: '/profile/programs',
      estimatedMinutes: 10,
      requiredFields: ['programs'],
      optionalFields: [],
    },
    {
      id: 'team',
      name: 'Your Team',
      description: 'Staff, volunteers, and board information',
      score: calculateTeamScore(organization),
      icon: 'UserGroupIcon',
      href: '/profile/team',
      estimatedMinutes: 5,
      requiredFields: ['fullTimeStaff', 'volunteers'],
      optionalFields: [
        'partTimeStaff',
        'contractors',
        'boardSize',
        'teamMembers',
      ],
    },
    {
      id: 'budget',
      name: 'Budget & Finances',
      description: 'Your annual budget and priorities',
      score: calculateBudgetScore(organization),
      icon: 'CurrencyDollarIcon',
      href: '/profile/budget',
      estimatedMinutes: 5,
      requiredFields: ['budget'],
      optionalFields: ['budgetPriorities'],
    },
    {
      id: 'funding',
      name: 'Funding History',
      description: 'Previous grants and funding sources',
      score: calculateFundingScore(organization),
      icon: 'DocumentCheckIcon',
      href: '/profile/funding',
      estimatedMinutes: 8,
      requiredFields: ['hasReceivedGrants'],
      optionalFields: ['fundingHistory'],
    },
    {
      id: 'documents',
      name: 'Important Documents',
      description: 'Upload key documents like your 990 and bylaws',
      score: calculateDocumentsScore(organization),
      icon: 'DocumentTextIcon',
      href: '/profile/documents',
      estimatedMinutes: 15,
      requiredFields: [],
      optionalFields: ['documents'],
    },
    {
      id: 'goals',
      name: 'Grant Goals',
      description: 'What funding would help you accomplish',
      score: calculateGoalsScore(organization),
      icon: 'TargetIcon',
      href: '/profile/goals',
      estimatedMinutes: 5,
      requiredFields: ['fundingGoals', 'seekingAmount'],
      optionalFields: ['timeline'],
    },
    {
      id: 'story',
      name: 'Your Story',
      description: 'Share your impact and success stories',
      score: calculateStoryScore(organization),
      icon: 'ChatBubbleBottomCenterTextIcon',
      href: '/profile/story',
      estimatedMinutes: 10,
      requiredFields: ['successStory'],
      optionalFields: ['problemSolving', 'beneficiaries', 'dreamScenario'],
    },
  ];
}

/**
 * Calculate overall profile completeness percentage
 */
export function calculateOverallCompleteness(
  organization: OrganizationWithRelations | null
): number {
  const sections = calculateSectionCompleteness(organization);
  const totalScore = sections.reduce((sum, section) => sum + section.score, 0);
  return Math.round(totalScore / sections.length);
}

/**
 * Get incomplete sections for dashboard widget
 */
export function getIncompleteSections(
  organization: OrganizationWithRelations | null
): ProfileSection[] {
  const sections = calculateSectionCompleteness(organization);
  return sections.filter(section => section.score < 100);
}

/**
 * Get sections by completion status
 */
export function groupSectionsByStatus(
  organization: OrganizationWithRelations | null
): {
  complete: ProfileSection[];
  inProgress: ProfileSection[];
  notStarted: ProfileSection[];
} {
  const sections = calculateSectionCompleteness(organization);

  return {
    complete: sections.filter(s => s.score === 100),
    inProgress: sections.filter(s => s.score > 0 && s.score < 100),
    notStarted: sections.filter(s => s.score === 0),
  };
}

// ============================================================================
// Scoring Functions
// ============================================================================

function calculateBasicsScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;
  let score = 0;

  // Required (60 points)
  if (org.name) score += 20;
  if (org.mission && org.mission.length > 20) score += 20;
  if (org.focusAreas && org.focusAreas.length > 0) score += 20;

  // Optional (40 points)
  if (org.ein) score += 15;
  if (org.organizationType) score += 15;
  if (org.state) score += 10;

  return Math.round(score);
}

function calculateProgramsScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;

  const programs = org.programs || [];
  if (programs.length === 0) return 0;
  if (programs.length === 1) return 60;

  // Bonus for well-described programs
  const wellDescribed = programs.filter(
    p => p.description && p.whoServed && p.goals
  ).length;

  return Math.min(100, 60 + wellDescribed * 20);
}

function calculateTeamScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;
  let score = 0;

  // Required (50 points)
  if (org.fullTimeStaff !== null && org.fullTimeStaff !== undefined)
    score += 25;
  if (org.volunteers !== null && org.volunteers !== undefined) score += 25;

  // Optional (50 points)
  if (org.partTimeStaff !== null) score += 10;
  if (org.contractors !== null) score += 10;
  if (org.boardSize !== null) score += 10;
  if (org.teamMembers && org.teamMembers.length > 0) score += 20;

  return Math.round(score);
}

function calculateBudgetScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;
  let score = 0;

  if (org.budget) score += 70;

  if (
    org.budgetPriorities &&
    typeof org.budgetPriorities === 'object' &&
    Array.isArray(org.budgetPriorities) &&
    org.budgetPriorities.length > 0
  ) {
    score += 30;
  }

  return Math.round(score);
}

function calculateFundingScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;
  let score = 0;

  if (org.hasReceivedGrants !== null && org.hasReceivedGrants !== undefined)
    score += 40;

  const history = org.fundingHistory || [];
  if (history.length > 0) score += Math.min(60, history.length * 20);

  return Math.round(Math.min(100, score));
}

function calculateDocumentsScore(
  org: OrganizationWithRelations | null
): number {
  if (!org || !org.documents) return 0;

  const documents = org.documents || [];
  if (documents.length === 0) return 0;

  const has990 = documents.some(d => d.documentType === '990');
  const has501c3 = documents.some(d => d.documentType === '501c3');
  const hasBylaws = documents.some(d => d.documentType === 'bylaws');

  let score = 0;
  if (has990) score += 40;
  if (has501c3) score += 30;
  if (hasBylaws) score += 20;

  // Bonus for additional documents
  const otherDocs =
    documents.length - [has990, has501c3, hasBylaws].filter(Boolean).length;
  score += Math.min(10, otherDocs * 2);

  return Math.round(Math.min(100, score));
}

function calculateGoalsScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;
  let score = 0;

  if (
    org.fundingGoals &&
    typeof org.fundingGoals === 'object' &&
    Array.isArray(org.fundingGoals) &&
    org.fundingGoals.length > 0
  ) {
    score += 50;
  }

  if (org.seekingAmount) score += 30;
  if (org.timeline) score += 20;

  return Math.round(score);
}

function calculateStoryScore(org: OrganizationWithRelations | null): number {
  if (!org) return 0;
  let score = 0;

  if (org.successStory && org.successStory.length > 50) score += 50;
  if (org.problemSolving && org.problemSolving.length > 30) score += 20;
  if (org.beneficiaries && org.beneficiaries.length > 30) score += 15;
  if (org.dreamScenario && org.dreamScenario.length > 30) score += 15;

  return Math.round(score);
}
