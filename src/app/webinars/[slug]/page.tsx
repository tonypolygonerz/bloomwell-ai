'use client'

import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

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
  rsvpCount: number
  hasRSVPed: boolean
}

export default function WebinarPage() {
  const { data: session } = useSession()
  const params = useParams()
  const slug = params.slug as string

  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWebinar()
  }, [slug])

  const fetchWebinar = async () => {
    try {
      const response = await fetch(`/api/webinars/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setWebinar(data)
      } else {
        setError('Webinar not found')
      }
    } catch (error) {
      setError('Failed to load webinar')
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async () => {
    if (!session) {
      // Redirect to login
      window.location.href = '/auth/login'
      return
    }

    setRsvpLoading(true)
    try {
      const response = await fetch(`/api/webinars/${slug}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Refresh webinar data to update RSVP status
        fetchWebinar()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to RSVP')
      }
    } catch (error) {
      setError('An error occurred while RSVPing')
    } finally {
      setRsvpLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading webinar...</p>
        </div>
      </div>
    )
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Webinar Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The webinar you are looking for does not exist.'}</p>
          <a
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(webinar.status)}`}>
                    {webinar.status}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{webinar.title}</h1>
                <div className="flex items-center text-gray-600 mb-6">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDate(webinar.scheduledDate)} ({webinar.timezone})</span>
                  <span className="mx-2">•</span>
                  <span>{webinar.duration} minutes</span>
                </div>
              </div>
              {webinar.thumbnailUrl && (
                <div className="ml-6 flex-shrink-0">
                  <img
                    className="h-32 w-32 rounded-lg object-cover"
                    src={webinar.thumbnailUrl}
                    alt={webinar.title}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="px-6 pb-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {webinar.description}
              </p>
            </div>
          </div>

          {/* RSVP Section */}
          <div className="bg-gray-50 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Join This Webinar</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {webinar.rsvpCount} {webinar.rsvpCount === 1 ? 'person has' : 'people have'} RSVPed
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {webinar.hasRSVPed ? (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">You're RSVPed!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRSVP}
                    disabled={rsvpLoading || webinar.status !== 'published'}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                  >
                    {rsvpLoading ? 'RSVPing...' : 'RSVP Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What to Expect</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Interactive Q&A session with nonprofit experts
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Practical tools and resources you can use immediately
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Networking opportunities with other nonprofit professionals
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Recording will be available after the event
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

