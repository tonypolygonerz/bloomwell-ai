'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface FilterOption {
  value: string
  label: string
}

interface SearchFiltersProps {
  type: 'users' | 'webinars'
  onSearch: (params: Record<string, string>) => void
  onExport?: () => void
  showExport?: boolean
}

export default function AdminSearchFilters({ 
  type, 
  onSearch, 
  onExport, 
  showExport = false 
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    accountType: searchParams.get('accountType') || '',
    activity: searchParams.get('activity') || '',
    sortBy: searchParams.get('sortBy') || (type === 'users' ? 'createdAt' : 'scheduledDate'),
    sortOrder: searchParams.get('sortOrder') || 'desc',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  })

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, filters])

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    
    if (search) params.set('search', search)
    if (filters.status) params.set('status', filters.status)
    if (filters.accountType) params.set('accountType', filters.accountType)
    if (filters.activity) params.set('activity', filters.activity)
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    // Update URL
    router.push(`?${params.toString()}`, { scroll: false })
    
    // Call search callback
    onSearch(Object.fromEntries(params.entries()))
  }, [search, filters, router, onSearch])

  const handleClearFilters = () => {
    setSearch('')
    setFilters({
      status: '',
      accountType: '',
      activity: '',
      sortBy: type === 'users' ? 'createdAt' : 'scheduledDate',
      sortOrder: 'desc',
      dateFrom: '',
      dateTo: ''
    })
    router.push(window.location.pathname, { scroll: false })
    onSearch({})
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getStatusOptions = (): FilterOption[] => {
    if (type === 'webinars') {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'live', label: 'Live' },
        { value: 'completed', label: 'Completed' }
      ]
    }
    return []
  }

  const getAccountTypeOptions = (): FilterOption[] => {
    if (type === 'users') {
      return [
        { value: '', label: 'All Account Types' },
        { value: 'oauth', label: 'OAuth (Google/Microsoft)' },
        { value: 'email', label: 'Email Signup' }
      ]
    }
    return []
  }

  const getActivityOptions = (): FilterOption[] => {
    if (type === 'users') {
      return [
        { value: '', label: 'All Activity' },
        { value: 'active', label: 'Active (Last 30 days)' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'never_logged_in', label: 'Never Used' }
      ]
    }
    return []
  }

  const getSortOptions = (): FilterOption[] => {
    if (type === 'users') {
      return [
        { value: 'createdAt', label: 'Created Date' },
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'organization', label: 'Organization' }
      ]
    } else {
      return [
        { value: 'scheduledDate', label: 'Scheduled Date' },
        { value: 'title', label: 'Title' },
        { value: 'status', label: 'Status' },
        { value: 'rsvpCount', label: 'RSVP Count' }
      ]
    }
  }

  const hasActiveFilters = search || filters.status || filters.accountType || filters.activity || filters.dateFrom || filters.dateTo

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder={
                type === 'users' 
                  ? "Search by name, email, or organization..." 
                  : "Search by title or description..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Status Filter (Webinars only) */}
          {type === 'webinars' && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account Type Filter (Users only) */}
          {type === 'users' && (
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                id="accountType"
                value={filters.accountType}
                onChange={(e) => handleFilterChange('accountType', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {getAccountTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Activity Filter (Users only) */}
          {type === 'users' && (
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-1">
                Activity
              </label>
              <select
                id="activity"
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {getActivityOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range (Webinars only) */}
          {type === 'webinars' && (
            <>
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}

          {/* Sort Options */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {getSortOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sortOrder"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {showExport && onExport && (
            <button
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
