'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  _count: {
    userNotifications: number;
  };
}

export default function AdminNotificationCenter() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetType: 'all_users',
    scheduledAt: '',
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
      fetchData(sessionData.token);
    } catch (error) {
      localStorage.removeItem('adminSession');
      router.push('/admin/login');
    }
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [notificationsRes, templatesRes] = await Promise.all([
        fetch('/api/admin/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/notification-templates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          message: '',
          type: 'announcement',
          targetType: 'all_users',
          scheduledAt: '',
        });
        fetchData(sessionData.token);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setFormData({
      title: template.subject,
      message: template.content,
      type: template.type,
      targetType: 'all_users',
      scheduledAt: '',
    });
    setSelectedTemplate(template.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-4'>
            <AdminBreadcrumb items={[{ label: 'Notifications' }]} />
          </div>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Notification Center
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Send announcements and manage automated webinar notifications
              </p>
            </div>
            <div className='flex space-x-4'>
              <button
                onClick={() => setShowCreateForm(true)}
                className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
              >
                Send Notification
              </button>
              <Link
                href='/admin'
                className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium'
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Create Notification Form */}
        {showCreateForm && (
          <div className='bg-white shadow rounded-lg mb-6'>
            <div className='px-4 py-5 sm:p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Send New Notification
              </h3>

              {/* Template Selection */}
              {templates.length > 0 && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Use Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={e => {
                      const template = templates.find(
                        t => t.id === e.target.value
                      );
                      if (template) handleTemplateSelect(template);
                    }}
                    className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  >
                    <option value=''>Select a template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Title
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={e =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    >
                      <option value='announcement'>Announcement</option>
                      <option value='webinar_reminder'>Webinar Reminder</option>
                      <option value='system'>System</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Target
                    </label>
                    <select
                      value={formData.targetType}
                      onChange={e =>
                        setFormData({ ...formData, targetType: e.target.value })
                      }
                      className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    >
                      <option value='all_users'>All Users</option>
                      <option value='webinar_rsvps'>Webinar RSVPs</option>
                      <option value='specific_users'>Specific Users</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Schedule (Optional)
                  </label>
                  <input
                    type='datetime-local'
                    value={formData.scheduledAt}
                    onChange={e =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>

                <div className='flex justify-end space-x-4'>
                  <button
                    type='button'
                    onClick={() => setShowCreateForm(false)}
                    className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
                  >
                    {formData.scheduledAt ? 'Schedule' : 'Send'} Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Recent Notifications
            </h3>
            <p className='mt-1 max-w-2xl text-sm text-gray-500'>
              Manage your sent and scheduled notifications
            </p>
          </div>
          <div className='border-t border-gray-200'>
            {notifications.length === 0 ? (
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
                    d='M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h6v6h-6V3z'
                  />
                </svg>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No notifications sent
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Get started by sending your first notification.
                </p>
              </div>
            ) : (
              <ul className='divide-y divide-gray-200'>
                {notifications.map(notification => (
                  <li key={notification.id} className='px-4 py-4 sm:px-6'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center'>
                          <h4 className='text-sm font-medium text-gray-900'>
                            {notification.title}
                          </h4>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}
                          >
                            {notification.status}
                          </span>
                        </div>
                        <p className='mt-1 text-sm text-gray-600 line-clamp-2'>
                          {notification.message}
                        </p>
                        <div className='mt-2 flex items-center text-sm text-gray-500'>
                          <span>
                            Sent to {notification._count.userNotifications}{' '}
                            users
                          </span>
                          <span className='mx-2'>•</span>
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.sentAt && (
                            <>
                              <span className='mx-2'>•</span>
                              <span>
                                Delivered {formatDate(notification.sentAt)}
                              </span>
                            </>
                          )}
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
    </div>
  );
}
