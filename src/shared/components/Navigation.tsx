'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';
import NotificationBell from './NotificationBell';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  User,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogOut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogIn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MessageSquare,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DollarSign,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Shield,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BarChart2,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const adminUser = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  name: 'Admin',
  email: 'admin@bloomwell.com',
  role: 'admin',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error = null;

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

  // Don't show navigation on admin pages, dashboard pages, or home page (they have their own header)
  if (
    pathname === '/' ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/chat') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/templates') ||
    pathname?.startsWith('/notifications') ||
    pathname?.startsWith('/documents')
  ) {
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
                New Chat
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
