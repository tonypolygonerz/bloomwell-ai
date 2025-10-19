'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      icon: (
        <div className='w-5 h-5 bg-green-600 rounded-full flex items-center justify-center'>
          <svg
            className='w-3 h-3 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
        </div>
      ),
      label: 'New Chat',
      href: '/chat',
    },
    { icon: '📅', label: 'Webinars', href: '/webinars' },
    { icon: '🔍', label: 'Find Grants', href: '/grants' },
    { icon: '⭐', label: 'Saved Grants', href: '/saved' },
    { icon: '📄', label: 'Documents', href: '/documents' },
  ];

  // Mock trial data
  const trialDaysLeft = 14;
  const trialPercentage = (trialDaysLeft / 14) * 100;

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-50
      bg-white border-r border-gray-200
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-60'}
      flex flex-col h-screen
      
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}
    >
      {/* Logo Section */}
      <div className='flex items-center justify-between px-4 border-b border-gray-200 h-16'>
        <Link
          href='/dashboard'
          className='flex items-center space-x-3 hover:opacity-80 transition-opacity'
        >
          {/* Logo circle */}
          <div className='w-9 h-9 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>B</span>
          </div>
          {/* Logo text - conditional */}
          <div
            className={`transition-all duration-300 overflow-hidden ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
          >
            <span className='text-lg font-bold text-gray-900'>
              Bloomwell AI
            </span>
          </div>
        </Link>
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className='hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors'
        >
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className='flex-1 overflow-y-auto p-3'>
        {navItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={collapsed ? item.label : ''}
              className={`
                group relative flex items-center gap-3 px-3 py-2 mx-2 rounded-lg
                transition-all duration-200
                ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className='text-lg'>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className='absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50'>
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Trial Status Section */}
      <div className='border-t border-gray-200 p-4 bg-blue-50'>
        {!collapsed ? (
          // Full trial status
          <>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm text-blue-700'>
                {trialDaysLeft} days left
              </span>
              <span className='text-sm text-blue-600 font-medium'>
                {Math.round(trialPercentage)}%
              </span>
            </div>
            <div className='w-full bg-blue-200 rounded-full h-2 mb-3'>
              <div
                className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                style={{ width: `${trialPercentage}%` }}
              ></div>
            </div>
            <Link
              href='/pricing'
              className='block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200'
            >
              Upgrade Plan
            </Link>
          </>
        ) : (
          // Collapsed trial status
          <div className='flex flex-col items-center space-y-2'>
            <div className='relative group'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs font-bold'>
                  {trialDaysLeft}
                </span>
              </div>
              {/* Trial tooltip */}
              <div className='absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50'>
                {trialDaysLeft} days left in trial
              </div>
            </div>
            <div className='relative group'>
              <Link
                href='/pricing'
                className='p-1.5 bg-green-500 rounded text-white hover:bg-green-600 transition-colors'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16l-4-4m0 0l4-4m-4 4h18'
                  />
                </svg>
              </Link>
              {/* Upgrade tooltip */}
              <div className='absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50'>
                Upgrade Plan
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
