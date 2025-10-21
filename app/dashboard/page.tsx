'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface OrganizationData {
  id: string
  name: string
  mission: string
  budget: string
  staffSize: string
  focusAreas: string
}

interface UserStats {
  organization: OrganizationData | null
  conversationsCount: number
  profileComplete: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState('dashboard')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      loadUserData()
    }
  }, [status, router])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/organization')
      if (response.ok) {
        const data = await response.json()
        setStats({
          organization: data.organization,
          conversationsCount: 0,
          profileComplete: !!(data.organization?.name && data.organization?.mission)
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'ai-assistant', 
      label: 'AI Chat', 
      href: '/chat',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      id: 'grants', 
      label: 'Grant Search', 
      href: '/chat?prompt=find-grants',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      id: 'webinars', 
      label: 'Webinars', 
      href: '/webinars',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'My Profile', 
      href: '/profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      href: '/notifications',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
  ]

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'
  const organizationName = stats?.organization?.name || 'Your Organization'

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <aside className="flex w-70 flex-col border-r border-gray-200 bg-gray-50">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">Bloomwell AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = activeItem === item.id || 
              (item.href === '/dashboard' && activeItem === 'dashboard')
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveItem(item.id)}
                className={`
                  flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <span className={isActive ? 'text-emerald-600' : 'text-gray-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/profile"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {organizationName}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Profile Completion Banner */}
          {!stats?.profileComplete && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <svg className="mt-0.5 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900">Finish your settings</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Complete your organization profile to unlock all features
                    </p>
                  </div>
                </div>
                <Link 
                  href="/profile"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Complete Profile →
                </Link>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/chat"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">💬</span>
                  <span className="text-sm font-medium text-gray-700">Chat with AI Assistant</span>
                </Link>
                <Link
                  href="/chat?prompt=find-grants"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">🔍</span>
                  <span className="text-sm font-medium text-gray-700">Find Grants</span>
                </Link>
                <Link
                  href="/chat?prompt=analyze-documents"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">📄</span>
                  <span className="text-sm font-medium text-gray-700">Analyze Documents</span>
                </Link>
                <Link
                  href="/chat?prompt=board-help"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">👥</span>
                  <span className="text-sm font-medium text-gray-700">Board Governance Help</span>
                </Link>
                <Link
                  href="/chat?prompt=funding-ideas"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">💡</span>
                  <span className="text-sm font-medium text-gray-700">Funding Ideas</span>
                </Link>
              </div>
            </div>

            {/* My Upcoming Events */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">My Upcoming Events</h3>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg className="mb-3 h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="mb-1 text-sm font-medium text-gray-900">No upcoming events</p>
                <p className="mb-4 text-xs text-gray-500">
                  RSVP to webinars to see them here.
                </p>
                <Link
                  href="/webinars"
                  className="inline-flex items-center rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  Browse Webinars
                </Link>
              </div>
            </div>

            {/* Organization Profile */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Organization Profile</h3>
              <div className="space-y-3">
                {stats?.organization ? (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-500">Organization Name</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{stats.organization.name}</p>
                    </div>
                    {stats.organization.mission && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">Mission</p>
                        <p className="mt-1 text-sm text-gray-700 line-clamp-2">{stats.organization.mission}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-600">No organization profile yet</p>
                  </div>
                )}
                <Link
                  href="/profile"
                  className="mt-3 block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Complete Profile Setup
                </Link>
                <Link
                  href="/admin"
                  className="block w-full rounded-lg bg-purple-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No recent activity yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Start chatting with the AI assistant to see your activity here
                </p>
              </div>
            </div>

            {/* Webinar Resources */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Webinar Resources</h3>
              <div className="space-y-2">
                <Link
                  href="/webinars"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">🎓</span>
                  <span className="text-sm font-medium text-gray-700">Browse All Webinars</span>
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl">🔔</span>
                  <span className="text-sm font-medium text-gray-700">Notification Center</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

