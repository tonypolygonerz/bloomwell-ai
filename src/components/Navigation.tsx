'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';
import NotificationBell from './NotificationBell';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check for admin session
    if (typeof window !== 'undefined') {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        try {
          const sessionData = JSON.parse(adminSession);
          setAdminUser(sessionData.admin);
        } catch (error) {
          localStorage.removeItem('adminSession');
        }
      }
    }
  }, []);

  // Don't show navigation on admin pages (they have their own header)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return (
      <nav className='bg-green-600 shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center space-x-8'>
              <Link href='/' className='text-xl font-bold text-white'>
                Bloomwell AI
              </Link>
              <div className='hidden md:flex space-x-4'>
                <Link
                  href='/#features'
                  className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Features
                </Link>
                <Link
                  href='/webinars'
                  className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Webinars
                </Link>
                <Link
                  href='/pricing'
                  className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Pricing
                </Link>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                href='/auth/login'
                className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
              >
                Sign In
              </Link>
              <Link
                href='/auth/register'
                className='bg-white text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium'
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='bg-green-600 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center space-x-8'>
            <Link href='/dashboard' className='text-xl font-bold text-white'>
              Bloomwell AI
            </Link>
            <div className='hidden md:flex space-x-4'>
              <Link
                href='/dashboard'
                className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
              >
                Dashboard
              </Link>
              <Link
                href='/chat'
                className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
              >
                AI Chat
              </Link>
              <Link
                href='/profile'
                className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
              >
                Profile
              </Link>
              <Link
                href='/templates'
                className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
              >
                Templates
              </Link>
              <Link
                href='/notifications'
                className='text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium'
              >
                Notifications
              </Link>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <NotificationBell />
            <span className='text-sm text-white'>
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
