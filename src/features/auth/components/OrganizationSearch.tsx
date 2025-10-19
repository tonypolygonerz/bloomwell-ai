'use client';

import { useState, useEffect } from 'react';

// Types
interface ProPublicaOrganization {
  ein: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  category: string;
  subsection: string;
  ruling_date: string;
  deductibility: string;
  classification: string;
  asset_amount: string;
  income_amount: string;
  revenue_amount: string;
  ntee_code: string;
  ntee_classification: string;
  website: string;
  mission: string;
  address: string;
  full_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface OrganizationSearchProps {
  onOrganizationSelect: (org: ProPublicaOrganization) => void;
  onClearSelection: () => void;
  selectedOrganization: ProPublicaOrganization | null;
  className?: string;
  placeholder?: string;
  label?: string;
}

export default function OrganizationSearch({
  onOrganizationSelect,
  onClearSelection,
  selectedOrganization,
  className = '',
  placeholder = 'Enter your organization name...',
  label = 'Search for your organization',
}: OrganizationSearchProps) {
  // ProPublica search state
  const [searchQuery, setSearchQuery] = useState(
    selectedOrganization?.name || ''
  );
  const [searchResults, setSearchResults] = useState<ProPublicaOrganization[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Auto-search with debounce
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (searchQuery.trim().length > 2) {
      const timer = setTimeout(() => {
        searchOrganizations(searchQuery);
      }, 500);
      setSearchDebounceTimer(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchQuery]);

  const searchOrganizations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/organization-search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.organizations || []);
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error('Error searching organizations:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectOrganization = (org: ProPublicaOrganization) => {
    onOrganizationSelect(org);
    setSearchQuery(org.name);
    setShowSearchResults(false);
  };

  const clearSelection = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    onClearSelection();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className='relative mb-6'>
        <label
          htmlFor='organization-search'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          {label}
        </label>
        <div className='relative'>
          <input
            type='text'
            id='organization-search'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            {isSearching ? (
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600' />
            ) : (
              <svg
                className='h-5 w-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className='absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto'>
            {searchResults.map(org => (
              <button
                key={org.ein}
                onClick={() => selectOrganization(org)}
                className='w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors'
              >
                <div className='font-medium text-gray-900'>{org.name}</div>
                <div className='text-sm text-gray-500 mt-1'>
                  {org.city}, {org.state} • EIN: {org.ein}
                </div>
                {org.mission && (
                  <div className='text-sm text-gray-600 mt-1 line-clamp-2'>
                    {org.mission}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {showSearchResults && searchResults.length === 0 && (
          <div className='absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4'>
            <p className='text-gray-600 text-sm'>
              No organizations found. You can enter your details manually.
            </p>
          </div>
        )}
      </div>

      {/* Selected Organization Card */}
      {selectedOrganization && (
        <div className='mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='flex items-center mb-2'>
                <svg
                  className='h-5 w-5 text-emerald-600 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className='text-sm font-medium text-emerald-800'>
                  Verified Organization
                </span>
              </div>
              <h3 className='font-bold text-gray-900 mb-1'>
                {selectedOrganization.name}
              </h3>
              <p className='text-sm text-gray-600'>
                {selectedOrganization.address}
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                EIN: {selectedOrganization.ein}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                className='h-5 w-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
