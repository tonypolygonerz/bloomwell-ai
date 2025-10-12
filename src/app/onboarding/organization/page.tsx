'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

interface OrganizationFormData {
  name: string;
  organizationType: string;
  mission: string;
  focusAreas: string[];
  budget: string;
  staffSize: number;
  state: string;
  ein?: string;
  isVerified: boolean;
}

interface SuccessMessageProps {
  organizationName: string;
  onClose: () => void;
}

// Constants
const ORGANIZATION_TYPES = [
  { value: 'nonprofit', label: 'Nonprofit Organization' },
  { value: 'church', label: 'Church / Religious Organization' },
  { value: 'faith_based', label: 'Faith-Based Organization' },
  { value: 'social_enterprise', label: 'Social Enterprise' },
];

const FOCUS_AREAS = [
  { value: 'youth_programs', label: 'Youth Programs' },
  { value: 'education', label: 'Education' },
  { value: 'housing', label: 'Housing & Homelessness' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'environment', label: 'Environment & Sustainability' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'community_development', label: 'Community Development' },
  { value: 'elderly_care', label: 'Elderly Care' },
  { value: 'animal_welfare', label: 'Animal Welfare' },
  { value: 'international_aid', label: 'International Aid' },
];

const BUDGET_RANGES = [
  { value: 'under_100k', label: 'Under $100,000' },
  { value: '100k_500k', label: '$100,000 - $500,000' },
  { value: '500k_1m', label: '$500,000 - $1,000,000' },
  { value: '1m_3m', label: '$1,000,000 - $3,000,000' },
];

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

