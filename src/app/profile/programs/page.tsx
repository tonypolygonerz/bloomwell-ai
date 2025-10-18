'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Program = {
  id?: string;
  name: string;
  description: string;
  whoServed: string;
  location: string;
  frequency: string;
  peopleServed: number | null;
  goals: string;
  successMetrics: string;
};

export default function ProfileProgramsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyProgram: Program = {
    name: '',
    description: '',
    whoServed: '',
    location: '',
    frequency: '',
    peopleServed: null,
    goals: '',
    successMetrics: '',
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/programs');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async (program: Program) => {
    setSaving(true);
    try {
      const isEditing = !!program.id;
      const response = await fetch('/api/onboarding/sections/programs', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program),
      });

      if (!response.ok) {
        throw new Error('Failed to save program');
      }

      const data = await response.json();

      // Update progress
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'programs',
          sectionScore: data.sectionScore,
          isComplete: data.isComplete,
        }),
      });

      // Refresh list
      await fetchPrograms();
      setShowForm(false);
      setEditingProgram(null);
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const response = await fetch(
        `/api/onboarding/sections/programs?id=${id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchPrograms();
      }
    } catch (error) {
      console.error('Error deleting program:', error);
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
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2'
          >
            ← Back to Dashboard
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>
            Programs & Services
          </h1>
          <p className='mt-2 text-gray-600'>
            Add the programs and services your organization offers
          </p>
        </div>

        {/* Programs List */}
        {programs.length > 0 && !showForm && (
          <div className='mb-6 space-y-4'>
            {programs.map(program => (
              <div
                key={program.id}
                className='bg-white shadow-sm rounded-lg p-6 border border-gray-200'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {program.name}
                    </h3>
                    <p className='mt-1 text-gray-600'>{program.description}</p>
                    <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='font-medium'>Serves:</span>{' '}
                        {program.whoServed}
                      </div>
                      <div>
                        <span className='font-medium'>Location:</span>{' '}
                        {program.location}
                      </div>
                      <div>
                        <span className='font-medium'>Frequency:</span>{' '}
                        {program.frequency}
                      </div>
                      {program.peopleServed && (
                        <div>
                          <span className='font-medium'>Annual Reach:</span>{' '}
                          {program.peopleServed} people
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => {
                        setEditingProgram(program);
                        setShowForm(true);
                      }}
                      className='text-emerald-600 hover:text-emerald-700 px-3 py-1'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(program.id!)}
                      className='text-red-600 hover:text-red-700 px-3 py-1'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Program Button */}
        {!showForm && (
          <button
            onClick={() => {
              setEditingProgram(emptyProgram);
              setShowForm(true);
            }}
            className='mb-6 w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors'
          >
            + Add Program or Service
          </button>
        )}

        {/* Program Form */}
        {showForm && (
          <ProgramForm
            program={editingProgram || emptyProgram}
            onSave={handleSaveProgram}
            onCancel={() => {
              setShowForm(false);
              setEditingProgram(null);
            }}
            saving={saving}
          />
        )}

        {/* Continue Button */}
        {programs.length > 0 && !showForm && (
          <div className='flex gap-4'>
            <button
              onClick={() => router.push('/dashboard')}
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
            >
              Save for Later
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium'
            >
              Save & Continue
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          Section 2 of 8 • Programs & Services
        </div>
      </div>
    </div>
  );
}

function ProgramForm({
  program,
  onSave,
  onCancel,
  saving,
}: {
  program: Program;
  onSave: (program: Program) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Program>(program);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white shadow-sm rounded-lg p-6 space-y-6'
    >
      <h3 className='text-xl font-semibold text-gray-900'>
        {formData.id ? 'Edit Program' : 'Add New Program'}
      </h3>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Program Name *
        </label>
        <input
          type='text'
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
          placeholder='e.g., Youth Mentorship Program'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Description
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
          placeholder='Brief description of this program'
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Who is Served?
          </label>
          <input
            type='text'
            value={formData.whoServed}
            onChange={e =>
              setFormData({ ...formData, whoServed: e.target.value })
            }
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            placeholder='e.g., Youth ages 12-18'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Location
          </label>
          <input
            type='text'
            value={formData.location}
            onChange={e =>
              setFormData({ ...formData, location: e.target.value })
            }
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            placeholder='e.g., South Central LA'
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={e =>
              setFormData({ ...formData, frequency: e.target.value })
            }
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
          >
            <option value=''>Select frequency...</option>
            <option value='Daily'>Daily</option>
            <option value='Weekly'>Weekly</option>
            <option value='Monthly'>Monthly</option>
            <option value='Quarterly'>Quarterly</option>
            <option value='Annual'>Annual</option>
            <option value='Ongoing'>Ongoing</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            People Served Annually
          </label>
          <input
            type='number'
            value={formData.peopleServed || ''}
            onChange={e =>
              setFormData({
                ...formData,
                peopleServed: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
            placeholder='100'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>Goals</label>
        <textarea
          rows={2}
          value={formData.goals}
          onChange={e => setFormData({ ...formData, goals: e.target.value })}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
          placeholder='What are the goals of this program?'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Success Metrics
        </label>
        <textarea
          rows={2}
          value={formData.successMetrics}
          onChange={e =>
            setFormData({ ...formData, successMetrics: e.target.value })
          }
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
          placeholder='How do you measure success?'
        />
      </div>

      <div className='flex gap-4'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={saving}
          className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 font-medium'
        >
          {saving ? 'Saving...' : 'Save Program'}
        </button>
      </div>
    </form>
  );
}
