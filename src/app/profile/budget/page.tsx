'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BUDGET_PRIORITIES = [
  'Staff Salaries',
  'Program Supplies',
  'Facilities/Rent',
  'Technology',
  'Marketing/Outreach',
  'Equipment',
  'Travel',
  'Professional Services',
  'Insurance',
  'Utilities',
];

type BudgetData = {
  budget: string;
  budgetPriorities: string[];
};

export default function ProfileBudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BudgetData>({
    budget: '',
    budgetPriorities: [],
  });

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/budget');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          budget: data.budget || '',
          budgetPriorities: Array.isArray(data.budgetPriorities)
            ? data.budgetPriorities
            : [],
        });
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save section data
      const sectionResponse = await fetch('/api/onboarding/sections/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!sectionResponse.ok) {
        throw new Error('Failed to save budget section');
      }

      const sectionData = await sectionResponse.json();

      // Update progress
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'budget',
          sectionScore: sectionData.sectionScore,
          isComplete: sectionData.isComplete,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving budget section:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePriority = (priority: string) => {
    if (formData.budgetPriorities.includes(priority)) {
      setFormData({
        ...formData,
        budgetPriorities: formData.budgetPriorities.filter(p => p !== priority),
      });
    } else if (formData.budgetPriorities.length < 3) {
      setFormData({
        ...formData,
        budgetPriorities: [...formData.budgetPriorities, priority],
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

  const isValid = formData.budget;

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
            Budget & Finances
          </h1>
          <p className='mt-2 text-gray-600'>
            Tell us about your annual budget and funding priorities
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='bg-white shadow-sm rounded-lg p-6 space-y-6'
        >
          {/* Annual Budget */}
          <div>
            <label
              htmlFor='budget'
              className='block text-sm font-medium text-gray-700'
            >
              Annual Budget *
            </label>
            <select
              id='budget'
              required
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: e.target.value })}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            >
              <option value=''>Select budget range...</option>
              <option value='under_100k'>Under $100,000</option>
              <option value='100k_500k'>$100,000 - $500,000</option>
              <option value='500k_1m'>$500,000 - $1,000,000</option>
              <option value='1m_3m'>$1,000,000 - $3,000,000</option>
              <option value='over_3m'>Over $3,000,000</option>
            </select>
          </div>

          {/* Budget Priorities */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Top 3 Budget Priorities
            </label>
            <p className='text-sm text-gray-600 mb-4'>
              Select up to 3 areas where funding would have the most impact
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {BUDGET_PRIORITIES.map(priority => {
                const isSelected = formData.budgetPriorities.includes(priority);
                const isDisabled =
                  !isSelected && formData.budgetPriorities.length >= 3;

                return (
                  <button
                    key={priority}
                    type='button'
                    onClick={() => togglePriority(priority)}
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
                      <span className='font-medium text-gray-900'>
                        {priority}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className='text-sm text-gray-500 mt-2'>
              {formData.budgetPriorities.length}/3 selected
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
              disabled={saving || !isValid}
              className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium'
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          Section 4 of 8 • Budget & Finances
        </div>
      </div>
    </div>
  );
}