// Success Message Component
function SuccessMessage({ organizationName, onClose }: SuccessMessageProps) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4'>
            <svg
              className='h-10 w-10 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h3 className='text-2xl font-bold text-gray-900 mb-2'>
            Organization Saved!
          </h3>
          <p className='text-gray-600 mb-1'>
            <strong>{organizationName}</strong> has been successfully added to
            your profile.
          </p>
          <p className='text-sm text-gray-500'>
            Redirecting to dashboard in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationOnboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ProPublica search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProPublicaOrganization[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<ProPublicaOrganization | null>(null);
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Form data
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    organizationType: '',
    mission: '',
    focusAreas: [],
    budget: '',
    staffSize: 1,
    state: '',
    ein: '',
    isVerified: false,
  });

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
    setError(null);
    try {
      const response = await fetch(
        `/api/organization-search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.organizations || []);
        setShowSearchResults(true);
      } else {
        setError('Failed to search organizations');
      }
    } catch (err) {
      console.error('Error searching organizations:', err);
      setError('Failed to search organizations');
    } finally {
      setIsSearching(false);
    }
  };

  const selectOrganization = (org: ProPublicaOrganization) => {
    setSelectedOrganization(org);
    setFormData(prev => ({
      ...prev,
      name: org.name,
      mission: org.mission || prev.mission,
      state: org.state || prev.state,
      ein: org.ein,
      isVerified: true,
    }));
    setSearchQuery(org.name);
    setShowSearchResults(false);
  };

  const clearSelection = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedOrganization(null);
    setFormData(prev => ({
      ...prev,
      name: '',
      mission: '',
      ein: '',
      isVerified: false,
    }));
  };

  const handleInputChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusAreaToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(value)
        ? prev.focusAreas.filter(area => area !== value)
        : [...prev.focusAreas, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (
      !formData.name ||
      !formData.organizationType ||
      !formData.budget ||
      !formData.staffSize ||
      !formData.state
    ) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          focusAreas: formData.focusAreas.join(','),
          staffSize: formData.staffSize.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      const result = await response.json();
      console.log('Organization created:', result);

      // Show success message
      setShowSuccess(true);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Please sign in
          </h1>
          <p className='text-gray-600'>
            You need to be signed in to complete your organization profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8'>
      {/* Success Message Modal */}
      {showSuccess && (
        <SuccessMessage
          organizationName={formData.name}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Complete Your Organization Profile
          </h1>
          <p className='text-lg text-gray-600'>
            Help us understand your organization to provide personalized
            guidance and resources
          </p>
        </div>

        {/* Main Content Card */}
        <div className='bg-white shadow-xl rounded-lg overflow-hidden p-8'>
          {/* Error Display */}
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-md p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-red-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>Error</h3>
                  <div className='mt-2 text-sm text-red-700'>{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Single Form - All Fields */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Organization Search Section */}
            <div>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Organization Information
              </h2>

              {/* Search Input */}
              <div className='relative mb-6'>
                <label
                  htmlFor='organization-search'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Search for your organization
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    id='organization-search'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Enter your organization name...'
                    className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                    {isSearching ? (
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-green-600' />
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
                        className='w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors'
                      >
                        <div className='font-medium text-gray-900'>
                          {org.name}
                        </div>
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
                      No organizations found. You can enter your details
                      manually.
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Organization Card */}
              {selectedOrganization && (
                <div className='mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center mb-2'>
                        <svg
                          className='h-5 w-5 text-green-600 mr-2'
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
                        <span className='text-sm font-medium text-green-800'>
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

              {/* Manual Entry Option */}
              {!selectedOrganization && (
                <div className='mb-6'>
                  <div className='flex items-center justify-center'>
                    <div className='border-t border-gray-300 flex-grow'></div>
                    <span className='px-4 text-sm text-gray-500'>
                      Or enter manually
                    </span>
                    <div className='border-t border-gray-300 flex-grow'></div>
                  </div>
                  <div className='mt-6'>
                    <label
                      htmlFor='manual-name'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Organization Name
                    </label>
                    <input
                      type='text'
                      id='manual-name'
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder="Enter your organization's name"
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Organization Details Section */}
            <div className='border-t pt-6 space-y-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Organization Details
              </h2>

              {/* Organization Type */}
              <div>
                <label
                  htmlFor='organizationType'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Organization Type *
                </label>
                <select
                  id='organizationType'
                  required
                  value={formData.organizationType}
                  onChange={e =>
                    handleInputChange('organizationType', e.target.value)
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value=''>Select organization type</option>
                  {ORGANIZATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mission Statement */}
              <div>
                <label
                  htmlFor='mission'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Mission Statement
                </label>
                <textarea
                  id='mission'
                  rows={4}
                  value={formData.mission}
                  onChange={e => handleInputChange('mission', e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  placeholder="Describe your organization's mission and purpose"
                />
              </div>

              {/* Focus Areas */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Focus Areas (Select all that apply)
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {FOCUS_AREAS.map(area => (
                    <label
                      key={area.value}
                      className='flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={formData.focusAreas.includes(area.value)}
                        onChange={() => handleFocusAreaToggle(area.value)}
                        className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
                      />
                      <span className='ml-3 text-sm text-gray-700'>
                        {area.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget and Staff Size */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='budget'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Annual Budget *
                  </label>
                  <select
                    id='budget'
                    required
                    value={formData.budget}
                    onChange={e => handleInputChange('budget', e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  >
                    <option value=''>Select budget range</option>
                    {BUDGET_RANGES.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='staffSize'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Staff Size *
                  </label>
                  <input
                    type='number'
                    id='staffSize'
                    required
                    min='1'
                    value={formData.staffSize}
                    onChange={e =>
                      handleInputChange('staffSize', parseInt(e.target.value))
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    placeholder='Number of staff members'
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor='state'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  State *
                </label>
                <select
                  id='state'
                  required
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value=''>Select your state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end pt-6 border-t mt-8'>
              <button
                type='submit'
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  !formData.organizationType ||
                  !formData.budget ||
                  !formData.staffSize ||
                  !formData.state
                }
                className='px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center shadow-md'
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2' />
                    Saving Organization...
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
  );
}
