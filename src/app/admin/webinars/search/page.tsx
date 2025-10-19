'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'
import AdminSearchFilters from '@/components/AdminSearchFilters'

interface Webinar {
  id: string
  title: string
  description: string
  scheduledDate: string
  timezone: string
  duration: number
  thumbnailUrl?: string
  uniqueSlug: string
  status: string
  createdAt: string
  rsvpCount: number
  createdBy: string
}

export default function WebinarSearch() {
  const router = useRouter()
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [searchParams, setSearchParams] = useState<Record<string, string>>({})

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
    } catch (error) {
      localStorage.removeItem('adminSession')
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    if (adminUser) {
      fetchWebinars()
    }
  }, [searchParams])

  const fetchWebinars = async (token?: string) => {
    if (!token) {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) return
      const sessionData = JSON.parse(adminSession)
      token = sessionData.token
    }

    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams)
      
      const response = await fetch(`/api/admin/webinars/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWebinars(data.webinars)
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching webinars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (params: Record<string, string>) => {
    setSearchParams(params)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && webinars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading webinars...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <AdminBreadcrumb
              items={[
                { label: 'Webinars', href: '/admin' },
                { label: 'Search' }
              ]}
            />
          </div>
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Webinar Search</h1>
              <p className="mt-1 text-sm text-gray-500">
                Advanced search and filtering for webinars - {webinars.length} results
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <AdminSearchFilters
          type="webinars"
          onSearch={handleSearch}
        />

        {/* Webinars Grid */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Search Results</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Found {webinars.length} webinars matching your criteria
            </p>
          </div>
          <div className="border-t border-gray-200">
            {webinars.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No webinars found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {webinars.map((webinar) => (
                  <div key={webinar.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(webinar.status)}`}>
                          {webinar.status}
                        </span>
                        <span className="text-sm text-gray-500">{webinar.rsvpCount} RSVPs</span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                        {webinar.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {webinar.description}
                      </p>
                      
                      <div className="space-y-1 text-sm text-gray-500">
                        <p><strong>Date:</strong> {formatDate(webinar.scheduledDate)}</p>
                        <p><strong>Duration:</strong> {webinar.duration} minutes</p>
                        <p><strong>Created by:</strong> {webinar.createdBy}</p>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Link
                          href={`/admin/webinars/${webinar.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        {(webinar.status === 'published' || webinar.status === 'live' || webinar.status === 'completed') && (
                          <Link
                            href={`/webinars/${webinar.uniqueSlug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                          >
                            View Public
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
