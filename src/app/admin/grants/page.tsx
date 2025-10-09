'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GrantSync {
  id: string;
  fileName: string;
  extractedDate: string;
  fileSize: string;
  syncStatus: string;
  recordsProcessed?: number;
  recordsDeleted?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface GrantsStatistics {
  activeGrants: number;
}

export default function AdminGrantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adminUser, setAdminUser] = useState<{
    id: string;
    username: string;
    role: string;
  } | null>(null);
  const [syncHistory, setSyncHistory] = useState<GrantSync[]>([]);
  const [statistics, setStatistics] = useState<GrantsStatistics>({
    activeGrants: 0,
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    try {
      const sessionData = JSON.parse(adminSession);
      setAdminUser(sessionData.admin);
      fetchGrantsData(sessionData.token);
    } catch {
      localStorage.removeItem('adminSession');
      router.push('/admin/login');
    }
  }, [router]);

  const fetchGrantsData = async (token: string) => {
    setLoading(true);
    try {
      const syncResponse = await fetch('/api/admin/grants/sync', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        setSyncHistory(syncData.syncHistory || []);

        // Use statistics from API response
        setStatistics(syncData.statistics || { activeGrants: 0 });
      } else if (syncResponse.status === 401) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      } else {
        setError('Failed to fetch grants data');
      }
    } catch (error) {
      console.error('Error fetching grants data:', error);
      setError('Failed to fetch grants data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setSuccessMessage('');

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const sessionData = JSON.parse(adminSession);
      const response = await fetch('/api/admin/grants/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(
          `Sync completed successfully! Processed ${result.result.recordsProcessed} grants, deleted ${result.result.recordsDeleted} expired grants.`
        );
        fetchGrantsData(sessionData.token); // Refresh data
      } else {
        setError(result.error || result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing grants:', error);
      setError('An error occurred during sync');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (sizeStr: string) => {
    return sizeStr || 'Unknown';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading grants management...</p>
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
        <h1 className='text-3xl font-bold text-gray-900'>Grants Management</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage federal grants data synchronization and monitoring
        </p>
      </div>

      <div>
        {/* Error/Success Messages */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}
        {successMessage && (
          <div className='mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded'>
            {successMessage}
          </div>
        )}

        {/* Active Grants Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8'>
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
                      Active Grants
                    </dt>
                    <dd className='text-lg font-medium text-gray-900'>
                      {statistics.activeGrants.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className='mt-2'>
                <p className='text-xs text-gray-500'>
                  Current grant opportunities actively accepting applications.
                  Expired grants are automatically removed during sync.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className='bg-white shadow sm:rounded-lg mb-8'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Grants Data Sync
            </h3>
            <div className='mt-2 max-w-xl text-sm text-gray-500'>
              <p>
                Synchronize federal grants data from grants.gov. This will
                download the latest XML extract, parse grant opportunities, and
                update the database. The system automatically:
              </p>
              <ul className='mt-2 list-disc list-inside space-y-1'>
                <li>
                  Automatically removes expired grants to maintain only current
                  opportunities
                </li>
                <li>Filters out city/state/municipal-only grants</li>
                <li>Handles duplicates using upsert operations</li>
                <li>Updates existing grants with latest information</li>
                <li>Only shows nonprofit-eligible, active grants to users</li>
              </ul>
            </div>
            <div className='mt-5'>
              <button
                type='button'
                onClick={handleSync}
                disabled={syncing}
                className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {syncing ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  'Sync Grants Data'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sync History */}
        <div className='bg-white shadow sm:rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Sync History
            </h3>
            <div className='mt-5'>
              {syncHistory.length === 0 ? (
                <p className='text-sm text-gray-500'>
                  No sync history available.
                </p>
              ) : (
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          File
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Extracted Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Size
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Records
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {syncHistory.map(sync => (
                        <tr key={sync.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {sync.fileName}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatDate(sync.extractedDate)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatFileSize(sync.fileSize)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sync.syncStatus)}`}
                            >
                              {sync.syncStatus}
                            </span>
                            {sync.errorMessage && (
                              <div className='mt-1 text-xs text-red-600'>
                                {sync.errorMessage}
                              </div>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {sync.recordsProcessed !== undefined && (
                              <div>
                                <div>
                                  Processed:{' '}
                                  {sync.recordsProcessed.toLocaleString()}
                                </div>
                                {sync.recordsDeleted !== undefined && (
                                  <div>
                                    Deleted:{' '}
                                    {sync.recordsDeleted.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatDate(sync.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
