'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface OrganizationData {
  id?: string;
  name: string;
  mission: string;
  budget: string;
  staffSize: string;
  focusAreas: string;
  organizationType: string;
  state: string;
  ein?: string;
  isVerified: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [editData, setEditData] = useState<OrganizationData>({
    name: '',
    mission: '',
    budget: '',
    staffSize: '',
    focusAreas: '',
    organizationType: '',
    state: '',
    ein: '',
    isVerified: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load organization data
  useEffect(() => {
    if (session?.user) {
      loadOrganizationData();
    }
  }, [session]);

  const loadOrganizationData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organization');
      if (response.ok) {
        const data = await response.json();
        if (data.organization) {
          setOrganizationData(data.organization);
          setEditData(data.organization);
        }
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
      setError('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(organizationData || editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(organizationData || editData);
    setError('');
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizationData(data.organization);
        setEditData(data.organization);
        setIsEditing(false);
        setMessage('Organization profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update organization profile');
      }
    } catch (error) {
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading organization profile...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!organizationData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            No Organization Profile
          </h2>
          <p className='text-gray-600 mb-6'>
            You haven't set up your organization profile yet.
          </p>
          <button
            onClick={() => router.push('/onboarding/organization')}
            className='px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            Set Up Organization Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Organization Profile
          </h1>
          <p className='mt-2 text-gray-600'>
            View and manage your organization's information and settings
          </p>
        </div>

        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
            <div>
              <h2 className='text-lg font-medium text-gray-900'>
                Organization Details
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                Your organization's information and verification status
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              >
                <svg className='h-4 w-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          <div className='px-6 py-6'>
            {/* Messages */}
            {message && (
              <div className='mb-6 rounded-md bg-green-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-green-800'>{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className='mb-6 rounded-md bg-red-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-red-800'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Organization Name */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Organization Name
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='name'
                    value={editData.name}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                  />
                ) : (
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900 font-medium'>{organizationData.name}</span>
                    {organizationData.isVerified && (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        <svg className='h-3 w-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* EIN Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  EIN Number
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='ein'
                    value={editData.ein || ''}
                    onChange={handleInputChange}
                    placeholder='Enter EIN number'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                  />
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900'>{organizationData.ein || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Organization Type */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Organization Type
                </label>
                {isEditing ? (
                  <select
                    name='organizationType'
                    value={editData.organizationType}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                  >
                    <option value=''>Select type</option>
                    <option value='nonprofit'>Nonprofit Organization</option>
                    <option value='church'>Church / Religious Organization</option>
                    <option value='faith_based'>Faith-Based Organization</option>
                    <option value='social_enterprise'>Social Enterprise</option>
                  </select>
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900 capitalize'>{organizationData.organizationType || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  State
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='state'
                    value={editData.state}
                    onChange={handleInputChange}
                    placeholder='Enter state'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                  />
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900'>{organizationData.state || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Annual Budget */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Annual Budget
                </label>
                {isEditing ? (
                  <select
                    name='budget'
                    value={editData.budget}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                  >
                    <option value=''>Select budget range</option>
                    <option value='under_100k'>Under $100,000</option>
                    <option value='100k_500k'>$100,000 - $500,000</option>
                    <option value='500k_1m'>$500,000 - $1,000,000</option>
                    <option value='1m_3m'>$1,000,000 - $3,000,000</option>
                  </select>
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900'>{organizationData.budget || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Staff Size */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Staff Size
                </label>
                {isEditing ? (
                  <input
                    type='number'
                    name='staffSize'
                    value={editData.staffSize}
                    onChange={handleInputChange}
                    min='1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                  />
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900'>{organizationData.staffSize || 'Not specified'} employees</span>
                  </div>
                )}
              </div>

              {/* Mission Statement */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mission Statement
                </label>
                {isEditing ? (
                  <textarea
                    name='mission'
                    rows={4}
                    value={editData.mission}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                    placeholder="Describe your organization's mission and purpose"
                  />
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900 whitespace-pre-wrap'>{organizationData.mission || 'No mission statement provided'}</span>
                  </div>
                )}
              </div>

              {/* Focus Areas */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Focus Areas
                </label>
                {isEditing ? (
                  <textarea
                    name='focusAreas'
                    rows={3}
                    value={editData.focusAreas}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                    placeholder="List your organization's main focus areas (e.g., Education, Healthcare, Environment, etc.)"
                  />
                ) : (
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <span className='text-gray-900'>{organizationData.focusAreas || 'No focus areas specified'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className='mt-8 flex justify-end space-x-3'>
                <button
                  onClick={handleCancel}
                  className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className='px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
