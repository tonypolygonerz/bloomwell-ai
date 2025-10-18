'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

interface Guest {
  honorific: string;
  firstName: string;
  lastName: string;
  title: string;
  institution: string;
  email: string;
  bio: string;
}

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  timezone: string;
  duration: number;
  maxAttendees: number;
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  metaDescription: string;
  categories: string[];
  guestSpeakers: Guest[];
  materials: unknown[];
  thumbnailUrl?: string;
  uniqueSlug: string;
}

export default function EditWebinar() {
  const router = useRouter();
  const params = useParams();
  const webinarId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    timezone: 'America/Los_Angeles',
    duration: 60,
    maxAttendees: 100,
    status: 'draft',
    metaDescription: '',
    categories: '',
  });

  // File uploads
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([
    {
      honorific: '',
      firstName: '',
      lastName: '',
      title: '',
      institution: '',
      email: '',
      bio: '',
    },
  ]);

  // Auto-generated values
  const [urlPreview, setUrlPreview] = useState(
    'bloomwell.ai/webinar/your-webinar-slug'
  );

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }

    fetchWebinarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webinarId, router]);

  const fetchWebinarData = async () => {
    setLoading(true);
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;

      const sessionData = JSON.parse(adminSession);

      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        headers: { Authorization: `Bearer ${sessionData.token}` },
      });

      if (response.ok) {
        const webinar: Webinar = await response.json();

        // Parse the scheduled date for form
        const scheduledDate = new Date(webinar.scheduledDate);
        const dateStr = scheduledDate.toISOString().split('T')[0];
        const timeStr = scheduledDate.toTimeString().split(' ')[0].slice(0, 5);

        setFormData({
          title: webinar.title,
          description: webinar.description,
          scheduledDate: `${dateStr}T${timeStr}`,
          timezone: webinar.timezone,
          duration: webinar.duration,
          maxAttendees: webinar.maxAttendees,
          status: webinar.status,
          metaDescription: webinar.metaDescription,
          categories: webinar.categories.join(', '),
        });

        // Parse guest speakers
        if (webinar.guestSpeakers && webinar.guestSpeakers.length > 0) {
          setGuests(webinar.guestSpeakers);
        }

        setThumbnailPreview(webinar.thumbnailUrl || null);
        setUrlPreview(`bloomwell.ai/webinar/${webinar.uniqueSlug}`);
      } else if (response.status === 401) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      } else {
        setError('Failed to fetch webinar data');
      }
    } catch (error) {
      console.error('Error fetching webinar:', error);
      setError('Failed to fetch webinar data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'duration' || name === 'maxAttendees'
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const sessionData = JSON.parse(adminSession);

      // Format guest speakers properly
      const formattedGuests = guests
        .filter(g => g.firstName && g.lastName)
        .map(guest => ({
          honorific: guest.honorific,
          firstName: guest.firstName,
          lastName: guest.lastName,
          title: guest.title,
          institution: guest.institution,
          email: guest.email,
          bio: guest.bio,
        }));

      const requestData = {
        title: formData.title,
        description: formData.description,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        timezone: formData.timezone,
        duration: formData.duration,
        status: formData.status,
        guestSpeakers: formattedGuests,
        materials: [],
        metaDescription: formData.metaDescription,
        categories: formData.categories
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
        maxAttendees: formData.maxAttendees,
        registrationRequired: true,
        sendReminders: true,
      };

      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setSuccessMessage('Webinar updated successfully!');
        setTimeout(() => {
          router.push('/admin/webinars');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Webinar update failed:', errorData);
        setError(errorData.error || 'Failed to update webinar');
      }
    } catch (error) {
      console.error('Webinar update error:', error);
      setError(
        'An error occurred while updating the webinar: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setSaving(false);
    }
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        honorific: '',
        firstName: '',
        lastName: '',
        title: '',
        institution: '',
        email: '',
        bio: '',
      },
    ]);
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = guests.map((guest, i) =>
      i === index ? { ...guest, [field]: value } : guest
    );
    setGuests(updatedGuests);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading webinar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-4'>
            <AdminBreadcrumb
              items={[
                { label: 'Webinars', href: '/admin/webinars' },
                { label: 'Edit Webinar' },
              ]}
            />
          </div>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Edit Webinar</h1>
              <p className='mt-1 text-sm text-gray-500'>
                Update webinar details and settings
              </p>
            </div>
            <Link
              href='/admin/webinars'
              className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium'
            >
              Back to Webinars
            </Link>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        {successMessage && (
          <div className='mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded'>
            {successMessage}
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Form */}
          <div className='lg:col-span-2'>
            <form onSubmit={handleSubmit} className='space-y-8'>
              {/* Basic Information */}
              <div className='bg-white shadow rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200'>
                  Basic Information
                </h3>

                <div className='space-y-6'>
                  <div>
                    <label
                      htmlFor='title'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Webinar Title *
                    </label>
                    <input
                      type='text'
                      id='title'
                      name='title'
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='Enter webinar title'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Description *
                    </label>
                    <textarea
                      id='description'
                      name='description'
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='Describe what attendees will learn'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label
                        htmlFor='scheduledDate'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Date & Time *
                      </label>
                      <input
                        type='datetime-local'
                        id='scheduledDate'
                        name='scheduledDate'
                        required
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='timezone'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Timezone
                      </label>
                      <select
                        id='timezone'
                        name='timezone'
                        value={formData.timezone}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      >
                        <option value='America/Los_Angeles'>
                          Pacific Time
                        </option>
                        <option value='America/Denver'>Mountain Time</option>
                        <option value='America/Chicago'>Central Time</option>
                        <option value='America/New_York'>Eastern Time</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label
                        htmlFor='duration'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Duration (minutes)
                      </label>
                      <input
                        type='number'
                        id='duration'
                        name='duration'
                        min='15'
                        max='300'
                        value={formData.duration}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='maxAttendees'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Max Attendees
                      </label>
                      <input
                        type='number'
                        id='maxAttendees'
                        name='maxAttendees'
                        min='1'
                        max='1000'
                        value={formData.maxAttendees}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='status'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Status
                    </label>
                    <select
                      id='status'
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    >
                      <option value='draft'>Draft</option>
                      <option value='published'>Published</option>
                      <option value='live'>Live</option>
                      <option value='completed'>Completed</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='categories'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Categories
                    </label>
                    <input
                      type='text'
                      id='categories'
                      name='categories'
                      value={formData.categories}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='Grant Writing, Fundraising, etc. (comma-separated)'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='metaDescription'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Meta Description
                    </label>
                    <textarea
                      id='metaDescription'
                      name='metaDescription'
                      rows={2}
                      value={formData.metaDescription}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='SEO description for search engines'
                    />
                  </div>
                </div>
              </div>

              {/* Guest Speakers */}
              <div className='bg-white shadow rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200'>
                  Guest Speakers
                </h3>

                {guests.map((guest, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-lg p-4 mb-4'
                  >
                    <div className='flex justify-between items-center mb-4'>
                      <h4 className='text-md font-medium text-gray-900'>
                        Speaker {index + 1}
                      </h4>
                      {guests.length > 1 && (
                        <button
                          type='button'
                          onClick={() => removeGuest(index)}
                          className='text-red-600 hover:text-red-800 text-sm font-medium'
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Honorific
                        </label>
                        <select
                          value={guest.honorific}
                          onChange={e =>
                            updateGuest(index, 'honorific', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        >
                          <option value=''>Select</option>
                          <option value='Dr.'>Dr.</option>
                          <option value='Mr.'>Mr.</option>
                          <option value='Ms.'>Ms.</option>
                          <option value='Mrs.'>Mrs.</option>
                          <option value='Prof.'>Prof.</option>
                          <option value='Rev.'>Rev.</option>
                        </select>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          First Name
                        </label>
                        <input
                          type='text'
                          value={guest.firstName}
                          onChange={e =>
                            updateGuest(index, 'firstName', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Last Name
                        </label>
                        <input
                          type='text'
                          value={guest.lastName}
                          onChange={e =>
                            updateGuest(index, 'lastName', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Title
                        </label>
                        <input
                          type='text'
                          value={guest.title}
                          onChange={e =>
                            updateGuest(index, 'title', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Institution
                        </label>
                        <input
                          type='text'
                          value={guest.institution}
                          onChange={e =>
                            updateGuest(index, 'institution', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Email
                        </label>
                        <input
                          type='email'
                          value={guest.email}
                          onChange={e =>
                            updateGuest(index, 'email', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Bio
                        </label>
                        <textarea
                          rows={2}
                          value={guest.bio}
                          onChange={e =>
                            updateGuest(index, 'bio', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type='button'
                  onClick={addGuest}
                  className='mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
                >
                  Add Guest Speaker
                </button>
              </div>

              {/* Submit Buttons */}
              <div className='flex justify-end space-x-4'>
                <Link
                  href='/admin/webinars'
                  className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md text-sm font-medium'
                >
                  Cancel
                </Link>
                <button
                  type='submit'
                  disabled={saving}
                  className='bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-md text-sm font-medium'
                >
                  {saving ? 'Updating...' : 'Update Webinar'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Preview
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    URL
                  </label>
                  <p className='text-sm text-gray-600 break-all'>
                    {urlPreview}
                  </p>
                </div>

                {thumbnailPreview && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Thumbnail
                    </label>
                    <div className='relative w-full h-32'>
                      <Image
                      src={thumbnailPreview}
                      alt='Thumbnail preview'
                        fill
                        className='object-cover rounded-md'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px'
                    />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
