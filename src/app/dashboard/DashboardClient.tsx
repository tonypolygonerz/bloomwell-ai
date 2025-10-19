'use client';

import React from 'react';
import Link from 'next/link';
import { useFeatureFlag } from '@/shared/lib/feature-flags';
import FeatureFlagToggle from '@/shared/components/FeatureFlagToggle';
import GrantsErrorBoundary from '@/features/grants/components/GrantsErrorBoundary';
import GrantsDashboard from '@/features/grants/components/GrantsDashboard';
import PDFUsageWidget from '@/features/admin/components/PDFUsageWidget';
import UpcomingEventsWidget from '@/features/admin/components/UpcomingEventsWidget';
import CompleteYourProfileWidget from '@/features/profile/components/CompleteYourProfileWidget';
import IntelligenceProfileManager from '@/features/profile/components/IntelligenceProfileManager';

interface DashboardClientProps {
  userName: string;
  userId: string;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ userName, userId }) => {
  const grantsEnabled = useFeatureFlag('GRANTS_ENABLED');
  const webinarsEnabled = useFeatureFlag('WEBINARS_ENABLED');
  const chatEnabled = useFeatureFlag('CHAT_ENABLED');
  const adminEnabled = useFeatureFlag('ADMIN_ENABLED');

  return (
    <>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Welcome back, {userName || 'User'}!
        </h1>
        <p className='mt-2 text-gray-600'>
          Your Bloomwell AI nonprofit management dashboard
        </p>
      </div>

      {/* Complete Your Profile Widget - Full Width */}
      <div className='mb-6'>
        <CompleteYourProfileWidget />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Quick Actions */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
          <div className='space-y-2'>
            {chatEnabled && (
              <>
                <Link
                  href='/chat'
                  className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
                >
                  💬 New Chat
                </Link>
                <Link
                  href='/chat?prompt=board-help'
                  className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
                >
                  👥 Board Governance Help
                </Link>
                <Link
                  href='/chat?prompt=funding-ideas'
                  className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
                >
                  💡 Funding Ideas
                </Link>
              </>
            )}
            
            {grantsEnabled && (
              <Link
                href='/chat?prompt=find-grants'
                className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
              >
                🔍 Find Grants
              </Link>
            )}
            
            <Link
              href='/documents'
              className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
            >
              📄 Analyze Documents
            </Link>
            
            <Link
              href='/templates'
              className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
            >
              📋 Guided Templates
            </Link>
          </div>
        </div>

        {/* PDF Processing */}
        <PDFUsageWidget />

        {/* Upcoming Events */}
        <UpcomingEventsWidget userId={userId} />
      </div>

      {/* Second Row */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Organization Profile */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-4'>Organization Profile</h3>
          <a
            href='/profile'
            className='block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center mb-3'
          >
            Complete Profile Setup
          </a>
          
          {adminEnabled && (
            <a
              href='/admin'
              className='block w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-center'
            >
              Admin Dashboard
            </a>
          )}
        </div>
        
        {/* Grants Dashboard with Error Boundary */}
        {grantsEnabled && (
          <div className='col-span-1 md:col-span-2'>
            <GrantsErrorBoundary>
              <GrantsDashboard />
            </GrantsErrorBoundary>
          </div>
        )}
      </div>

      {/* Additional Row */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Recent Activity */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-4'>Recent Activity</h3>
          <p className='text-gray-500'>No recent activity yet</p>
        </div>

        {/* Webinar Resources */}
        {webinarsEnabled && (
          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='text-lg font-semibold mb-4'>Webinar Resources</h3>
            <div className='space-y-2'>
              <Link
                href='/webinars'
                className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
              >
                📅 Browse All Webinars
              </Link>
              <a
                href='/notifications'
                className='block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors'
              >
                🔔 Notification Center
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Profile Section */}
      <div className='mt-6'>
        <IntelligenceProfileManager userId={userId} />
      </div>

      {/* Feature Flag Toggle */}
      <FeatureFlagToggle />
    </>
  );
};

export default DashboardClient;
