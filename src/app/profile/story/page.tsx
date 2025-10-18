'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type StoryData = {
  successStory: string;
  problemSolving: string;
  beneficiaries: string;
  dreamScenario: string;
};

export default function ProfileStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StoryData>({
    successStory: '',
    problemSolving: '',
    beneficiaries: '',
    dreamScenario: '',
  });

  useEffect(() => {
    fetchStoryData();
  }, []);

  const fetchStoryData = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/story');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          successStory: data.successStory || '',
          problemSolving: data.problemSolving || '',
          beneficiaries: data.beneficiaries || '',
          dreamScenario: data.dreamScenario || '',
        });
      }
    } catch (error) {
      console.error('Error fetching story data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save section data
      const sectionResponse = await fetch('/api/onboarding/sections/story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!sectionResponse.ok) {
        throw new Error('Failed to save story section');
      }

      const sectionData = await sectionResponse.json();

      // Update progress
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'story',
          sectionScore: sectionData.sectionScore,
          isComplete: sectionData.isComplete,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving story section:', error);
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
          <h1 className='text-3xl font-bold text-gray-900'>Your Story</h1>
          <p className='mt-2 text-gray-600'>
            Share your organization&apos;s impact, challenges, and vision
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='bg-white shadow-sm rounded-lg p-6 space-y-8'
        >
          {/* Success Story */}
          <div>
            <label
              htmlFor='successStory'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Success Story ✨
            </label>
            <p className='text-sm text-gray-600 mb-3'>
              Share a specific example of how your organization made a
              difference. What happened? Who was helped? What was the outcome?
            </p>
            <textarea
              id='successStory'
              rows={6}
              value={formData.successStory}
              onChange={e =>
                setFormData({ ...formData, successStory: e.target.value })
              }
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder="Tell us about a time when your work truly transformed someone's life or community..."
            />
            <p className='mt-1 text-sm text-gray-500'>
              {formData.successStory.length}/50 characters minimum
            </p>
          </div>

          {/* Problem Solving */}
          <div>
            <label
              htmlFor='problemSolving'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Problem You&apos;re Solving 🎯
            </label>
            <p className='text-sm text-gray-600 mb-3'>
              What specific problem or challenge does your organization address?
              Why is this problem important?
            </p>
            <textarea
              id='problemSolving'
              rows={6}
              value={formData.problemSolving}
              onChange={e =>
                setFormData({ ...formData, problemSolving: e.target.value })
              }
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder='Describe the core issue your organization exists to solve...'
            />
            <p className='mt-1 text-sm text-gray-500'>
              {formData.problemSolving.length}/50 characters minimum
            </p>
          </div>

          {/* Beneficiaries */}
          <div>
            <label
              htmlFor='beneficiaries'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Who Benefits? 👥
            </label>
            <p className='text-sm text-gray-600 mb-3'>
              Tell us about the people or communities you serve. What are their
              challenges? How does your work help them?
            </p>
            <textarea
              id='beneficiaries'
              rows={6}
              value={formData.beneficiaries}
              onChange={e =>
                setFormData({ ...formData, beneficiaries: e.target.value })
              }
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder='Share details about the people or communities your organization serves...'
            />
            <p className='mt-1 text-sm text-gray-500'>
              {formData.beneficiaries.length}/50 characters minimum
            </p>
          </div>

          {/* Dream Scenario */}
          <div>
            <label
              htmlFor='dreamScenario'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Dream Scenario 🌟
            </label>
            <p className='text-sm text-gray-600 mb-3'>
              If you had unlimited resources, what would your organization
              accomplish? What&apos;s your vision for the future?
            </p>
            <textarea
              id='dreamScenario'
              rows={6}
              value={formData.dreamScenario}
              onChange={e =>
                setFormData({ ...formData, dreamScenario: e.target.value })
              }
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              placeholder="Paint a picture of your organization's ideal future impact..."
            />
            <p className='mt-1 text-sm text-gray-500'>
              {formData.dreamScenario.length}/50 characters minimum
            </p>
          </div>

          {/* Helper Text */}
          <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-4'>
            <h4 className='font-medium text-emerald-900 mb-2'>
              💡 Why we ask these questions
            </h4>
            <p className='text-sm text-emerald-800'>
              Your story helps us understand your mission on a deeper level.
              This information enables better grant matching, helps our AI
              provide more relevant recommendations, and allows potential
              funders to connect with your impact.
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
              disabled={saving}
              className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium'
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          Section 7 of 8 • Your Story
        </div>
      </div>
    </div>
  );
}
