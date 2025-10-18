'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type OnboardingProgress = {
  completedSections: string[];
  sectionScores: Record<string, number>;
  overallScore: number;
};

type Section = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  category: string;
};

const SECTIONS: Section[] = [
  {
    id: 'basics',
    title: 'Organization Basics',
    description: 'Name, type, mission, and core information',
    route: '/profile/basics',
    icon: '🏢',
    category: 'Core Information',
  },
  {
    id: 'programs',
    title: 'Programs & Services',
    description: 'Details about programs you offer',
    route: '/profile/programs',
    icon: '📋',
    category: 'Core Information',
  },
  {
    id: 'team',
    title: 'Team Members',
    description: 'Staff, volunteers, and board information',
    route: '/profile/team',
    icon: '👥',
    category: 'Operations',
  },
  {
    id: 'budget',
    title: 'Budget & Priorities',
    description: 'Annual budget and spending priorities',
    route: '/profile/budget',
    icon: '💰',
    category: 'Operations',
  },
  {
    id: 'funding',
    title: 'Funding History',
    description: 'Past grants and funding sources',
    route: '/profile/funding',
    icon: '📊',
    category: 'Financial',
  },
  {
    id: 'goals',
    title: 'Grant Goals',
    description: 'Funding needs and timeline',
    route: '/profile/goals',
    icon: '🎯',
    category: 'Financial',
  },
  {
    id: 'story',
    title: 'Your Story',
    description: 'Impact stories and vision',
    route: '/profile/story',
    icon: '✨',
    category: 'Impact',
  },
  {
    id: 'communication',
    title: 'Communication Preferences',
    description: "How you'd like to hear from us",
    route: '/profile/communication',
    icon: '📧',
    category: 'Preferences',
  },
];

export default function ProfileOverviewPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/onboarding/progress');
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionStatus = (sectionId: string) => {
    if (!progress) return { complete: false, score: 0 };
    const complete = progress.completedSections?.includes(sectionId);
    const score = progress.sectionScores?.[sectionId] || 0;
    return { complete, score };
  };

  const groupedSections = SECTIONS.reduce(
    (acc, section) => {
      if (!acc[section.category]) {
        acc[section.category] = [];
      }
      acc[section.category].push(section);
      return acc;
    },
    {} as Record<string, Section[]>
  );

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2'
          >
            ← Back to Dashboard
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>
            Organization Profile
          </h1>
          <p className='mt-2 text-gray-600'>
            Complete your profile to unlock better grant matching and AI
            recommendations
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg shadow-sm border-2 border-emerald-200 p-6 mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                Profile Completion
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                {progress?.completedSections?.length || 0} of {SECTIONS.length}{' '}
                sections completed
              </p>
              <div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden'>
                <div
                  className='bg-gradient-to-r from-emerald-600 to-green-500 h-full rounded-full transition-all duration-500'
                  style={{ width: `${progress?.overallScore || 0}%` }}
                ></div>
              </div>
            </div>
            <div className='ml-8'>
              <div className='flex items-center justify-center w-24 h-24 rounded-full bg-emerald-600 text-white font-bold text-2xl'>
                {progress?.overallScore || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Sections by Category */}
        {Object.entries(groupedSections).map(([category, sections]) => (
          <div key={category} className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              {category}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {sections.map(section => {
                const { complete, score } = getSectionStatus(section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => router.push(section.route)}
                    className='flex items-start gap-4 p-5 bg-white rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all group text-left'
                  >
                    <div className='text-3xl flex-shrink-0'>{section.icon}</div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors'>
                          {section.title}
                        </h3>
                        {complete && (
                          <span className='text-emerald-600 text-lg'>✓</span>
                        )}
                      </div>
                      <p className='text-sm text-gray-600 mb-2'>
                        {section.description}
                      </p>
                      {score > 0 && (
                        <div className='flex items-center gap-2'>
                          <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-emerald-500 rounded-full'
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className='text-xs font-medium text-gray-600'>
                            {score}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
                      →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Help Card */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8'>
          <div className='flex items-start gap-3'>
            <span className='text-2xl'>💡</span>
            <div>
              <h4 className='font-semibold text-blue-900 mb-2'>
                Why complete your profile?
              </h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>
                  ✓ Get better grant matches tailored to your organization
                </li>
                <li>✓ Receive more accurate AI recommendations</li>
                <li>✓ Access advanced features and insights</li>
                <li>✓ Save time with pre-filled grant applications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
