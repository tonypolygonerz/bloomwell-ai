'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AdminBreadcrumb from '@/components/AdminBreadcrumb'

interface Webinar {
  id: string
  title: string
  description: string
  scheduledDate: string
  timezone: string
  duration: number
  thumbnailUrl?: string
  uniqueSlug: string
  status: 'draft' | 'published' | 'live' | 'completed'
  createdAt: string
  rsvpCount: number
}

interface AdminStats {
  totalWebinars: number
  publishedWebinars: number
  totalRSVPs: number
  upcomingWebinars: number
  totalUsers: number
  activeUsers: number
  recentUsers: number
  usersWithOrganizations: number
  totalGrants: number
  activeGrants: number
  upcomingGrants: number
  totalAwardAmount: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalWebinars: 0,
    publishedWebinars: 0,
    totalRSVPs: 0,
    upcomingWebinars: 0,
    totalUsers: 0,
    activeUsers: 0,
    recentUsers: 0,
    usersWithOrganizations: 0,
    totalGrants: 0,
    activeGrants: 0,
    upcomingGrants: 0,
    totalAwardAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [selectedWebinars, setSelectedWebinars] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession')
    if (!adminSession) {
      router.push('/admin/login')
      return
    }

    try {
      const sessionData = JSON.parse(adminSession)
      setAdminUser(sessionData.admin)
      fetchWebinars(sessionData.token)
      fetchStats(sessionData.token)
    } catch (error) {
      localStorage.removeItem('adminSession')
      router.push('/admin/login')
    }
  }, [router])

  const fetchWebinars = async (token: string) => {
    try {
      const response = await fetch('/api/admin/webinars', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWebinars(data)
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching webinars:', error)
    }
  }

  const fetchStats = async (token: string) => {
    try {
      const [webinarStatsResponse, userStatsResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/admin/user-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (webinarStatsResponse.ok && userStatsResponse.ok) {
        const webinarStats = await webinarStatsResponse.json()
        const userStats = await userStatsResponse.json()
        
        setStats({
          ...webinarStats,
          ...userStats,
          totalGrants: 0,
          activeGrants: 0,
          upcomingGrants: 0,
          totalAwardAmount: 0
        })
      } else if (webinarStatsResponse.status === 401 || userStatsResponse.status === 401) {
        localStorage.removeItem('adminSession')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'live': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeRemaining = (scheduledDate: string) => {
    const now = new Date()
    const webinarDate = new Date(scheduledDate)
    const diffMs = webinarDate.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Past event'
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`
    return `${diffMinutes}m`
  }

  const handleStatusChange = async (webinarId: string, newStatus: string) => {
    try {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      
      const sessionData = JSON.parse(adminSession)
      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        // Refresh webinars
        fetchWebinars(sessionData.token)
      }
    } catch (error) {
      console.error('Error updating webinar status:', error)
    }
  }

  const handleDeleteWebinar = async (webinarId: string, webinarTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${webinarTitle}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      
      const sessionData = JSON.parse(adminSession)
      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`
        }
      })
      
      if (response.ok) {
        // Refresh webinars
        fetchWebinars(sessionData.token)
      }
    } catch (error) {
      console.error('Error deleting webinar:', error)
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedWebinars.size === 0) return
    
    if (!confirm(`Are you sure you want to change the status of ${selectedWebinars.size} webinars to "${newStatus}"?`)) {
      return
    }
    
    try {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      
      const sessionData = JSON.parse(adminSession)
      const promises = Array.from(selectedWebinars).map(webinarId => 
        fetch(`/api/admin/webinars/${webinarId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.token}`
          },
          body: JSON.stringify({ status: newStatus })
        })
      )
      
      await Promise.all(promises)
      
      // Clear selection and refresh
      setSelectedWebinars(new Set())
      setShowBulkActions(false)
      fetchWebinars(sessionData.token)
    } catch (error) {
      console.error('Error updating webinar statuses:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedWebinars.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedWebinars.size} webinars? This action cannot be undone.`)) {
      return
    }
    
    try {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      
      const sessionData = JSON.parse(adminSession)
      const promises = Array.from(selectedWebinars).map(webinarId => 
        fetch(`/api/admin/webinars/${webinarId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionData.token}`
          }
        })
      )
      
      await Promise.all(promises)
      
      // Clear selection and refresh
      setSelectedWebinars(new Set())
      setShowBulkActions(false)
      fetchWebinars(sessionData.token)
    } catch (error) {
      console.error('Error deleting webinars:', error)
    }
  }

  const handleSelectWebinar = (webinarId: string) => {
    const newSelected = new Set(selectedWebinars)
    if (newSelected.has(webinarId)) {
      newSelected.delete(webinarId)
    } else {
      newSelected.add(webinarId)
    }
    setSelectedWebinars(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = () => {
    if (selectedWebinars.size === webinars.length) {
      setSelectedWebinars(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedWebinars(new Set(webinars.map(w => w.id)))
      setShowBulkActions(true)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <AdminBreadcrumb
              items={[
                { label: 'Dashboard' }
              ]}
            />
          </div>
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {adminUser.username} ({adminUser.role}) - Manage webinars and system administration
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/webinars/new"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Webinar
              </Link>
              <Link
                href="/admin/webinars/search"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Search Webinars
              </Link>
              <Link
                href="/admin/analytics"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/admin/notifications"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Notifications
              </Link>
              <Link
                href="/admin/grants"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Grants Management
              </Link>
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Main App
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Webinars</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalWebinars}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.publishedWebinars}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total RSVPs</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalRSVPs}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.upcomingWebinars}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage your customer base
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/users"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/analytics"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                View Analytics
              </Link>
            </div>
          </div>
          
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">New Users (30d)</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.recentUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">With Organizations</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.usersWithOrganizations}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grants Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Grants</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalGrants.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Grants</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeGrants.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming (30d)</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.upcomingGrants.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Awards</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${(stats.totalAwardAmount / 1000000000).toFixed(1)}B
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Webinars Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Webinars</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage and monitor your webinar events
                </p>
              </div>
              {showBulkActions && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedWebinars.size} selected
                  </span>
                  <button
                    onClick={() => handleBulkStatusChange('published')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('live')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Go Live
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWebinars(new Set())
                      setShowBulkActions(false)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200">
            {webinars.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No webinars</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new webinar.</p>
                <div className="mt-6">
                  <Link
                    href="/admin/webinars/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Webinar
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {webinars.length > 0 && (
                  <li className="px-4 py-3 bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedWebinars.size === webinars.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Select all webinars
                      </span>
                    </div>
                  </li>
                )}
                {webinars.map((webinar) => (
                  <li key={webinar.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedWebinars.has(webinar.id)}
                            onChange={() => handleSelectWebinar(webinar.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                          />
                          <div className="flex-shrink-0 h-10 w-10">
                            {webinar.thumbnailUrl ? (
                              <img className="h-10 w-10 rounded-lg object-cover" src={webinar.thumbnailUrl} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {webinar.title}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(webinar.status)}`}>
                                {webinar.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <p>{formatDate(webinar.scheduledDate)} ({webinar.timezone})</p>
                              <span className="mx-2">•</span>
                              <p>{webinar.duration} minutes</p>
                              <span className="mx-2">•</span>
                              <p>{webinar.rsvpCount} RSVPs</p>
                              {webinar.status === 'published' || webinar.status === 'live' ? (
                                <>
                                  <span className="mx-2">•</span>
                                  <p className="text-blue-600 font-medium">{getTimeRemaining(webinar.scheduledDate)}</p>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Quick Status Actions */}
                          {webinar.status === 'draft' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(webinar.id, 'published')
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Publish
                            </button>
                          )}
                          {webinar.status === 'published' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(webinar.id, 'live')
                              }}
                              className="text-green-600 hover:text-green-900 text-sm font-medium"
                            >
                              Go Live
                            </button>
                          )}
                          {webinar.status === 'live' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(webinar.id, 'completed')
                              }}
                              className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                            >
                              Complete
                            </button>
                          )}
                          
                          {/* Standard Actions */}
                          <Link
                            href={`/admin/webinars/${webinar.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          
                          {/* View Public Page - only for published/live webinars */}
                          {(webinar.status === 'published' || webinar.status === 'live' || webinar.status === 'completed') && (
                            <Link
                              href={`/webinars/${webinar.uniqueSlug}`}
                              target="_blank"
                              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                            >
                              View Public
                            </Link>
                          )}
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteWebinar(webinar.id, webinar.title)
                            }}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
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
  )
}
