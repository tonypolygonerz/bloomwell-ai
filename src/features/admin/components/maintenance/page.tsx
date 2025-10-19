'use client';

import { useState, useEffect } from 'react';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

interface MaintenanceMode {
  id: string;
  environment: string;
  isEnabled: boolean;
  message: string | null;
  enabledAt: string | null;
  enabledBy: string | null;
  updatedAt: string;
}

export default function AdminMaintenancePage() {
  const [maintenanceModes, setMaintenanceModes] = useState<MaintenanceMode[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaintenanceModes();
  }, []);

  const fetchMaintenanceModes = async () => {
    try {
      // Get admin token from localStorage
      const adminSession = localStorage.getItem('adminSession');
      const headers: Record<string, string> = {};

      if (adminSession) {
        try {
          const sessionData = JSON.parse(adminSession);
          headers['Authorization'] = `Bearer ${sessionData.token}`;
        } catch (e) {
          console.error('Failed to parse admin session:', e);
        }
      }

      const response = await fetch('/api/admin/maintenance', { headers });
      if (response.ok) {
        const data = await response.json();
        setMaintenanceModes(data.maintenanceModes);

        // Set message from staging environment if exists
        const current = data.maintenanceModes.find(
          (m: MaintenanceMode) => m.environment === 'staging'
        );
        if (current?.message) {
          setMessage(current.message);
        }
      } else {
        alert('Failed to fetch maintenance modes');
      }
    } catch (error) {
      console.error('Error fetching maintenance modes:', error);
      alert('Error fetching maintenance modes');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async (
    environment: string,
    currentStatus: boolean
  ) => {
    if (environment === 'production') {
      const confirmed = confirm(
        `⚠️ WARNING: You are about to ${currentStatus ? 'DISABLE' : 'ENABLE'} maintenance mode for PRODUCTION!\n\nThis will affect all users. Are you sure?`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      // Get admin token from localStorage
      const adminSession = localStorage.getItem('adminSession');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (adminSession) {
        try {
          const sessionData = JSON.parse(adminSession);
          headers['Authorization'] = `Bearer ${sessionData.token}`;
        } catch (e) {
          console.error('Failed to parse admin session:', e);
        }
      }

      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          environment,
          isEnabled: !currentStatus,
          message: !currentStatus ? message : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchMaintenanceModes();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling maintenance:', error);
      alert('Error toggling maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  const getMaintenanceMode = (
    environment: string
  ): MaintenanceMode | undefined => {
    return maintenanceModes.find(m => m.environment === environment);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='max-w-7xl mx-auto'>
          <AdminBreadcrumb
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Maintenance Mode', href: '/admin/maintenance' },
            ]}
          />
          <div className='text-center py-12'>
            <div className='animate-pulse text-gray-600'>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        <AdminBreadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Maintenance Mode', href: '/admin/maintenance' },
          ]}
        />

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Maintenance Mode Management
          </h1>
          <p className='text-gray-600'>
            Control maintenance mode for different environments. When enabled,
            users will see a maintenance page instead of the regular
            application.
          </p>
        </div>

        {/* Warning Banner */}
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8'>
          <div className='flex'>
            <svg
              className='w-5 h-5 text-yellow-400 mr-3 flex-shrink-0'
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
            <div>
              <h3 className='text-sm font-medium text-yellow-800'>Caution</h3>
              <p className='text-sm text-yellow-700 mt-1'>
                Enabling maintenance mode will block all users except admins.
                Admin routes (/admin/*) and authentication (/api/auth/*) will
                remain accessible.
              </p>
            </div>
          </div>
        </div>

        {/* Environment Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
          {/* Staging Environment */}
          {(() => {
            const staging = getMaintenanceMode('staging');
            return (
              <div className='bg-white rounded-lg shadow-lg overflow-hidden border-2 border-purple-200'>
                <div className='bg-purple-600 px-6 py-4'>
                  <h2 className='text-xl font-bold text-white flex items-center'>
                    <svg
                      className='w-6 h-6 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    Staging Environment
                  </h2>
                </div>
                <div className='p-6'>
                  <div className='mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-gray-700 font-medium'>Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          staging?.isEnabled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {staging?.isEnabled
                          ? '🔴 MAINTENANCE MODE'
                          : '🟢 ONLINE'}
                      </span>
                    </div>
                    {staging?.isEnabled && (
                      <>
                        <div className='text-sm text-gray-600 mb-2'>
                          <strong>Enabled at:</strong>{' '}
                          {formatDate(staging.enabledAt)}
                        </div>
                        {staging.message && (
                          <div className='bg-gray-50 p-3 rounded text-sm text-gray-700 mt-3'>
                            <strong>Message:</strong> {staging.message}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      toggleMaintenance('staging', staging?.isEnabled || false)
                    }
                    disabled={saving}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                      staging?.isEnabled
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {saving
                      ? 'Processing...'
                      : staging?.isEnabled
                        ? '✓ Disable Maintenance'
                        : '⚠️ Enable Maintenance'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Production Environment */}
          {(() => {
            const production = getMaintenanceMode('production');
            return (
              <div className='bg-white rounded-lg shadow-lg overflow-hidden border-2 border-red-200'>
                <div className='bg-red-600 px-6 py-4'>
                  <h2 className='text-xl font-bold text-white flex items-center'>
                    <svg
                      className='w-6 h-6 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
                      />
                    </svg>
                    Production Environment
                  </h2>
                </div>
                <div className='p-6'>
                  <div className='mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-gray-700 font-medium'>Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          production?.isEnabled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {production?.isEnabled
                          ? '🔴 MAINTENANCE MODE'
                          : '🟢 ONLINE'}
                      </span>
                    </div>
                    {production?.isEnabled && (
                      <>
                        <div className='text-sm text-gray-600 mb-2'>
                          <strong>Enabled at:</strong>{' '}
                          {formatDate(production.enabledAt)}
                        </div>
                        {production.message && (
                          <div className='bg-gray-50 p-3 rounded text-sm text-gray-700 mt-3'>
                            <strong>Message:</strong> {production.message}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      toggleMaintenance(
                        'production',
                        production?.isEnabled || false
                      )
                    }
                    disabled={saving}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                      production?.isEnabled
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {saving
                      ? 'Processing...'
                      : production?.isEnabled
                        ? '✓ Disable Maintenance'
                        : '⚠️ Enable Maintenance'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Custom Message Input */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            Custom Maintenance Message
          </h2>
          <p className='text-gray-600 mb-4'>
            This message will be displayed to users on the maintenance page.
            Leave blank for a default message.
          </p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            placeholder='e.g., We are performing database upgrades. Expected downtime: 30 minutes.'
          />
          <p className='text-sm text-gray-500 mt-2'>
            Note: Update this message before enabling maintenance mode. Changes
            apply to the next toggle.
          </p>
        </div>

        {/* Maintenance Page Preview */}
        <div className='bg-white rounded-lg shadow-lg p-6 mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Quick Links</h2>
          <div className='space-y-3'>
            <a
              href='/maintenance'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center text-purple-600 hover:text-purple-800'
            >
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                />
              </svg>
              Preview Maintenance Page
            </a>
            <br />
            <a
              href='/api/maintenance/status'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center text-purple-600 hover:text-purple-800'
            >
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              Check Public Status API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
