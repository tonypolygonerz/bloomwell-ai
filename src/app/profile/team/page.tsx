'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type TeamData = {
  fullTimeStaff: number;
  partTimeStaff: number;
  contractors: number;
  volunteers: number;
  boardSize: number;
};

type TeamMember = {
  id: string;
  name: string;
  title: string;
  type: string;
};

export default function ProfileTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TeamData>({
    fullTimeStaff: 0,
    partTimeStaff: 0,
    contractors: 0,
    volunteers: 0,
    boardSize: 0,
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', title: '', type: 'staff' });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/team');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          fullTimeStaff: data.fullTimeStaff || 0,
          partTimeStaff: data.partTimeStaff || 0,
          contractors: data.contractors || 0,
          volunteers: data.volunteers || 0,
          boardSize: data.boardSize || 0,
        });
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save section data
      const sectionResponse = await fetch('/api/onboarding/sections/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!sectionResponse.ok) {
        throw new Error('Failed to save team section');
      }

      const sectionData = await sectionResponse.json();

      // Update progress
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'team',
          sectionScore: sectionData.sectionScore,
          isComplete: sectionData.isComplete,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving team section:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.title) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/onboarding/sections/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });

      if (response.ok) {
        await fetchTeamData();
        setShowAddForm(false);
        setNewMember({ name: '', title: '', type: 'staff' });
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const response = await fetch(`/api/onboarding/sections/team?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTeamData();
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
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
          <h1 className='text-3xl font-bold text-gray-900'>Your Team</h1>
          <p className='mt-2 text-gray-600'>
            Tell us about the people who make your work possible
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='bg-white shadow-sm rounded-lg p-6 space-y-6'
        >
          {/* Staff Counts */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='fullTimeStaff'
                className='block text-sm font-medium text-gray-700'
              >
                Full-Time Staff *
              </label>
              <input
                type='number'
                id='fullTimeStaff'
                min='0'
                required
                value={formData.fullTimeStaff}
                onChange={e =>
                  setFormData({
                    ...formData,
                    fullTimeStaff: parseInt(e.target.value) || 0,
                  })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              />
            </div>

            <div>
              <label
                htmlFor='partTimeStaff'
                className='block text-sm font-medium text-gray-700'
              >
                Part-Time Staff
              </label>
              <input
                type='number'
                id='partTimeStaff'
                min='0'
                value={formData.partTimeStaff}
                onChange={e =>
                  setFormData({
                    ...formData,
                    partTimeStaff: parseInt(e.target.value) || 0,
                  })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              />
            </div>

            <div>
              <label
                htmlFor='contractors'
                className='block text-sm font-medium text-gray-700'
              >
                Contractors
              </label>
              <input
                type='number'
                id='contractors'
                min='0'
                value={formData.contractors}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contractors: parseInt(e.target.value) || 0,
                  })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              />
            </div>

            <div>
              <label
                htmlFor='volunteers'
                className='block text-sm font-medium text-gray-700'
              >
                Active Volunteers *
              </label>
              <input
                type='number'
                id='volunteers'
                min='0'
                required
                value={formData.volunteers}
                onChange={e =>
                  setFormData({
                    ...formData,
                    volunteers: parseInt(e.target.value) || 0,
                  })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              />
            </div>

            <div>
              <label
                htmlFor='boardSize'
                className='block text-sm font-medium text-gray-700'
              >
                Board Size
              </label>
              <input
                type='number'
                id='boardSize'
                min='0'
                value={formData.boardSize}
                onChange={e =>
                  setFormData({
                    ...formData,
                    boardSize: parseInt(e.target.value) || 0,
                  })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2 border'
              />
            </div>
          </div>

          {/* Key Team Members */}
          <div className='border-t pt-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='font-semibold text-gray-900'>
                  Key Team Members (Optional)
                </h3>
                <p className='text-sm text-gray-600'>
                  Add details about leadership or key staff
                </p>
              </div>
              <button
                type='button'
                onClick={() => setShowAddForm(!showAddForm)}
                className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm'
              >
                {showAddForm ? 'Cancel' : '+ Add Member'}
              </button>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <div className='mb-4 p-4 border rounded-lg bg-gray-50'>
                <div className='space-y-3'>
                  <input
                    type='text'
                    placeholder='Name'
                    value={newMember.name}
                    onChange={e =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                  />
                  <input
                    type='text'
                    placeholder='Title'
                    value={newMember.title}
                    onChange={e =>
                      setNewMember({ ...newMember, title: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                  />
                  <select
                    value={newMember.type}
                    onChange={e =>
                      setNewMember({ ...newMember, type: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                  >
                    <option value='staff'>Staff</option>
                    <option value='board'>Board Member</option>
                    <option value='volunteer'>Volunteer</option>
                  </select>
                  <button
                    type='button'
                    onClick={handleAddMember}
                    className='w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700'
                  >
                    Save Member
                  </button>
                </div>
              </div>
            )}

            {/* Team Members List */}
            {teamMembers.length > 0 && (
              <div className='space-y-3'>
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div>
                      <p className='font-medium'>{member.name}</p>
                      <p className='text-sm text-gray-600'>{member.title}</p>
                      <p className='text-xs text-gray-500 capitalize'>
                        {member.type}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleDeleteMember(member.id)}
                      className='text-red-600 hover:text-red-700 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
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
          Section 3 of 8 • Team Structure
        </div>
      </div>
    </div>
  );
}


