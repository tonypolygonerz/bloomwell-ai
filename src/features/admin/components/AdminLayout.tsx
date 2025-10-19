'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserRole } from '@prisma/client';

interface AdminLayoutProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: Session | any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, session }) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any;
        if (user && user.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };
    checkAdminStatus();
  }, [session]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <div className='flex min-h-screen bg-gray-100'>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-end items-center py-4'>
              <div className='flex items-center space-x-3'>
                <img
                  className='h-8 w-8 rounded-full'
                  src='/images/new-berlin-headshot 2017.jpg'
                  alt='Admin Profile'
                />
                <span className='text-sm font-medium text-gray-700'>
                  {adminUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className='text-gray-500 hover:text-red-600 text-sm font-medium'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className='flex-1 bg-gray-50 p-6'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
