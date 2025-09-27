'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  uniqueSlug: string;
  status: 'draft' | 'published' | 'live' | 'completed';
  rsvpCount: number;
  maxAttendees: number;
  categories: string[];
  guestSpeakers: Array<{
    name: string;
    title: string;
    company: string;
    bio?: string;
    image?: string;
  }>;
  materials: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  jitsiRoomUrl?: string;
  metaDescription?: string;
  socialImageUrl?: string;
}

interface WebinarDetailClientProps {
  webinar: Webinar & { _count: { rsvps: number } };
}

export default function WebinarDetailClient({
  webinar,
}: WebinarDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasRSVPed, setHasRSVPed] = useState(false);

  // Function to convert timezone to user-friendly format
  const getTimezoneDisplay = (timezone: string) => {
    const timezoneMap: { [key: string]: string } = {
      'America/Los_Angeles': 'Pacific',
      'America/Denver': 'Mountain',
      'America/Chicago': 'Central',
      'America/New_York': 'Eastern',
      'America/Phoenix': 'Arizona',
      'America/Anchorage': 'Alaska',
      'Pacific/Honolulu': 'Hawaii',
    };

    const baseTimezone = timezoneMap[timezone] || timezone;
    const now = new Date();
    const dateInTimezone = new Date(
      now.toLocaleString('en-US', { timeZone: timezone })
    );
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offset =
      (dateInTimezone.getTime() - utcDate.getTime()) / (1000 * 60 * 60);

    let suffix = '';
    if (baseTimezone === 'Pacific') {
      suffix = offset === -7 ? 'PDT' : 'PST';
    } else if (baseTimezone === 'Mountain') {
      suffix = offset === -6 ? 'MDT' : 'MST';
    } else if (baseTimezone === 'Central') {
      suffix = offset === -5 ? 'CDT' : 'CST';
    } else if (baseTimezone === 'Eastern') {
      suffix = offset === -4 ? 'EDT' : 'EST';
    }

    return suffix ? `${baseTimezone} / ${suffix}` : baseTimezone;
  };

  const handleRSVP = async () => {
    if (!session) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(
        `/webinar/${webinar.slug || webinar.uniqueSlug}`
      );
      router.push(`/auth/login?callbackUrl=${returnUrl}`);
      return;
    }

    setRsvpLoading(true);
    try {
      const response = await fetch(
        `/api/webinars/${webinar.slug || webinar.uniqueSlug}/rsvp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setHasRSVPed(true);
        alert("You're registered! Check your email for details.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to RSVP');
      }
    } catch (error) {
      setError('An error occurred while RSVPing');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const generateCalendarUrl = (
    type: 'google' | 'outlook' | 'yahoo' | 'ics'
  ) => {
    const startDate = new Date(webinar.scheduledDate);
    const endDate = new Date(
      startDate.getTime() + webinar.duration * 60 * 1000
    );

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(`${webinar.title} : Bloomwell AI`);
    const eventUrl = `${window.location.origin}/webinar/${webinar.slug || webinar.uniqueSlug}`;
    const description = encodeURIComponent(
      `${webinar.description}\n\nHosted by Bloomwell AI\n\nEvent URL: ${eventUrl}`
    );
    const location = encodeURIComponent('Online Event - Bloomwell AI');

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    switch (type) {
      case 'google':
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}&trp=false&sprop=&sprop=name:`;
      case 'outlook':
        return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${description}&location=${location}&path=/calendar/action/compose&rru=addevent`;
      case 'yahoo':
        return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${start}&et=${end}&desc=${description}&in_loc=${location}`;
      case 'ics':
        const uid = `webinar-${webinar.id}@bloomwell-ai.com`;
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Bloomwell AI//Webinar//EN',
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `DTSTAMP:${formatDate(new Date())}`,
          `SUMMARY:${webinar.title} : Bloomwell AI`,
          `DESCRIPTION:${webinar.description.replace(/\n/g, '\\n')}\\n\\nHosted by Bloomwell AI\\n\\nEvent URL: ${eventUrl}`,
          `LOCATION:Online Event - Bloomwell AI`,
          `URL:${eventUrl}`,
          'STATUS:CONFIRMED',
          'TRANSP:OPAQUE',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n');

        const blob = new Blob([icsContent], {
          type: 'text/calendar;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${webinar.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_bloomwell_ai.ics`;
        link.click();
        URL.revokeObjectURL(url);
        return '#';
      default:
        return '#';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Breadcrumb */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <nav className='flex' aria-label='Breadcrumb'>
            <ol className='flex items-center space-x-2'>
              <li>
                <Link
                  href='/webinars'
                  className='text-gray-500 hover:text-gray-700'
                >
                  Webinars
                </Link>
              </li>
              <li>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </li>
              {webinar.categories && webinar.categories.length > 0 && (
                <>
                  <li>
                    <span className='text-gray-500'>
                      {webinar.categories[0]}
                    </span>
                  </li>
                  <li>
                    <svg
                      className='w-4 h-4 text-gray-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </li>
                </>
              )}
              <li>
                <span className='text-gray-900 font-medium truncate max-w-xs'>
                  {webinar.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className='relative bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Content - Left Column (60%) */}
            <div className='lg:col-span-2'>
              {/* Event Image */}
              <div className='mb-8 relative'>
                {webinar.thumbnailUrl ? (
                  <img
                    className='w-full h-64 lg:h-80 object-cover rounded-lg'
                    src={webinar.thumbnailUrl}
                    alt={webinar.title}
                  />
                ) : (
                  <div className='w-full h-64 lg:h-80 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-24 h-24 text-white'
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

                {/* Date/Time Badge */}
                <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg'>
                  <div className='text-center'>
                    <div className='font-semibold text-gray-900'>
                      {formatDate(webinar.scheduledDate)}
                    </div>
                    <div className='text-sm text-gray-600'>
                      {format(new Date(webinar.scheduledDate), 'h:mm a')}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {webinar.duration} min
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Title */}
              <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
                {webinar.title}
              </h1>

              {/* Hosted By */}
              <div className='flex items-center mb-6'>
                <div className='w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold'>
                  BA
                </div>
                <div className='ml-4'>
                  <p className='text-sm text-gray-600'>Hosted by</p>
                  <p className='font-medium text-gray-900'>Bloomwell AI</p>
                </div>
              </div>

              {/* Event Description */}
              <div className='prose prose-lg max-w-none mb-8'>
                <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                  {webinar.description}
                </p>
              </div>

              {/* Details Section */}
              <div className='bg-gray-50 rounded-lg p-6 mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Details
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 text-gray-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span className='text-gray-700'>
                      {format(
                        new Date(webinar.scheduledDate),
                        'EEEE, MMMM d, yyyy • h:mm a'
                      )}{' '}
                      ({getTimezoneDisplay(webinar.timezone)})
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 text-gray-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                    <span className='text-gray-700'>Online Event</span>
                  </div>
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 text-gray-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span className='text-gray-700'>
                      {webinar.duration} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Speakers */}
              {webinar.guestSpeakers && webinar.guestSpeakers.length > 0 && (
                <div className='mb-8'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Guest Speakers
                  </h3>
                  <div className='space-y-4'>
                    {webinar.guestSpeakers.map((speaker, index) => (
                      <div
                        key={index}
                        className='flex items-start space-x-4 p-4 bg-white rounded-lg border'
                      >
                        <div className='w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600'>
                          {speaker.image ? (
                            <img
                              src={speaker.image}
                              alt={`${speaker.firstName} ${speaker.lastName}`}
                              className='w-16 h-16 rounded-full object-cover'
                            />
                          ) : (
                            `${speaker.firstName} ${speaker.lastName}`
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900'>
                            {speaker.honorific ? `${speaker.honorific} ` : ''}
                            {speaker.firstName} {speaker.lastName}
                          </h4>
                          <p className='text-gray-600'>{speaker.title}</p>
                          <p className='text-sm text-gray-500'>
                            {speaker.institution}
                          </p>
                          {speaker.bio && (
                            <p className='text-sm text-gray-700 mt-2'>
                              {speaker.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussion Resources */}
              {webinar.materials && webinar.materials.length > 0 && (
                <div className='mb-8'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Discussion Resources
                  </h3>
                  <div className='space-y-2'>
                    {webinar.materials.map((material, index) => (
                      <a
                        key={index}
                        href={material.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors'
                      >
                        <svg
                          className='w-5 h-5 text-red-500 mr-3'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                          />
                        </svg>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {material.name}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {material.type}
                          </p>
                        </div>
                        <svg
                          className='w-4 h-4 text-gray-400 ml-auto'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                          />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Right Column (40%) */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow-sm border p-6 sticky top-6'>
                {/* Event Meta */}
                <div className='mb-6'>
                  <div className='flex items-center text-sm text-gray-600 mb-2'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span>
                      {format(
                        new Date(webinar.scheduledDate),
                        'EEEE, MMM d, yyyy'
                      )}
                    </span>
                  </div>
                  <div className='flex items-center text-sm text-gray-600 mb-2'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span>
                      {format(new Date(webinar.scheduledDate), 'h:mm a')} (
                      {getTimezoneDisplay(webinar.timezone)})
                    </span>
                  </div>
                  <div className='flex items-center text-sm text-gray-600 mb-4'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                      />
                    </svg>
                    <span>Online event</span>
                  </div>
                </div>

                {/* Add to Calendar */}
                <div className='mb-6'>
                  <div className='relative'>
                    <select
                      onChange={e => {
                        const url = generateCalendarUrl(e.target.value as any);
                        if (url !== '#') window.open(url, '_blank');
                      }}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    >
                      <option value=''>Add to calendar</option>
                      <option value='google'>Google Calendar</option>
                      <option value='outlook'>Outlook</option>
                      <option value='yahoo'>Yahoo Calendar</option>
                      <option value='ics'>iCal / Apple Calendar</option>
                    </select>
                  </div>
                </div>

                {/* RSVP Button */}
                <div className='mb-6'>
                  {hasRSVPed ? (
                    <button
                      disabled
                      className='w-full bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed'
                    >
                      You&apos;re going!
                    </button>
                  ) : session ? (
                    <button
                      onClick={handleRSVP}
                      disabled={rsvpLoading || webinar.status !== 'published'}
                      className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200'
                    >
                      {rsvpLoading ? 'RSVPing...' : 'RSVP for Free'}
                    </button>
                  ) : (
                    <button
                      onClick={handleRSVP}
                      className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200'
                    >
                      RSVP (Login Required)
                    </button>
                  )}
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 mb-6'
                >
                  Share
                </button>

                {/* Attendee Count */}
                <div className='border-t pt-4'>
                  <p className='text-sm text-gray-600 mb-3'>
                    Attendees ({webinar._count.rsvps})
                  </p>
                  <div className='flex -space-x-2'>
                    {Array.from(
                      { length: Math.min(webinar._count.rsvps, 6) },
                      (_, i) => (
                        <div
                          key={i}
                          className='w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600'
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      )
                    )}
                    {webinar._count.rsvps > 6 && (
                      <div className='w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600'>
                        +{webinar._count.rsvps - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Sharing Modal */}
      {showShareModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Share this event
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-3'>
              <button
                onClick={() => {
                  window.open(
                    `https://nextdoor.com/share?text=${encodeURIComponent(webinar.title)}&url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                  setShowShareModal(false);
                }}
                className='w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-white text-sm font-bold'>N</span>
                </div>
                <span className='text-gray-900'>Nextdoor</span>
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                  setShowShareModal(false);
                }}
                className='w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-white text-sm font-bold'>f</span>
                </div>
                <span className='text-gray-900'>Facebook</span>
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(webinar.title)}&url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                  setShowShareModal(false);
                }}
                className='w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-white text-sm font-bold'>t</span>
                </div>
                <span className='text-gray-900'>Twitter</span>
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                  setShowShareModal(false);
                }}
                className='w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-white text-sm font-bold'>in</span>
                </div>
                <span className='text-gray-900'>LinkedIn</span>
              </button>

              <button
                onClick={() => {
                  window.open(
                    `mailto:?subject=${encodeURIComponent(webinar.title)}&body=${encodeURIComponent(`Check out this webinar: ${window.location.href}`)}`
                  );
                  setShowShareModal(false);
                }}
                className='w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3'>
                  <svg
                    className='w-4 h-4 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <span className='text-gray-900'>Email</span>
              </button>

              <button
                onClick={() => {
                  copyToClipboard();
                  setShowShareModal(false);
                }}
                className='w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3'>
                  <svg
                    className='w-4 h-4 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <span className='text-gray-900'>Copy link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
