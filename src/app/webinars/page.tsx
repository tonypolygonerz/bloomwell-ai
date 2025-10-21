'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Webinar {
  id: string
  title: string
  description: string
  presenter: string
  presenterTitle: string
  dateTime: string
  duration: number
  status: 'draft' | 'published' | 'cancelled'
  thumbnailUrl: string | null
  uniqueSlug: string
  rsvpCount: number
}

export default function WebinarsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchWebinars()
    }
  }, [status, router])

  const fetchWebinars = async () => {
    try {
      const response = await fetch('/api/admin/webinars')
      if (response.ok) {
        const data = await response.json()
        // Filter to only show published webinars for users
        const publishedWebinars = data.filter((w: Webinar) => w.status === 'published')
        setWebinars(publishedWebinars)
      }
    } catch (error) {
      console.error('Error fetching webinars:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const upcomingWebinars = webinars.filter(w => isUpcoming(w.dateTime))
  const pastWebinars = webinars.filter(w => !isUpcoming(w.dateTime))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Webinars & Training
          </h1>
          <p className="mt-2 text-gray-600">
            Join our expert-led sessions to enhance your nonprofit's impact
          </p>
        </div>

        {/* Upcoming Webinars */}
        {upcomingWebinars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming Webinars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingWebinars.map((webinar) => (
                <Link
                  key={webinar.id}
                  href={`/webinars/${webinar.uniqueSlug}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    {webinar.thumbnailUrl ? (
                      <img
                        src={webinar.thumbnailUrl}
                        alt={webinar.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Upcoming
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {webinar.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {webinar.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{webinar.presenter}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(webinar.dateTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{webinar.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-emerald-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{webinar.rsvpCount} attendees</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Past Webinars */}
        {pastWebinars.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Past Webinars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastWebinars.map((webinar) => (
                <Link
                  key={webinar.id}
                  href={`/webinars/${webinar.uniqueSlug}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow opacity-75 hover:opacity-100"
                >
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    {webinar.thumbnailUrl ? (
                      <img
                        src={webinar.thumbnailUrl}
                        alt={webinar.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Past Event
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {webinar.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {webinar.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{webinar.presenter}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(webinar.dateTime)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {webinars.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No webinars available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon for upcoming training sessions and webinars.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

