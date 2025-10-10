'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <aside className='w-64 bg-purple-600 text-white flex flex-col'>
      <div className='p-4 flex items-center justify-center h-16 border-b border-purple-700'>
        <div className='flex items-center space-x-2'>
          <svg
            className='w-6 h-6 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 10V3L4 14h7v7l9-11h-7z'
            />
          </svg>
          <span className='text-xl font-semibold'>Brand Name</span>
        </div>
      </div>

      <nav className='flex-1 p-4'>
        <ul className='space-y-2'>
          <li>
            <Link
              href='/admin'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin') && pathname === '/admin'
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/users'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/users')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
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
              <span>Users</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/webinars'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/webinars')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
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
              <span>Webinars</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/notifications'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/notifications')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/grants'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/grants')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
              <span>Grants</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/analytics'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/analytics')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/ai-models'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/ai-models')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                />
              </svg>
              <span>AI Models</span>
            </Link>
          </li>
          <li>
            <Link
              href='/admin/maintenance'
              className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${
                isActive('/admin/maintenance')
                  ? 'bg-purple-700 text-white'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className='w-5 h-5'
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
              <span>Maintenance Mode</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
