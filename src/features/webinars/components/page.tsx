'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  timezone: string;
  duration: number;
  maxAttendees: number;
  rsvpCount: number;
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  createdAt: string;
  uniqueSlug: string;
  thumbnailUrl?: string;
}

interface WebinarStats {
  totalWebinars: number;
  upcomingWebinars: number;
  liveWebinars: number;
  completedWebinars: number;
  totalAttendees: number;
  averageAttendance: number;
}

export default function AdminWebinarsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [stats, setStats] = useState<WebinarStats>({
    totalWebinars: 0,
    upcomingWebinars: 0,
    liveWebinars: 0,
    completedWebinars: 0,
    totalAttendees: 0,
    averageAttendance: 0,
  });
  const [error, setError] = useState('');

  const fetchWebinarsData = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/webinars', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in webinars property
        const webinarsData = Array.isArray(data) ? data : data.webinars || [];
        setWebinars(webinarsData);

        // Calculate stats from the webinars data
        const totalWebinars = webinarsData.length;
        const publishedWebinars = webinarsData.filter(
          (w: Webinar) => w.status === 'published'
        ).length;
        const totalAttendees = webinarsData.reduce(
          (sum: number, w: Webinar) => sum + (w.rsvpCount || 0),
          0
        );
        const averageAttendance =
          totalWebinars > 0 ? Math.round(totalAttendees / totalWebinars) : 0;

        setStats({
          totalWebinars,
          upcomingWebinars: publishedWebinars, // Treat published as upcoming
          liveWebinars: 0, // No live webinars currently
          completedWebinars: 0, // No completed webinars currently
          totalAttendees,
          averageAttendance,
        });
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      } else {
        setError('Failed to fetch webinars data');
      }
    } catch (error) {
      console.error('Error fetching webinars data:', error);
      setError('Failed to fetch webinars data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    try {
      const sessionData = JSON.parse(adminSession);
      setAdminUser(sessionData.admin);
      fetchWebinarsData(sessionData.token);
    } catch (error) {
      console.error('Error loading admin session:', error);
      localStorage.removeItem('adminSession');
      router.push('/admin/login');
    }
  }, [router, fetchWebinarsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'live':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading webinars...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <>
      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Webinars Management
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage and monitor your webinar sessions and attendees
        </p>
      </div>

      <div>
        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        {/* Webinar Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Total Webinars
                    </dt>
                    <dd className='text-lg font-medium text-gray-900'>
                      {stats.totalWebinars}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Upcoming
                    </dt>
                    <dd className='text-lg font-medium text-gray-900'>
                      {stats.upcomingWebinars}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-green-500 rounded-md flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Live Now
                    </dt>
                    <dd className='text-lg font-medium text-gray-900'>
                      {stats.liveWebinars}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Total Attendees
                    </dt>
                    <dd className='text-lg font-medium text-gray-900'>
                      {stats.totalAttendees}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mb-6 flex space-x-4'>
          <Link
            href='/admin/webinars/new'
            className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
          >
            Create New Webinar
          </Link>
          <Link
            href='/admin/webinars/search'
            className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium'
          >
            Search Webinars
          </Link>
        </div>

        {/* Webinars List */}
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Recent Webinars
            </h3>
            <p className='mt-1 max-w-2xl text-sm text-gray-500'>
              Latest webinar sessions and their status
            </p>
          </div>
          <div className='border-t border-gray-200'>
            {webinars.length === 0 ? (
              <div className='px-6 py-12 text-center'>
                <svg
                  className='mx-auto h-12 w-12 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No webinars
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Get started by creating a new webinar.
                </p>
                <div className='mt-6'>
                  <Link
                    href='/admin/webinars/new'
                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
                  >
                    <svg
                      className='-ml-1 mr-2 h-5 w-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                    New Webinar
                  </Link>
                </div>
              </div>
            ) : (
              <ul className='divide-y divide-gray-200'>
                {webinars.map(webinar => (
                  <li key={webinar.id}>
                    <div className='px-4 py-4 sm:px-6 hover:bg-gray-50'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0'>
                            <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center'>
                              <svg
                                className='w-6 h-6 text-indigo-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                                />
                              </svg>
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='flex items-center'>
                              <p className='text-sm font-medium text-indigo-600 truncate'>
                                {webinar.title}
                              </p>
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(webinar.status)}`}
                              >
                                {webinar.status}
                              </span>
                            </div>
                            <div className='mt-1 flex items-center text-sm text-gray-500'>
                              <p>{formatDate(webinar.scheduledDate)}</p>
                              <span className='mx-2'>•</span>
                              <p>{webinar.duration} minutes</p>
                              <span className='mx-2'>•</span>
                              <p>
                                {webinar.rsvpCount}/{webinar.maxAttendees} RSVPs
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Link
                            href={`/admin/webinars/${webinar.id}/edit`}
                            className='text-indigo-600 hover:text-indigo-900 text-sm font-medium'
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/webinar/${webinar.uniqueSlug}`}
                            target='_blank'
                            className='text-gray-600 hover:text-gray-900 text-sm font-medium'
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
