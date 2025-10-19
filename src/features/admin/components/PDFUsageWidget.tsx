'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UsageStats {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetTime: string;
}

interface RecentProcessing {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  documentType: string;
  summary: string;
  status: string;
  createdAt: string;
  processingTime: number;
}

export default function PDFUsageWidget() {
  const { data: session } = useSession();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentProcessings, setRecentProcessings] = useState<
    RecentProcessing[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadPDFUsage();
    }
  }, [session]);

  const loadPDFUsage = async () => {
    try {
      const response = await fetch('/api/pdf/process');
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage);
        setRecentProcessings(data.recentProcessings || []);
      }
    } catch (error) {
      console.error('Failed to load PDF usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-semibold mb-4'>PDF Processing</h3>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-2 bg-gray-200 rounded w-full mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
    );
  }

  const usagePercentage = usageStats
    ? (usageStats.used / usageStats.dailyLimit) * 100
    : 0;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold'>PDF Processing</h3>
        <a
          href='/documents'
          className='text-sm text-green-600 hover:text-green-700 font-medium'
        >
          View All
        </a>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className='mb-4'>
          <div className='flex items-center justify-between text-sm mb-2'>
            <span className='text-gray-600'>Daily Usage</span>
            <span
              className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {usageStats.used}/{usageStats.dailyLimit}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit
                  ? 'bg-red-500'
                  : isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <p className='text-xs text-gray-500'>
            Resets at {new Date(usageStats.resetTime).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Quick Upload */}
      <div className='mb-4'>
        <a
          href='/documents'
          className={`block w-full text-center py-2 px-4 rounded text-sm font-medium transition-colors ${
            isAtLimit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isAtLimit ? 'Daily Limit Reached' : 'Upload PDF'}
        </a>
      </div>

      {/* Recent Processings */}
      {recentProcessings.length > 0 && (
        <div>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>
            Recent Documents
          </h4>
          <div className='space-y-2'>
            {recentProcessings.slice(0, 3).map(processing => (
              <div
                key={processing.id}
                className='flex items-center space-x-3 p-2 bg-gray-50 rounded'
              >
                <div className='w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0'>
                  <svg
                    className='w-4 h-4 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {processing.fileName}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {processing.documentType} • {processing.pageCount} pages
                  </p>
                </div>
                <div className='text-xs text-gray-400'>
                  {new Date(processing.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentProcessings.length === 0 && (
        <div className='text-center py-4'>
          <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2'>
            <svg
              className='w-6 h-6 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
              />
            </svg>
          </div>
          <p className='text-sm text-gray-500'>No PDFs processed yet</p>
          <p className='text-xs text-gray-400 mt-1'>
            Upload your first document to get started
          </p>
        </div>
      )}
    </div>
  );
}
