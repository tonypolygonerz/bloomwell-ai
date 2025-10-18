'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
};

const SECTIONS: Section[] = [
  {
    id: 'basics',
    title: 'Organization Basics',
    description: 'Name, type, mission, and core information',
    route: '/profile/basics',
    icon: '🏢',
  },
  {
    id: 'programs',
    title: 'Programs & Services',
    description: 'Details about programs you offer',
    route: '/profile/programs',
    icon: '📋',
  },
  {
    id: 'team',
    title: 'Team Members',
    description: 'Staff, volunteers, and board information',
    route: '/profile/team',
    icon: '👥',
  },
  {
    id: 'budget',
    title: 'Budget & Priorities',
    description: 'Annual budget and spending priorities',
    route: '/profile/budget',
    icon: '💰',
  },
  {
    id: 'funding',
    title: 'Funding History',
    description: 'Past grants and funding sources',
    route: '/profile/funding',
    icon: '📊',
  },
  {
    id: 'goals',
    title: 'Grant Goals',
    description: 'Funding needs and timeline',
    route: '/profile/goals',
    icon: '🎯',
  },
  {
    id: 'story',
    title: 'Your Story',
    description: 'Impact stories and vision',
    route: '/profile/story',
    icon: '✨',
  },
  {
    id: 'communication',
    title: 'Communication Preferences',
    description: "How you'd like to hear from us",
    route: '/profile/communication',
    icon: '📧',
  },
];

export default function CompleteYourProfileWidget() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setError(null);
      
      // Add cache-busting for development, but use cache in production
      const cacheKey = 'onboarding-progress';
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;
          const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
          
          if (cacheAge < CACHE_DURATION) {
            setProgress(parsed.progress);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Invalid cache, continue with fetch
        }
      }

      const response = await fetch('/api/onboarding/progress', {
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        
        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify({
          progress: data.progress,
          timestamp: Date.now(),
        }));
      } else {
        setError('Failed to load progress data');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setError('Network error loading progress');
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = () => {
    sessionStorage.removeItem('onboarding-progress');
    fetchProgress();
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProgress();
  }, []);

  // Listen for focus events to refresh data when user returns to dashboard
  useEffect(() => {
    const handleFocus = () => {
      const cachedData = sessionStorage.getItem('onboarding-progress');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;
          if (cacheAge > 60000) {
            refreshProgress();
          }
        } catch (e) {
          refreshProgress();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return (
      <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg shadow-sm border-2 border-emerald-200 p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/2 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
          <div className='h-3 bg-gray-200 rounded w-full mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-2/3'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 rounded-lg shadow-sm border-2 border-red-200 p-6'>
        <div className='flex items-center gap-2 text-red-800 mb-2'>
          <span>⚠️</span>
          <h3 className='font-semibold'>Unable to load profile progress</h3>
        </div>
        <p className='text-red-700 text-sm mb-3'>{error}</p>
        <button
          onClick={fetchProgress}
          className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm'
        >
          Try Again
        </button>
      </div>
    );
  }

  // Don't show widget if profile is 100% complete
  if (progress?.overallScore === 100) {
    return null;
  }

  const incompleteSections = SECTIONS.filter(
    section => !progress?.completedSections?.includes(section.id)
  );

  const completedCount = progress?.completedSections?.length || 0;
  const totalCount = SECTIONS.length;
  const progressPercentage = progress?.overallScore || 0;

  return (
    <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg shadow-sm border-2 border-emerald-200 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-xl font-bold text-gray-900 mb-1'>
            Complete Your Profile
          </h3>
          <p className='text-sm text-gray-600'>
            Help us match you with better grants and opportunities
          </p>
        </div>
        <div className='ml-4'>
          <div className='flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-lg'>
            {progressPercentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-medium text-gray-700'>
            {completedCount} of {totalCount} sections completed
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
          <div
            className='bg-gradient-to-r from-emerald-600 to-green-500 h-full rounded-full transition-all duration-500 ease-out'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Incomplete Sections */}
      {incompleteSections.length > 0 && (
        <div className='space-y-3 mb-4'>
          <h4 className='text-sm font-semibold text-gray-700 mb-2'>
            Complete these sections:
          </h4>
          <div className='grid gap-2'>
            {incompleteSections.slice(0, 4).map(section => (
              <button
                key={section.id}
                onClick={() => router.push(section.route)}
                className='flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all group text-left'
              >
                <span className='text-2xl'>{section.icon}</span>
                <div className='flex-1 min-w-0'>
                  <h5 className='font-medium text-gray-900 group-hover:text-emerald-600 transition-colors'>
                    {section.title}
                  </h5>
                  <p className='text-xs text-gray-500 truncate'>
                    {section.description}
                  </p>
                </div>
                <div className='text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity'>
                  →
                </div>
              </button>
            ))}
          </div>

          {incompleteSections.length > 4 && (
            <p className='text-xs text-gray-500 text-center mt-2'>
              +{incompleteSections.length - 4} more sections to complete
            </p>
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className='pt-4 border-t border-emerald-200'>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <span className='text-emerald-600'>💡</span>
          <span>
            Complete your profile to unlock better grant matching and AI
            recommendations
          </span>
        </div>
      </div>
    </div>
  );
}
