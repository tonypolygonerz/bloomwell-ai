'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

interface UserDetail {
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
    focusAreas?: string;
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

interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
  messageCount: number;
}

interface WebinarRSVP {
  id: string;
  webinar: {
    id: string;
    title: string;
    scheduledDate: string;
    status: string;
  };
  rsvpDate: string;
  attended: boolean;
}

export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [rsvps, setRsvps] = useState<WebinarRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

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
      fetchUserData(sessionData.token);
    } catch (error) {
      localStorage.removeItem('adminSession');
      router.push('/admin/login');
    }
  }, [router, userId]);

  const fetchUserData = async (token: string) => {
    setLoading(true);
    try {
      // Fetch user details
      const userResponse = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
        setConversations(userData.conversations || []);
        setRsvps(userData.rsvps || []);
      } else if (userResponse.status === 401) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      } else if (userResponse.status === 404) {
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-2xl font-bold text-gray-900'>User not found</h1>
        <p className='mt-2 text-gray-600'>
          The user you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href='/admin/users'
          className='mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className='mb-8'>
        <AdminBreadcrumb
          items={[
            { label: 'Users', href: '/admin/users' },
            { label: user.name },
          ]}
        />
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0 h-12 w-12'>
              {user.image ? (
                <img
                  className='h-12 w-12 rounded-full'
                  src={user.image}
                  alt=''
                />
              ) : (
                <div className='h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center'>
                  <span className='text-lg font-medium text-gray-700'>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className='ml-4'>
              <h1 className='text-3xl font-bold text-gray-900'>{user.name}</h1>
              <p className='text-sm text-gray-500'>{user.email}</p>
            </div>
          </div>
          <Link
            href='/admin/users'
            className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium'
          >
            Back to Users
          </Link>
        </div>
      </div>

      <div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* User Information */}
          <div className='lg:col-span-1'>
            <div className='bg-white shadow rounded-lg'>
              <div className='px-4 py-5 sm:p-6'>
                <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                  User Information
                </h3>

                <dl className='space-y-4'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Account Type
                    </dt>
                    <dd className='mt-1'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(user.accountType)}`}
                      >
                        {user.accountType}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Status
                    </dt>
                    <dd className='mt-1'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        {user.status}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Member Since
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Last Activity
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {formatDate(user.lastLogin)}
                    </dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Total Chats
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {user.conversationCount}
                    </dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Webinar RSVPs
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {user.rsvpCount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Organization Information */}
            {user.organization && (
              <div className='bg-white shadow rounded-lg mt-6'>
                <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                    Organization
                  </h3>

                  <dl className='space-y-4'>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Name
                      </dt>
                      <dd className='mt-1 text-sm text-gray-900'>
                        {user.organization.name}
                      </dd>
                    </div>

                    {user.organization.mission && (
                      <div>
                        <dt className='text-sm font-medium text-gray-500'>
                          Mission
                        </dt>
                        <dd className='mt-1 text-sm text-gray-900'>
                          {user.organization.mission}
                        </dd>
                      </div>
                    )}

                    {user.organization.budget && (
                      <div>
                        <dt className='text-sm font-medium text-gray-500'>
                          Budget
                        </dt>
                        <dd className='mt-1 text-sm text-gray-900'>
                          {user.organization.budget}
                        </dd>
                      </div>
                    )}

                    {user.organization.staffSize && (
                      <div>
                        <dt className='text-sm font-medium text-gray-500'>
                          Staff Size
                        </dt>
                        <dd className='mt-1 text-sm text-gray-900'>
                          {user.organization.staffSize}
                        </dd>
                      </div>
                    )}

                    {user.organization.focusAreas && (
                      <div>
                        <dt className='text-sm font-medium text-gray-500'>
                          Focus Areas
                        </dt>
                        <dd className='mt-1 text-sm text-gray-900'>
                          {user.organization.focusAreas}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Activity Information */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Recent Conversations */}
            <div className='bg-white shadow rounded-lg'>
              <div className='px-4 py-5 sm:p-6'>
                <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                  Recent Conversations
                </h3>

                {conversations.length === 0 ? (
                  <p className='text-sm text-gray-500'>
                    No conversations found.
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        className='border border-gray-200 rounded-lg p-4'
                      >
                        <div className='flex justify-between items-start'>
                          <div>
                            <h4 className='text-sm font-medium text-gray-900'>
                              {conversation.title || 'Untitled Conversation'}
                            </h4>
                            <p className='text-sm text-gray-500'>
                              {conversation.messageCount} messages
                            </p>
                          </div>
                          <span className='text-sm text-gray-500'>
                            {formatDate(conversation.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Webinar RSVPs */}
            <div className='bg-white shadow rounded-lg'>
              <div className='px-4 py-5 sm:p-6'>
                <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                  Webinar RSVPs
                </h3>

                {rsvps.length === 0 ? (
                  <p className='text-sm text-gray-500'>
                    No webinar RSVPs found.
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {rsvps.map(rsvp => (
                      <div
                        key={rsvp.id}
                        className='border border-gray-200 rounded-lg p-4'
                      >
                        <div className='flex justify-between items-start'>
                          <div>
                            <h4 className='text-sm font-medium text-gray-900'>
                              {rsvp.webinar.title}
                            </h4>
                            <p className='text-sm text-gray-500'>
                              Scheduled:{' '}
                              {formatDate(rsvp.webinar.scheduledDate)}
                            </p>
                            <p className='text-sm text-gray-500'>
                              RSVP Date: {formatDate(rsvp.rsvpDate)}
                            </p>
                          </div>
                          <div className='text-right'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rsvp.webinar.status)}`}
                            >
                              {rsvp.webinar.status}
                            </span>
                            <p className='text-sm text-gray-500 mt-1'>
                              {rsvp.attended ? 'Attended' : 'Did not attend'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
