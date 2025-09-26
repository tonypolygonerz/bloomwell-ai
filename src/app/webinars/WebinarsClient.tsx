'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  timezone: string;
  duration: number;
  thumbnailUrl?: string;
  slug: string;
  status: 'draft' | 'published' | 'live' | 'completed';
  rsvpCount: number;
  maxAttendees: number;
  categories: string[];
  guestSpeakers: Array<{
    honorific: string;
    firstName: string;
    lastName: string;
    title: string;
    institution: string;
    email: string;
    bio: string;
  }>;
}

const CATEGORIES = [
  'All',
  'Grant Writing',
  'Board Governance',
  'Fundraising',
  'Operations',
  'Strategic Planning',
  'Technology',
  'Marketing',
];

export default function WebinarsClient() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredWebinars, setFilteredWebinars] = useState<Webinar[]>([]);

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    filterWebinars();
  }, [webinars, searchTerm, selectedCategory]);

  const fetchWebinars = async () => {
    try {
      const response = await fetch('/api/webinars');
      if (response.ok) {
        const data = await response.json();
        setWebinars(data.webinars || []);
      }
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWebinars = () => {
    let filtered = webinars;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        webinar =>
          webinar.categories && webinar.categories.includes(selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        webinar =>
          webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          webinar.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Only show published webinars
    filtered = filtered.filter(webinar => webinar.status === 'published');

    setFilteredWebinars(filtered);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading webinars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              Upcoming Webinars for Nonprofit Leaders
            </h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Expert-led sessions to help your organization thrive. Learn from
              industry leaders and connect with peers.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-lg shadow-sm border p-6 mb-8'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  placeholder='Search webinars...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className='lg:w-64'>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className='mb-6'>
          <p className='text-gray-600'>
            Showing {filteredWebinars.length} webinar
            {filteredWebinars.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Webinars Grid */}
        {filteredWebinars.length === 0 ? (
          <div className='text-center py-12'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
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
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No webinars found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back soon for upcoming webinars.'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredWebinars.map(webinar => (
              <WebinarCard key={webinar.id} webinar={webinar} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WebinarCard({ webinar }: { webinar: Webinar }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const getTimeUntilEvent = (scheduledDate: string) => {
    const now = new Date();
    const eventDate = new Date(scheduledDate);
    const diffMs = eventDate.getTime() - now.getTime();

    if (diffMs < 0) return 'Past event';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'Today';
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200'>
      {/* Image */}
      <div className='relative'>
        {webinar.thumbnailUrl ? (
          <img
            className='w-full h-48 object-cover rounded-t-lg'
            src={webinar.thumbnailUrl}
            alt={webinar.title}
          />
        ) : (
          <div className='w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg flex items-center justify-center'>
            <svg
              className='w-16 h-16 text-white'
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
          </div>
        )}

        {/* Date Badge */}
        <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium text-gray-900'>
          <div className='text-center'>
            <div className='font-semibold'>
              {formatDate(webinar.scheduledDate)}
            </div>
            <div className='text-xs text-gray-600'>
              {formatTime(webinar.scheduledDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Title */}
        <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
          {webinar.title}
        </h3>

        {/* Description */}
        <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
          {webinar.description}
        </p>

        {/* Guest Speakers */}
        {webinar.guestSpeakers && webinar.guestSpeakers.length > 0 && (
          <div className='mb-4'>
            <div className='flex items-center space-x-2 mb-2'>
              <svg
                className='w-4 h-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
              <span className='text-sm font-medium text-gray-700'>
                Guest Speakers
              </span>
            </div>
            <div className='flex -space-x-2'>
              {webinar.guestSpeakers.slice(0, 3).map((speaker, index) => (
                <div
                  key={index}
                  className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white'
                  title={`${speaker.firstName} ${speaker.lastName}`}
                >
                  {speaker.firstName.charAt(0).toUpperCase()}
                </div>
              ))}
              {webinar.guestSpeakers.length > 3 && (
                <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white'>
                  +{webinar.guestSpeakers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RSVP Count */}
        <div className='flex items-center justify-between mb-4'>
          <span className='text-sm text-gray-600'>
            {webinar.rsvpCount} attending
          </span>
          <span className='text-sm text-gray-500'>
            {getTimeUntilEvent(webinar.scheduledDate)}
          </span>
        </div>

        {/* Categories */}
        {webinar.categories && webinar.categories.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-4'>
            {webinar.categories.slice(0, 2).map(category => (
              <span
                key={category}
                className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'
              >
                {category}
              </span>
            ))}
            {webinar.categories.length > 2 && (
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                +{webinar.categories.length - 2}
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={`/webinar/${webinar.slug}`}
          className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center block transition-colors duration-200'
        >
          Learn More & RSVP
        </Link>
      </div>
    </div>
  );
}
