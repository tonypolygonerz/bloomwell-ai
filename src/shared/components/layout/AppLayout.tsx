'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  initialCollapsed?: boolean;
}

export default function AppLayout({
  children,
  initialCollapsed = false,
}: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mock notification count - replace with real data later
  const unreadNotifications = 3;

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (pathname === '/dashboard' || pathname.startsWith('/chat')) {
      return null; // Don't show breadcrumb on dashboard or chat pages
    }

    const pageName = pathname.split('/')[1];
    const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    return (
      <div className='flex items-center space-x-2'>
        <Link
          href='/dashboard'
          className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
        >
          Dashboard
        </Link>
        <span className='text-gray-400'>/</span>
        <span className='text-sm text-gray-900 font-medium'>{pageTitle}</span>
      </div>
    );
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar - Fixed positioning */}
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content area */}
      <div
        className={`
        flex-1 flex flex-col
        transition-all duration-300
        ${collapsed ? 'lg:ml-20' : 'lg:ml-60'}
      `}
      >
        {/* Top navigation bar */}
        <header className='sticky top-0 z-40 bg-white border-b border-gray-200'>
          <div className='flex items-center justify-between px-6 h-16'>
            {/* Left side - Mobile menu + Breadcrumbs */}
            <div className='flex items-center space-x-4'>
              {/* Mobile hamburger menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className='lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100'
              >
                <svg
                  className='w-6 h-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <rect
                    x='3'
                    y='4'
                    width='18'
                    height='16'
                    rx='2'
                    ry='2'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <rect
                    x='5'
                    y='6'
                    width='6'
                    height='12'
                    rx='1'
                    ry='1'
                    fill='currentColor'
                  />
                </svg>
              </button>

              {/* Breadcrumbs */}
              <div className='flex items-center'>{generateBreadcrumbs()}</div>
            </div>

            {/* Right side - Notification Bell & User Info */}
            <div className='flex items-center space-x-4'>
              {/* Notification Bell with Badge */}
              <button
                onClick={() => console.log('Notifications clicked')}
                className='relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
              >
                {/* Bell Icon (Heroicons) */}
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                  />
                </svg>

                {/* Counter Badge - only show if notifications > 0 */}
                {unreadNotifications > 0 && (
                  <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* User Avatar & Info */}
              <div className='flex items-center space-x-3'>
                {/* User Avatar */}
                <button
                  onClick={() => console.log('Avatar clicked')}
                  className='flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session?.user?.name || 'User'}
                      className='w-9 h-9 rounded-full border-2 border-gray-200'
                    />
                  ) : (
                    <div className='w-9 h-9 rounded-full border-2 border-gray-200 bg-green-500 flex items-center justify-center'>
                      <span className='text-white font-semibold text-sm'>
                        {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className='text-sm font-medium text-gray-700'>
                    {session?.user?.name || 'User'}
                  </span>
                  {/* Dropdown Chevron */}
                  <svg
                    className='w-4 h-4 text-gray-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='px-6 py-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
