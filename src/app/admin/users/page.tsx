'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSearchFilters from '@/components/AdminSearchFilters';

type AdminUser = {
  id: string;
  username: string;
  role: string;
};

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  organization?: {
    id: string;
    name: string;
    mission?: string;
    budget?: string;
    staffSize?: string;
  };
  accountType: string;
  lastLogin: string;
  createdAt: string;
  status: string;
  conversationCount: number;
  rsvpCount: number;
  lastConversation?: string;
  lastRSVP?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }

    try {
      const sessionData = JSON.parse(adminSession);
      setAdminUser(sessionData.admin);
      fetchUsers(sessionData.token);
    } catch (_error) {
      localStorage.removeItem('adminSession');
      router.push('/admin/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (adminUser) {
      fetchUsers();
    }
  }, [searchParams, pagination.page, adminUser]);

  const fetchUsers = async (token?: string) => {
    if (!token) {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;
      const sessionData = JSON.parse(adminSession);
      token = sessionData.token;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...searchParams,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/users/export?${params}`, {
        headers: {
          Authorization: `Bearer ${sessionData.token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleSort = (column: string) => {
    const currentSort = searchParams.sortBy || 'createdAt';
    const currentOrder = searchParams.sortOrder || 'desc';

    const newOrder =
      currentSort === column && currentOrder === 'desc' ? 'asc' : 'desc';
    handleSearch({
      ...searchParams,
      sortBy: column,
      sortOrder: newOrder,
    });
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

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'google':
        return 'bg-blue-100 text-blue-800';
      case 'azure-ad':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && users.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>User Management</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage and monitor your customer base - {pagination.total} total users
        </p>
      </div>

      <div>
        {/* Search and Filters */}
        <AdminSearchFilters type='users' onSearch={handleSearch} />

        {/* Users Table */}
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          <div className='px-4 py-5 sm:px-6'>
            <div className='flex justify-between items-center'>
              <div>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Users
                </h3>
                <p className='mt-1 max-w-2xl text-sm text-gray-500'>
                  Complete list of registered users with activity information
                </p>
              </div>
              <button
                onClick={handleExport}
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium'
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className='border-t border-gray-200'>
            {users.length === 0 ? (
              <div className='text-center py-12'>
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
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No users found
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Try adjusting your search criteria.
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                        onClick={() => handleSort('name')}
                      >
                        <div className='flex items-center'>
                          User
                          {(searchParams.sortBy || 'createdAt') === 'name' && (
                            <span className='ml-1'>
                              {(searchParams.sortOrder || 'desc') === 'asc'
                                ? '↑'
                                : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                        onClick={() => handleSort('organization')}
                      >
                        <div className='flex items-center'>
                          Organization
                          {(searchParams.sortBy || 'createdAt') ===
                            'organization' && (
                            <span className='ml-1'>
                              {(searchParams.sortOrder || 'desc') === 'asc'
                                ? '↑'
                                : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                        onClick={() => handleSort('accountType')}
                      >
                        <div className='flex items-center'>
                          Account Type
                          {(searchParams.sortBy || 'createdAt') ===
                            'accountType' && (
                            <span className='ml-1'>
                              {(searchParams.sortOrder || 'desc') === 'asc'
                                ? '↑'
                                : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                        onClick={() => handleSort('lastLogin')}
                      >
                        <div className='flex items-center'>
                          Last Login
                          {(searchParams.sortBy || 'createdAt') ===
                            'lastLogin' && (
                            <span className='ml-1'>
                              {(searchParams.sortOrder || 'desc') === 'asc'
                                ? '↑'
                                : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className='flex items-center'>
                          Created
                          {(searchParams.sortBy || 'createdAt') ===
                            'createdAt' && (
                            <span className='ml-1'>
                              {(searchParams.sortOrder || 'desc') === 'asc'
                                ? '↑'
                                : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Activity
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {users.map(user => (
                      <tr
                        key={user.id}
                        className='hover:bg-gray-50 cursor-pointer'
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <div className='flex-shrink-0 h-10 w-10'>
                              {user.image ? (
                                <img
                                  className='h-10 w-10 rounded-full'
                                  src={user.image}
                                  alt=''
                                />
                              ) : (
                                <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center'>
                                  <span className='text-sm font-medium text-gray-700'>
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-900'>
                                {user.name}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>
                            {user.organization
                              ? user.organization.name
                              : 'No organization'}
                          </div>
                          {user.organization && (
                            <div className='text-sm text-gray-500'>
                              {user.organization.staffSize} •{' '}
                              {user.organization.budget}
                            </div>
                          )}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(user.accountType)}`}
                          >
                            {user.accountType}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(user.createdAt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          <div>{user.conversationCount} chats</div>
                          <div className='text-gray-500'>
                            {user.rsvpCount} RSVPs
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                Next
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  Showing{' '}
                  <span className='font-medium'>
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className='font-medium'>
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{' '}
                  of <span className='font-medium'>{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav
                  className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                  aria-label='Pagination'
                >
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
