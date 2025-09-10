'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface OrganizationData {
  id?: string
  name: string
  mission: string
  budget: string
  staffSize: string
  focusAreas: string
}

interface ProPublicaOrganization {
  ein: string
  name: string
  city: string
  state: string
  zip: string
  country: string
  category: string
  subsection: string
  ruling_date: string
  deductibility: string
  classification: string
  asset_amount: string
  income_amount: string
  revenue_amount: string
  ntee_code: string
  ntee_classification: string
  website: string
  mission: string
  address: string
  full_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProPublicaOrganization[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<ProPublicaOrganization | null>(null)

  const [formData, setFormData] = useState<OrganizationData>({
    name: '',
    mission: '',
    budget: '',
    staffSize: '',
    focusAreas: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Load organization data
  useEffect(() => {
    if (session?.user) {
      loadOrganizationData()
    }
  }, [session])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/organization')
      if (response.ok) {
        const data = await response.json()
        if (data.organization) {
          setFormData({
            id: data.organization.id,
            name: data.organization.name || '',
            mission: data.organization.mission || '',
            budget: data.organization.budget || '',
            staffSize: data.organization.staffSize || '',
            focusAreas: data.organization.focusAreas || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchOrganizations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/organization-search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.organizations || [])
        setShowSearchResults(true)
      } else {
        setError('Failed to search organizations')
      }
    } catch (error) {
      console.error('Error searching organizations:', error)
      setError('Failed to search organizations')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchOrganizations(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const selectOrganization = (org: ProPublicaOrganization) => {
    setSelectedOrganization(org)
    setFormData(prev => ({
      ...prev,
      name: org.name,
      mission: org.mission || prev.mission,
    }))
    setSearchQuery(org.name)
    setShowSearchResults(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedOrganization(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, id: data.organization.id }))
        setMessage('Organization profile saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save organization profile')
      }
    } catch (error) {
      setError('An error occurred while saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization profile...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization's information and settings
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Organization Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your organization's information to help us provide better assistance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Organization Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search for Your Organization
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search by organization name or EIN..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Search using ProPublica's Nonprofit Explorer database
              </p>

              {/* Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((org) => (
                    <div
                      key={org.ein}
                      onClick={() => selectOrganization(org)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-500">
                            {org.city}, {org.state} • EIN: {org.ein}
                          </p>
                          {org.mission && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {org.mission}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && !isSearching && (
                <div className="mt-2 border border-gray-200 rounded-md bg-white p-3">
                  <p className="text-sm text-gray-500">No organizations found. Try a different search term or enter details manually below.</p>
                </div>
              )}
            </div>

            {/* Selected Organization Info */}
            {selectedOrganization && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Organization Found: {selectedOrganization.name}
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      EIN: {selectedOrganization.ein} • {selectedOrganization.city}, {selectedOrganization.state}
                    </p>
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="text-sm text-green-600 hover:text-green-500 mt-1"
                    >
                      Use different organization
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your organization name"
              />
            </div>

            {/* Mission Statement */}
            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700">
                Mission Statement
              </label>
              <textarea
                id="mission"
                name="mission"
                rows={4}
                value={formData.mission}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe your organization's mission and purpose"
              />
            </div>

            {/* Annual Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Annual Budget
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select budget range</option>
                <option value="Under $50,000">Under $50,000</option>
                <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                <option value="$250,000 - $500,000">$250,000 - $500,000</option>
                <option value="$500,000 - $1,000,000">$500,000 - $1,000,000</option>
                <option value="$1,000,000 - $5,000,000">$1,000,000 - $5,000,000</option>
                <option value="Over $5,000,000">Over $5,000,000</option>
              </select>
            </div>

            {/* Staff Size */}
            <div>
              <label htmlFor="staffSize" className="block text-sm font-medium text-gray-700">
                Staff Size
              </label>
              <select
                id="staffSize"
                name="staffSize"
                value={formData.staffSize}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select staff size</option>
                <option value="1-5 employees">1-5 employees</option>
                <option value="6-10 employees">6-10 employees</option>
                <option value="11-25 employees">11-25 employees</option>
                <option value="26-50 employees">26-50 employees</option>
                <option value="51-100 employees">51-100 employees</option>
                <option value="101-500 employees">101-500 employees</option>
                <option value="Over 500 employees">Over 500 employees</option>
              </select>
            </div>

            {/* Focus Areas */}
            <div>
              <label htmlFor="focusAreas" className="block text-sm font-medium text-gray-700">
                Focus Areas
              </label>
              <textarea
                id="focusAreas"
                name="focusAreas"
                rows={3}
                value={formData.focusAreas}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="List your organization's main focus areas (e.g., Education, Healthcare, Environment, etc.)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate multiple focus areas with commas
              </p>
            </div>

            {/* Messages */}
            {message && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Organization Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


