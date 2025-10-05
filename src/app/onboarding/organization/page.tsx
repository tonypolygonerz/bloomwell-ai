'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface OrganizationFormData {
  name: string;
  organizationType: string;
  mission: string;
  focusAreas: string[];
  budget: string;
  staffSize: number;
  state: string;
}

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
  { value: '1m_plus', label: '$1,000,000+' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function OrganizationOnboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    organizationType: '',
    mission: '',
    focusAreas: [],
    budget: '',
    staffSize: 1,
    state: '',
  });

  const handleInputChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusAreaToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(value)
        ? prev.focusAreas.filter(area => area !== value)
        : [...prev.focusAreas, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to complete your organization profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Organization Profile
            </h1>
            <p className="text-gray-600">
              Help us provide you with personalized nonprofit guidance by sharing information about your organization.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your organization's name"
              />
            </div>

            {/* Organization Type */}
            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type *
              </label>
              <select
                id="organizationType"
                required
                value={formData.organizationType}
                onChange={(e) => handleInputChange('organizationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select organization type</option>
                {ORGANIZATION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mission Statement */}
            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                Mission Statement
              </label>
              <textarea
                id="mission"
                rows={4}
                value={formData.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your organization's mission and purpose"
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FOCUS_AREAS.map(area => (
                  <label key={area.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.focusAreas.includes(area.value)}
                      onChange={() => handleFocusAreaToggle(area.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget and Staff Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Budget *
                </label>
                <select
                  id="budget"
                  required
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="staffSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Size *
                </label>
                <input
                  type="number"
                  id="staffSize"
                  required
                  min="1"
                  value={formData.staffSize}
                  onChange={(e) => handleInputChange('staffSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Number of staff members"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                id="state"
                required
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select your state</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Organization...' : 'Complete Profile & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
