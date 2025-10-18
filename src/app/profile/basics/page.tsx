'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationSearch from '@/components/OrganizationSearch';

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

type BasicsData = {
  name: string;
  organizationType: string;
  mission: string;
  state: string;
  ein: string;
  focusAreas: string;
};

export default function ProfileBasicsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<ProPublicaOrganization | null>(null);
  const [formData, setFormData] = useState<BasicsData>({
    name: '',
    organizationType: '',
    mission: '',
    state: '',
    ein: '',
    focusAreas: '',
  });

  useEffect(() => {
    fetchBasicsData();
  }, []);

  const fetchBasicsData = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/basics');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          organizationType: data.organizationType || '',
          mission: data.mission || '',
          state: data.state || '',
          ein: data.ein || '',
          focusAreas: data.focusAreas || '',
        });
      }
    } catch (error) {
      console.error('Error fetching basics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSelect = (org: ProPublicaOrganization) => {
    setSelectedOrganization(org);
    setFormData(prev => ({
      ...prev,
      name: org.name,
      state: org.state || prev.state,
      ein: org.ein,
      organizationType: '501c3', // Auto-select 501(c)(3) from ProPublica
      // Do NOT auto-fill mission or focusAreas - user must write these
    }));
  };

  const handleClearSelection = () => {
    setSelectedOrganization(null);
    setFormData(prev => ({
      ...prev,
      name: '',
      ein: '',
      state: '',
      organizationType: '',
      // Keep mission and focusAreas as they are - user might have started typing
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save section data
      const sectionResponse = await fetch('/api/onboarding/sections/basics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!sectionResponse.ok) {
        throw new Error('Failed to save basics section');
      }

      const sectionData = await sectionResponse.json();

      // Update progress
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'basics',
          sectionScore: sectionData.sectionScore,
          isComplete: sectionData.isComplete,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving basics section:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2'
          >
            ← Back to Dashboard
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>
            Organization Basics
          </h1>
          <p className='mt-2 text-gray-600'>
            Tell us about your organization&apos;s core information
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='bg-white shadow-sm rounded-lg p-6 space-y-6'
        >
          {/* Organization Search */}
          <OrganizationSearch
            onOrganizationSelect={handleOrganizationSelect}
            onClearSelection={handleClearSelection}
            selectedOrganization={selectedOrganization}
            label="Organization Name *"
            placeholder="Search for your organization or enter manually..."
          />

          {/* Manual Organization Name Input (fallback) */}
          {!selectedOrganization && (
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'
              >
                Organization Name *
              </label>
              <input
                type='text'
                id='name'
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
                placeholder='e.g., Bloomwell Community Services'
              />
              <p className='mt-1 text-sm text-gray-500'>
                💡 Tip: Use the search above to auto-fill organization details from ProPublica
              </p>
            </div>
          )}

          {/* Organization Type */}
          <div>
            <label
              htmlFor='organizationType'
              className='block text-sm font-medium text-gray-700'
            >
              Organization Type *
            </label>
            <select
              id='organizationType'
              required
              value={formData.organizationType}
              onChange={e =>
                setFormData({ ...formData, organizationType: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            >
              <option value=''>Select type...</option>
              <option value='501c3'>501(c)(3) Nonprofit</option>
              <option value='501c4'>501(c)(4) Social Welfare</option>
              <option value='faith-based'>Faith-Based Organization</option>
              <option value='social-enterprise'>Social Enterprise</option>
              <option value='community-group'>Community Group</option>
              <option value='other'>Other</option>
            </select>
          </div>

          {/* Mission */}
          <div>
            <label
              htmlFor='mission'
              className='block text-sm font-medium text-gray-700'
            >
              Mission Statement *
            </label>
            <textarea
              id='mission'
              required
              rows={4}
              value={formData.mission}
              onChange={e =>
                setFormData({ ...formData, mission: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder="What is your organization's mission? (minimum 20 characters)"
            />
            <p className='mt-1 text-sm text-gray-500'>
              {formData.mission.length}/20 characters minimum
            </p>
          </div>

          {/* State */}
          <div>
            <label
              htmlFor='state'
              className='block text-sm font-medium text-gray-700'
            >
              Primary State of Operation *
            </label>
            <input
              type='text'
              id='state'
              required
              value={formData.state}
              onChange={e =>
                setFormData({ ...formData, state: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder='e.g., California, TX, New York'
            />
          </div>

          {/* EIN */}
          <div>
            <label
              htmlFor='ein'
              className='block text-sm font-medium text-gray-700'
            >
              EIN (Employer Identification Number)
            </label>
            <input
              type='text'
              id='ein'
              value={formData.ein}
              onChange={e => setFormData({ ...formData, ein: e.target.value })}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder='XX-XXXXXXX'
            />
            <p className='mt-1 text-sm text-gray-500'>
              Optional but helps with grant matching
            </p>
          </div>

          {/* Focus Areas */}
          <div>
            <label
              htmlFor='focusAreas'
              className='block text-sm font-medium text-gray-700'
            >
              Focus Areas / Issue Areas
            </label>
            <input
              type='text'
              id='focusAreas'
              value={formData.focusAreas}
              onChange={e =>
                setFormData({ ...formData, focusAreas: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder='e.g., Youth Development, Environmental Justice, Arts Education'
            />
            <p className='mt-1 text-sm text-gray-500'>
              Separate multiple areas with commas
            </p>
          </div>

          {/* Submit Button */}
          <div className='flex gap-4'>
            <button
              type='button'
              onClick={() => router.push('/dashboard')}
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Save for Later
            </button>
            <button
              type='submit'
              disabled={saving || (!selectedOrganization && !formData.name)}
              className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium'
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          Section 1 of 8 • Organization Basics
        </div>
      </div>
    </div>
  );
}
