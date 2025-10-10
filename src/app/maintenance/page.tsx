'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MaintenanceStatus {
  isEnabled: boolean;
  message: string | null;
  enabledAt: string | null;
  environment: string;
}

export default function MaintenancePage() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceStatus();

    // Check status every 30 seconds
    const interval = setInterval(fetchMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance/status');
      const data = await response.json();
      setStatus(data);

      // If maintenance is disabled, redirect to home
      if (!data.isEnabled) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <div className='animate-pulse text-gray-600'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4'>
      <div className='max-w-2xl w-full'>
        {/* Maintenance Icon */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6'>
            <svg
              className='w-12 h-12 text-yellow-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>

          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            We&apos;ll Be Right Back!
          </h1>

          <p className='text-xl text-gray-600 mb-8'>
            Bloomwell AI is currently undergoing scheduled maintenance
          </p>
        </div>

        {/* Custom Message Card */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-6'>
          {status?.message ? (
            <div className='prose prose-lg max-w-none'>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {status.message}
              </p>
            </div>
          ) : (
            <div className='text-center'>
              <p className='text-gray-700 mb-4'>
                We&apos;re performing important updates to improve your experience.
              </p>
              <p className='text-gray-600'>
                We expect to be back shortly. Thank you for your patience!
              </p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow p-6'>
            <div className='flex items-center space-x-3 mb-3'>
              <svg
                className='w-6 h-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h3 className='text-lg font-semibold text-gray-900'>
                Status Updates
              </h3>
            </div>
            <p className='text-gray-600 text-sm'>
              This page automatically refreshes every 30 seconds to check if
              we&apos;re back online.
            </p>
          </div>

          <div className='bg-white rounded-xl shadow p-6'>
            <div className='flex items-center space-x-3 mb-3'>
              <svg
                className='w-6 h-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h3 className='text-lg font-semibold text-gray-900'>
                Need Help?
              </h3>
            </div>
            <p className='text-gray-600 text-sm'>
              For urgent matters, please contact us at support@bloomwell-ai.com
            </p>
          </div>
        </div>

        {/* Admin Access */}
        <div className='text-center'>
          <Link
            href='/admin'
            className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
            Admin Access
          </Link>
        </div>

        {/* Environment Badge (only show in non-production) */}
        {status?.environment !== 'production' && (
          <div className='mt-6 text-center'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
              Environment: {status?.environment}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
