'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import AdminBreadcrumb from '@/components/AdminBreadcrumb'

interface AnalyticsData {
  kpis: {
    userEngagement: {
      totalUsers: number
      activeUsers: number
      newUsers: number
      activeUserRate: number
      avgSessionsPerUser: number
      totalConversations: number
      totalMessages: number
    }
    webinarMetrics: {
      totalWebinars: number
      totalRegistrations: number
      totalAttendees: number
      registrationRate: number
      attendanceRate: number
    }
    revenueMetrics: {
      totalRevenue: number
      mrr: number
      trial: number
      paid: number
      conversionRate: number
      churnRate: number
    }
  }
  timeSeriesData: {
    userEngagement: Array<{ date: string; activeUsers: number; conversations: number }>
    webinarEngagement: Array<{ date: string; webinarsCreated: number; registrations: number }>
    conversionTimeline: Array<{ date: string; newUsers: number; convertedUsers: number }>
  }
  insights: {
    popularTopics: Array<{ title: string; _count: { rsvps: number } }>
    topPerformingWebinars: Array<{ title: string; _count: { rsvps: number } }>
  }
  period: {
    start: string
    end: string
    days: number
  }
}

export default function AnalyticsDashboard() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [dateRange, setDateRange] = useState('30')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
      fetchAnalytics(sessionData.token)
    } catch (error) {
      localStorage.removeItem('adminSession')
      router.push('/admin/login')
    }
  }, [router, dateRange, startDate, endDate])

  const fetchAnalytics = async (token?: string) => {
    if (!token) {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      const sessionData = JSON.parse(adminSession)
      token = sessionData.token
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange) params.set('period', dateRange)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/admin/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      
      const sessionData = JSON.parse(adminSession)
      const params = new URLSearchParams()
      if (dateRange) params.set('period', dateRange)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      
      const response = await fetch(`/api/admin/analytics/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionData.token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const { kpis, timeSeriesData, insights } = data

  // Chart colors
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <AdminBreadcrumb
              items={[
                { label: 'Analytics' }
              ]}
            />
          </div>
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Business insights and performance metrics for your nonprofit AI assistant
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Export Report
              </button>
              <Link
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quick Select
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchAnalytics()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Engagement KPIs */}
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{kpis.userEngagement.activeUsers}</dd>
                    <dd className="text-sm text-gray-500">{formatPercentage(kpis.userEngagement.activeUserRate)} of total</dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Sessions/User</dt>
                    <dd className="text-lg font-medium text-gray-900">{kpis.userEngagement.avgSessionsPerUser}</dd>
                    <dd className="text-sm text-gray-500">{kpis.userEngagement.totalConversations} total conversations</dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Webinar Attendance</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatPercentage(kpis.webinarMetrics.attendanceRate)}</dd>
                    <dd className="text-sm text-gray-500">{kpis.webinarMetrics.totalAttendees} of {kpis.webinarMetrics.totalRegistrations} registrations</dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(kpis.revenueMetrics.mrr)}</dd>
                    <dd className="text-sm text-gray-500">{formatPercentage(kpis.revenueMetrics.conversionRate)} conversion rate</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Engagement Over Time */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData.userEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="activeUsers" stackId="1" stroke={colors.primary} fill={colors.primary} name="Active Users" />
                <Area type="monotone" dataKey="conversations" stackId="2" stroke={colors.secondary} fill={colors.secondary} name="Conversations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Webinar Performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Webinar Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData.webinarEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="webinarsCreated" fill={colors.primary} name="Webinars Created" />
                <Bar dataKey="registrations" fill={colors.secondary} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subscription Breakdown */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Trial Users', value: kpis.revenueMetrics.trial, color: colors.accent },
                    { name: 'Paid Users', value: kpis.revenueMetrics.paid, color: colors.primary }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Trial Users', value: kpis.revenueMetrics.trial, color: colors.accent },
                    { name: 'Paid Users', value: kpis.revenueMetrics.paid, color: colors.primary }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Conversion Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData.conversionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" stroke={colors.primary} name="New Users" />
                <Line type="monotone" dataKey="convertedUsers" stroke={colors.secondary} name="Converted Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Webinar Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.topPerformingWebinars.map((webinar, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{webinar.title}</h4>
                <p className="text-sm text-gray-600">{webinar._count.rsvps} registrations</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
