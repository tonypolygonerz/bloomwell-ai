'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  timezone: string;
  duration: number;
  thumbnailUrl?: string;
  uniqueSlug: string;
  status: 'draft' | 'published' | 'live' | 'completed';
  createdAt: string;
  rsvpCount: number;
}

interface AdminStats {
  totalWebinars: number;
  publishedWebinars: number;
  totalRSVPs: number;
  upcomingWebinars: number;
  totalUsers: number;
  activeUsers: number;
  recentUsers: number;
  usersWithOrganizations: number;
  totalGrants: number;
  activeGrants: number;
  upcomingGrants: number;
  totalAwardAmount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalWebinars: 0,
    publishedWebinars: 0,
    totalRSVPs: 0,
    upcomingWebinars: 0,
    totalUsers: 0,
    activeUsers: 0,
    recentUsers: 0,
    usersWithOrganizations: 0,
    totalGrants: 0,
    activeGrants: 0,
    upcomingGrants: 0,
    totalAwardAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{
    id: string;
    username: string;
    role: string;
  } | null>(null);
  const [selectedWebinars, setSelectedWebinars] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      setLoading(false);
      router.push('/admin/login');
      return;
    }

    try {
      const sessionData = JSON.parse(adminSession);
      setAdminUser(sessionData.admin);
      fetchWebinars(sessionData.token);
      fetchStats(sessionData.token);
    } catch (error) {
      localStorage.removeItem('adminSession');
      setLoading(false);
      router.push('/admin/login');
    }
  }, [router]);

  const fetchWebinars = async (token: string) => {
    try {
      const response = await fetch('/api/admin/webinars', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWebinars(data);
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching webinars:', error);
    }
  };

  const fetchStats = async (token: string) => {
    try {
      const [webinarStatsResponse, userStatsResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch('/api/admin/user-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (webinarStatsResponse.ok && userStatsResponse.ok) {
        const webinarStats = await webinarStatsResponse.json();
        const userStats = await userStatsResponse.json();

        setStats({
          ...webinarStats,
          ...userStats,
          totalGrants: 0,
          activeGrants: 0,
          upcomingGrants: 0,
          totalAwardAmount: 0,
        });
      } else if (
        webinarStatsResponse.status === 401 ||
        userStatsResponse.status === 401
      ) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (scheduledDate: string) => {
    const now = new Date();
    const webinarDate = new Date(scheduledDate);
    const diffMs = webinarDate.getTime() - now.getTime();

    if (diffMs < 0) return 'Past event';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
    return `${diffMinutes}m`;
  };

  const handleStatusChange = async (webinarId: string, newStatus: string) => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);
      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh webinars
        fetchWebinars(sessionData.token);
      }
    } catch (error) {
      console.error('Error updating webinar status:', error);
    }
  };

  const handleDeleteWebinar = async (
    webinarId: string,
    webinarTitle: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${webinarTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);
      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionData.token}`,
        },
      });

      if (response.ok) {
        // Refresh webinars
        fetchWebinars(sessionData.token);
      }
    } catch (error) {
      console.error('Error deleting webinar:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedWebinars.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to change the status of ${selectedWebinars.size} webinars to "${newStatus}"?`
      )
    ) {
      return;
    }

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);
      const promises = Array.from(selectedWebinars).map(webinarId =>
        fetch(`/api/admin/webinars/${webinarId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(promises);

      // Clear selection and refresh
      setSelectedWebinars(new Set());
      setShowBulkActions(false);
      fetchWebinars(sessionData.token);
    } catch (error) {
      console.error('Error updating webinar statuses:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWebinars.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedWebinars.size} webinars? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);
      const promises = Array.from(selectedWebinars).map(webinarId =>
        fetch(`/api/admin/webinars/${webinarId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        })
      );

      await Promise.all(promises);

      // Clear selection and refresh
      setSelectedWebinars(new Set());
      setShowBulkActions(false);
      fetchWebinars(sessionData.token);
    } catch (error) {
      console.error('Error deleting webinars:', error);
    }
  };

  const handleSelectWebinar = (webinarId: string) => {
    const newSelected = new Set(selectedWebinars);
    if (newSelected.has(webinarId)) {
      newSelected.delete(webinarId);
    } else {
      newSelected.add(webinarId);
    }
    setSelectedWebinars(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedWebinars.size === webinars.length) {
      setSelectedWebinars(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedWebinars(new Set(webinars.map(w => w.id)));
      setShowBulkActions(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <>
      {/* Dashboard Content */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Admin Dashboard
        </h1>
        <p className='text-gray-600'>
          Welcome, {adminUser.username} ({adminUser.role}) - Manage webinars and
          system administration for Bloomwell AI
        </p>
      </div>

      {/* Stats Cards */}
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
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Published
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    {stats.publishedWebinars}
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
                <div className='w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center'>
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
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total RSVPs
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    {stats.totalRSVPs}
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
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
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
      </div>

      {/* Content Placeholder */}
      <div className='bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300'>
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
              d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            Dashboard Content
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Your dashboard content will appear here.
          </p>
        </div>
      </div>
    </>
  );
}
