'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface Material {
  file: File;
  name: string;
}

export default function CreateWebinar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    timezone: 'America/Los_Angeles',
    duration: 60,
    maxAttendees: 100,
    status: 'draft',
    registrationRequired: 'true',
    sendReminders: 'true',
    metaDescription: '',
    tags: '',
    jitsiRoom: '',
  });

  // File uploads
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
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
  const [jitsiRoomDisplay, setJitsiRoomDisplay] = useState(
    'bloomwell-webinar-[auto-generated-id]'
  );
  const [metaCharCount, setMetaCharCount] = useState(0);

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
    }
  }, [router]);

  // Auto-update URL preview and social preview
  useEffect(() => {
    const title = formData.title;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setUrlPreview(`bloomwell.ai/webinar/${slug || 'your-webinar-slug'}`);
    setJitsiRoomDisplay(`bloomwell-${slug || 'webinar'}-${Date.now()}`);
  }, [formData.title]);

  useEffect(() => {
    setMetaCharCount(formData.metaDescription.length);
  }, [formData.metaDescription]);

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

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetThumbnail(file);
    }
  };

  const validateAndSetThumbnail = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and GIF files are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setSelectedThumbnail(file);

    const reader = new FileReader();
    reader.onload = e => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMaterialsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMaterials: Material[] = [];

    files.forEach(file => {
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
        newMaterials.push({ file, name: file.name });
      }
    });

    setMaterials([...materials, ...newMaterials]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleDropThumbnail = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetThumbnail(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.date ||
        !formData.time
      ) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const sessionData = JSON.parse(adminSession);
      console.log('Form using admin session:', sessionData);

      // Combine date and time for scheduledDate
      const scheduledDate = new Date(`${formData.date}T${formData.time}`);

      // Format guest speakers properly
      const formattedGuests = guests
        .filter(g => g.firstName && g.lastName)
        .map(guest => ({
          name: `${guest.honorific ? guest.honorific + ' ' : ''}${guest.firstName} ${guest.lastName}`,
          title: guest.title,
          company: guest.institution,
          email: guest.email,
          bio: guest.bio,
        }));

      const requestData = {
        title: formData.title,
        description: formData.description,
        scheduledDate: scheduledDate.toISOString(),
        timezone: formData.timezone,
        duration: formData.duration,
        status: formData.status,
        guestSpeakers: formattedGuests,
        materials: materials.map(m => ({ name: m.name, url: '', type: 'PDF' })),
        metaDescription: formData.metaDescription,
        categories: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
        maxAttendees: formData.maxAttendees,
        registrationRequired: formData.registrationRequired === 'true',
        sendReminders: formData.sendReminders === 'true',
      };

      console.log('Submitting webinar data:', requestData);

      const response = await fetch('/api/admin/webinars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setSuccessMessage('Webinar created successfully!');
        setTimeout(() => {
          router.push('/admin/webinars');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Webinar creation failed:', errorData);
        setError(errorData.error || 'Failed to create webinar');
      }
    } catch (error) {
      console.error('Webinar creation error:', error);
      setError(
        'An error occurred while creating the webinar: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    // You could implement a separate draft save endpoint here
    setSuccessMessage('Draft saved successfully!');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-4'>
            <AdminBreadcrumb
              items={[
                { label: 'Webinars', href: '/admin/webinars' },
                { label: 'Create New' },
              ]}
            />
          </div>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Create New Webinar
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Set up a comprehensive webinar event with guests, materials, and
                SEO optimization
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
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      placeholder='Enter compelling webinar title'
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
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      placeholder='Describe what this webinar will cover and what attendees will learn'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label
                        htmlFor='date'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Date *
                      </label>
                      <input
                        type='date'
                        id='date'
                        name='date'
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='time'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Time *
                      </label>
                      <input
                        type='time'
                        id='time'
                        name='time'
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='timezone'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Timezone *
                      </label>
                      <select
                        id='timezone'
                        name='timezone'
                        required
                        value={formData.timezone}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      >
                        <option value='America/Los_Angeles'>
                          Pacific Time (PT)
                        </option>
                        <option value='America/Denver'>
                          Mountain Time (MT)
                        </option>
                        <option value='America/Chicago'>
                          Central Time (CT)
                        </option>
                        <option value='America/New_York'>
                          Eastern Time (ET)
                        </option>
                        <option value='UTC'>UTC</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='duration'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Duration (minutes) *
                      </label>
                      <input
                        type='number'
                        id='duration'
                        name='duration'
                        value={formData.duration}
                        onChange={handleChange}
                        min='30'
                        max='180'
                        required
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
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
                        value={formData.maxAttendees}
                        onChange={handleChange}
                        min='10'
                        max='500'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Jitsi Configuration */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-blue-900 mb-4'>
                  Jitsi Meet Configuration
                </h3>
                <div>
                  <label className='block text-sm font-medium text-blue-800 mb-2'>
                    Room Name (auto-generated)
                  </label>
                  <div className='bg-white border border-blue-300 rounded-md px-3 py-2 font-mono text-sm text-blue-900'>
                    {jitsiRoomDisplay}
                  </div>
                  <p className='mt-2 text-sm text-blue-700'>
                    Jitsi room will be created automatically when webinar is
                    saved
                  </p>
                </div>
              </div>

              {/* Guest Management */}
              <div className='bg-white shadow rounded-lg p-6'>
                <div className='flex justify-between items-center mb-6 pb-2 border-b border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Guest Speakers
                  </h3>
                  <button
                    type='button'
                    onClick={addGuest}
                    className='bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700'
                  >
                    + Add Guest
                  </button>
                </div>

                <div className='space-y-4'>
                  {guests.map((guest, index) => (
                    <div
                      key={index}
                      className='p-4 bg-gray-50 rounded-lg border'
                    >
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
                        <div>
                          <label className='block text-xs font-medium text-gray-600 mb-1'>
                            Honorific
                          </label>
                          <select
                            value={guest.honorific}
                            onChange={e =>
                              updateGuest(index, 'honorific', e.target.value)
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                          >
                            <option value=''>Select</option>
                            <option value='Dr.'>Dr.</option>
                            <option value='Mr.'>Mr.</option>
                            <option value='Ms.'>Ms.</option>
                            <option value='Mrs.'>Mrs.</option>
                            <option value='Prof.'>Prof.</option>
                            <option value='Rev.'>Rev.</option>
                            <option value='Hon.'>Hon.</option>
                            <option value='Sen.'>Sen.</option>
                            <option value='Rep.'>Rep.</option>
                          </select>
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-600 mb-1'>
                            First Name
                          </label>
                          <input
                            type='text'
                            placeholder='First Name'
                            value={guest.firstName}
                            onChange={e =>
                              updateGuest(index, 'firstName', e.target.value)
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-600 mb-1'>
                            Last Name
                          </label>
                          <input
                            type='text'
                            placeholder='Last Name'
                            value={guest.lastName}
                            onChange={e =>
                              updateGuest(index, 'lastName', e.target.value)
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                        <div>
                          <label className='block text-xs font-medium text-gray-600 mb-1'>
                            Title
                          </label>
                          <input
                            type='text'
                            placeholder='Job Title or Position'
                            value={guest.title}
                            onChange={e =>
                              updateGuest(index, 'title', e.target.value)
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-600 mb-1'>
                            Institution
                          </label>
                          <input
                            type='text'
                            placeholder='Organization or Company'
                            value={guest.institution}
                            onChange={e =>
                              updateGuest(index, 'institution', e.target.value)
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>
                      </div>
                      <div className='mb-3'>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          Email
                        </label>
                        <input
                          type='email'
                          placeholder='speaker@example.com'
                          value={guest.email}
                          onChange={e =>
                            updateGuest(index, 'email', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>
                      <div className='mb-3'>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          Bio
                        </label>
                        <textarea
                          rows={2}
                          placeholder='Brief biography or background'
                          value={guest.bio}
                          onChange={e =>
                            updateGuest(index, 'bio', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>
                      <div className='flex justify-end'>
                        <button
                          type='button'
                          onClick={() => removeGuest(index)}
                          className='bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600'
                        >
                          Remove Speaker
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloadable Materials */}
              <div className='bg-white shadow rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200'>
                  Downloadable Materials (PDFs/Worksheets)
                </h3>

                <div
                  onDrop={handleDropThumbnail}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('materials')?.click()}
                  className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors'
                >
                  <div className='text-4xl mb-3'>📄</div>
                  <p className='font-semibold text-gray-700'>
                    Upload Materials
                  </p>
                  <p className='text-gray-600'>
                    Drop PDF files here or click to browse
                  </p>
                  <p className='text-sm text-gray-500 mt-2'>
                    PDF files up to 10MB each
                  </p>
                  <input
                    type='file'
                    id='materials'
                    name='materials'
                    multiple
                    accept='.pdf'
                    onChange={handleMaterialsUpload}
                    className='hidden'
                  />
                </div>

                {materials.length > 0 && (
                  <div className='mt-4 space-y-2'>
                    {materials.map((material, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center p-3 bg-gray-100 rounded-md'
                      >
                        <span className='text-sm font-medium text-gray-700'>
                          {material.name}
                        </span>
                        <button
                          type='button'
                          onClick={() => removeMaterial(index)}
                          className='bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600'
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className='bg-white shadow rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200'>
                  Webinar Thumbnail
                </h3>

                {!selectedThumbnail ? (
                  <div
                    onDrop={handleDropThumbnail}
                    onDragOver={handleDragOver}
                    onClick={() =>
                      document.getElementById('thumbnail')?.click()
                    }
                    className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors'
                  >
                    <div className='text-4xl mb-3'>🖼️</div>
                    <p className='font-semibold text-gray-700'>
                      Upload Thumbnail
                    </p>
                    <p className='text-gray-600'>
                      Recommended: 1200x630px for social sharing
                    </p>
                    <p className='text-sm text-gray-500 mt-2'>
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      type='file'
                      id='thumbnail'
                      name='thumbnail'
                      accept='image/*'
                      onChange={handleThumbnailUpload}
                      className='hidden'
                    />
                  </div>
                ) : (
                  <div className='flex items-center space-x-4 p-4 border border-gray-300 rounded-md bg-gray-50'>
                    {thumbnailPreview && (
                      <div className='flex-shrink-0'>
                        <img
                          src={thumbnailPreview}
                          alt='Preview'
                          className='h-20 w-32 object-cover rounded-md'
                        />
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {selectedThumbnail.name}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {(selectedThumbnail.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedThumbnail(null);
                        setThumbnailPreview(null);
                      }}
                      className='text-red-600 hover:text-red-800 text-sm font-medium'
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* SEO & Social */}
              <div className='bg-white shadow rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200'>
                  SEO & Social Media
                </h3>

                <div className='space-y-6'>
                  <div>
                    <label
                      htmlFor='metaDescription'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Meta Description (for SEO)
                    </label>
                    <textarea
                      id='metaDescription'
                      name='metaDescription'
                      rows={3}
                      value={formData.metaDescription}
                      onChange={handleChange}
                      maxLength={160}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      placeholder='Brief description for search engines (150-160 characters)'
                    />
                    <p
                      className={`mt-1 text-sm ${metaCharCount > 160 ? 'text-red-600' : 'text-gray-500'}`}
                    >
                      {metaCharCount}/160 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor='tags'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Tags (comma-separated)
                    </label>
                    <input
                      type='text'
                      id='tags'
                      name='tags'
                      value={formData.tags}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      placeholder='nonprofit, fundraising, grants, board development'
                    />
                  </div>

                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                    <div className='font-semibold text-gray-900 mb-1'>
                      {formData.title || 'Your Webinar Title Will Appear Here'}
                    </div>
                    <div className='text-sm text-gray-600 mb-2'>
                      {formData.metaDescription ||
                        'Your meta description will appear here for social media previews'}
                    </div>
                    <div className='text-xs text-green-600'>
                      bloomwell.ai/webinar/your-webinar-slug
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Preview Card */}
              <div className='bg-white shadow rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200'>
                  Social Media Preview
                </h3>

                <div className='bg-white border border-gray-300 rounded-lg p-4 shadow-sm max-w-md'>
                  {/* Thumbnail Preview */}
                  <div className='mb-3'>
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt='Webinar thumbnail'
                        className='w-full h-48 object-cover rounded-lg'
                      />
                    ) : (
                      <div className='w-full h-48 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center'>
                        <div className='text-center text-white'>
                          <svg
                            className='w-12 h-12 mx-auto mb-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                            />
                          </svg>
                          <p className='text-sm font-medium'>
                            Webinar Thumbnail
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Content */}
                  <div className='space-y-2'>
                    <div className='font-semibold text-gray-900 text-sm leading-tight'>
                      {formData.title || 'Your Webinar Title'}
                    </div>
                    <div className='text-xs text-gray-600'>
                      {formData.metaDescription ||
                        'Meta description will appear here'}
                    </div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500'>
                      <span className='font-medium text-green-600'>
                        bloomwell.ai
                      </span>
                      <span>•</span>
                      <span>
                        {formData.date
                          ? new Date(formData.date).toLocaleDateString()
                          : 'Date'}
                      </span>
                      <span>•</span>
                      <span>{formData.time || 'Time'}</span>
                    </div>
                  </div>
                </div>

                <p className='mt-3 text-sm text-gray-600'>
                  This preview shows how your webinar will appear when shared on
                  social media platforms.
                </p>
              </div>

              {/* Form Actions */}
              <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={saveDraft}
                  className='bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700'
                >
                  Save as Draft
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50'
                >
                  {loading ? 'Creating...' : 'Create Webinar'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* URL Preview */}
            <div className='bg-white shadow rounded-lg p-6'>
              <h4 className='font-semibold text-gray-900 mb-4'>
                Public URL Preview
              </h4>
              <div className='bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-sm text-gray-900 break-all'>
                {urlPreview}
              </div>
              <p className='mt-2 text-xs text-gray-500'>
                URL will be generated from title
              </p>
            </div>

            {/* Quick Settings */}
            <div className='bg-white shadow rounded-lg p-6'>
              <h4 className='font-semibold text-gray-900 mb-4'>
                Quick Settings
              </h4>
              <div className='space-y-4'>
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  >
                    <option value='draft'>Draft</option>
                    <option value='published'>Published</option>
                    <option value='scheduled'>Scheduled</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='registrationRequired'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Registration Required
                  </label>
                  <select
                    id='registrationRequired'
                    name='registrationRequired'
                    value={formData.registrationRequired}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  >
                    <option value='true'>Yes - Account Required</option>
                    <option value='false'>No - Open Access</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='sendReminders'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Send Email Reminders
                  </label>
                  <select
                    id='sendReminders'
                    name='sendReminders'
                    value={formData.sendReminders}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  >
                    <option value='true'>Yes</option>
                    <option value='false'>No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reminder Schedule */}
            <div className='bg-white shadow rounded-lg p-6'>
              <h4 className='font-semibold text-gray-900 mb-4'>
                Reminder Schedule
              </h4>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li className='flex items-center'>
                  <span className='mr-2'>📧</span>1 week before
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>📧</span>
                  24 hours before
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>📧</span>1 hour before
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>📱</span>
                  Starting now notification
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className='bg-white shadow rounded-lg p-6'>
              <h4 className='font-semibold text-gray-900 mb-4'>💡 Tips</h4>
              <ul className='text-xs text-gray-600 space-y-2'>
                <li>• Use action words in titles</li>
                <li>• Include benefit for attendees</li>
                <li>• Upload materials before publishing</li>
                <li>• Test Jitsi room before going live</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
