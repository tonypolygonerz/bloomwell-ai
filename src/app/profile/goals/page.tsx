'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FUNDING_GOALS = [
  'Hire Staff',
  'Expand Existing Programs',
  'Launch New Programs',
  'Buy Equipment/Supplies',
  'Rent/Renovate Space',
  'Technology Upgrades',
  'Professional Development',
  'Marketing/Outreach',
  'Research/Evaluation',
  'Build Reserves',
  'Capital Campaign',
  'Other',
];

type GoalsData = {
  fundingGoals: string[];
  seekingAmount: string;
  timeline: string;
};

export default function ProfileGoalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GoalsData>({
    fundingGoals: [],
    seekingAmount: '',
    timeline: '',
  });

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const fetchGoalsData = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/goals');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          fundingGoals: Array.isArray(data.fundingGoals)
            ? data.fundingGoals
            : [],
          seekingAmount: data.seekingAmount || '',
          timeline: data.timeline || '',
        });
      }
    } catch (error) {
      console.error('Error fetching goals data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save section data
      const sectionResponse = await fetch('/api/onboarding/sections/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!sectionResponse.ok) {
        throw new Error('Failed to save goals section');
      }

      const sectionData = await sectionResponse.json();

      // Update progress
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'goals',
          sectionScore: sectionData.sectionScore,
          isComplete: sectionData.isComplete,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving goals section:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = (goal: string) => {
    if (formData.fundingGoals.includes(goal)) {
      setFormData({
        ...formData,
        fundingGoals: formData.fundingGoals.filter(g => g !== goal),
      });
    } else if (formData.fundingGoals.length < 3) {
      setFormData({
        ...formData,
        fundingGoals: [...formData.fundingGoals, goal],
      });
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  const isValid =
    formData.fundingGoals.length > 0 &&
    formData.seekingAmount &&
    formData.timeline;

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
          <h1 className='text-3xl font-bold text-gray-900'>Funding Goals</h1>
          <p className='mt-2 text-gray-600'>
            Tell us what you&apos;re looking to accomplish with funding
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='bg-white shadow-sm rounded-lg p-6 space-y-6'
        >
          {/* Funding Goals */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Top 3 Funding Goals *
            </label>
            <p className='text-sm text-gray-600 mb-4'>
              What would you use grant funding for? Select up to 3
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {FUNDING_GOALS.map(goal => {
                const isSelected = formData.fundingGoals.includes(goal);
                const isDisabled =
                  !isSelected && formData.fundingGoals.length >= 3;

                return (
                  <button
                    key={goal}
                    type='button'
                    onClick={() => toggleGoal(goal)}
                    disabled={isDisabled}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : isDisabled
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={3}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                        )}
                      </div>
                      <span className='font-medium text-gray-900'>{goal}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className='text-sm text-gray-500 mt-2'>
              {formData.fundingGoals.length}/3 selected
            </p>
          </div>

          {/* Seeking Amount */}
          <div>
            <label
              htmlFor='seekingAmount'
              className='block text-sm font-medium text-gray-700'
            >
              How much funding are you seeking? *
            </label>
            <select
              id='seekingAmount'
              required
              value={formData.seekingAmount}
              onChange={e =>
                setFormData({ ...formData, seekingAmount: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            >
              <option value=''>Select amount range...</option>
              <option value='under_10k'>Under $10,000</option>
              <option value='10k_25k'>$10,000 - $25,000</option>
              <option value='25k_50k'>$25,000 - $50,000</option>
              <option value='50k_100k'>$50,000 - $100,000</option>
              <option value='100k_250k'>$100,000 - $250,000</option>
              <option value='250k_500k'>$250,000 - $500,000</option>
              <option value='over_500k'>Over $500,000</option>
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label
              htmlFor='timeline'
              className='block text-sm font-medium text-gray-700'
            >
              When do you need this funding? *
            </label>
            <select
              id='timeline'
              required
              value={formData.timeline}
              onChange={e =>
                setFormData({ ...formData, timeline: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            >
              <option value=''>Select timeline...</option>
              <option value='immediate'>Immediately</option>
              <option value='1_3_months'>Within 1-3 months</option>
              <option value='3_6_months'>Within 3-6 months</option>
              <option value='6_12_months'>Within 6-12 months</option>
              <option value='over_1_year'>More than 1 year</option>
            </select>
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
              disabled={saving || !isValid}
              className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium'
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          Section 7 of 8 • Funding Goals
        </div>
      </div>
    </div>
  );
}


