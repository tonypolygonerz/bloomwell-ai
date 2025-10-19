'use client';

import AppLayout from '@/shared/components/layout/AppLayout';
import WebinarCalendar from '@/components/WebinarCalendar';
import WebinarCard from './WebinarCard';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRelativeDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTimeUntilEvent,
} from '@/shared/lib/date-utils';

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  timezone: string;
  duration: number;
  thumbnailUrl: string | null;
  slug: string;
  status: string;
  rsvpCount: number;
  maxAttendees: number | null;
  categories: string[];
  guestSpeakers: any[];
  materials: any[];
  jitsiRoomUrl: string | null;
  metaDescription: string | null;
  socialImageUrl: string | null;
}

interface UserRSVP {
  id: string;
  webinarId: string;
  title: string;
  scheduledDate: string;
  slug: string;
}

interface WebinarsContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webinars: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  isLoading: boolean;
}

const WebinarsContent: React.FC<WebinarsContentProps> = ({
  webinars,
  userRSVPs,
  isAuthenticated,
}: WebinarsContentProps) => {
  return (
    <AppLayout>
      <div className=''>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            Upcoming Webinars for Nonprofit Leaders
          </h1>
          <p className='text-gray-600'>
            Expert-led sessions to help your organization thrive. Learn from
            industry leaders and connect with peers.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Calendar Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-6'>
              {/* Interactive Calendar */}
              <WebinarCalendar
                webinars={webinars.map(w => ({
                  id: w.id,
                  scheduledDate: w.scheduledDate,
                  title: w.title,
                }))}
              />

              {/* Your Next Events */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Your next events
                  </h3>
                  {userRSVPs.length > 3 && (
                    <a
                      href='/dashboard'
                      className='text-sm text-green-600 hover:text-green-700'
                    >
                      View all
                    </a>
                  )}
                </div>

                {userRSVPs.length > 0 ? (
                  <div className='space-y-3'>
                    {userRSVPs.slice(0, 3).map(rsvp => (
                      <a
                        key={rsvp.id}
                        href={`/webinar/${rsvp.slug}`}
                        className='flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors'
                      >
                        <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs text-gray-500 uppercase tracking-wide'>
                            {new Date(rsvp.scheduledDate).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}{' '}
                            -{' '}
                            {new Date(rsvp.scheduledDate).toLocaleTimeString(
                              'en-US',
                              {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              }
                            )}
                          </p>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {rsvp.title}
                          </p>
                          <p className='text-xs text-gray-500'>Bloomwell AI</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-4'>
                    <svg
                      className='mx-auto h-8 w-8 text-gray-400 mb-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <p className='text-sm text-gray-500'>
                      {isAuthenticated
                        ? 'No upcoming events yet'
                        : 'Sign in to RSVP to events'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className='lg:col-span-3'>
            {webinars.length === 0 ? (
              <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center'>
                <svg
                  className='mx-auto h-12 w-12 text-gray-400 mb-4'
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
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No webinars found
                </h3>
                <p className='text-gray-500'>
                  Check back soon for upcoming webinars.
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {webinars.map(webinar => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function WebinarEventCard({ webinar }: { webinar: Webinar }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200'>
      <div className='flex flex-col sm:flex-row'>
        {/* Image */}
        <div className='w-full sm:w-48 h-32 flex-shrink-0'>
          {webinar.thumbnailUrl ? (
            <img
              className='w-full h-full object-cover'
              src={webinar.thumbnailUrl}
              alt={webinar.title}
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center'>
              <svg
                className='w-12 h-12 text-white'
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
        </div>

        {/* Content */}
        <div className='flex-1 p-6'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              {/* Online Event Badge */}
              <div className='flex items-center mb-2'>
                <svg
                  className='w-4 h-4 text-gray-400 mr-2'
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
                <span className='text-sm text-gray-600'>Online Event</span>
              </div>

              {/* Title */}
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                {webinar.title}
              </h3>

              {/* Description */}
              <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                {webinar.description}
              </p>

              {/* Time */}
              <p className='text-sm text-gray-500 mb-2'>
                {formatDate(webinar.scheduledDate)} -{' '}
                {formatTime(webinar.scheduledDate)} PDT
              </p>

              {/* Organizer */}
              <p className='text-sm text-gray-500 mb-4'>
                Bloomwell AI • Nonprofit Training
              </p>

              {/* Attendees */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <div className='flex -space-x-1'>
                    {webinar.guestSpeakers
                      .slice(0, 3)
                      .map((speaker: any, index: number) => (
                        <div
                          key={index}
                          className='w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600'
                          title={`${speaker.firstName} ${speaker.lastName}`}
                        >
                          {speaker.firstName.charAt(0).toUpperCase()}
                        </div>
                      ))}
                  </div>
                  <span className='text-sm text-gray-600'>
                    {webinar.rsvpCount} attending
                  </span>
                </div>

                {/* Actions */}
                <div className='flex items-center space-x-4'>
                  <button className='text-gray-400 hover:text-gray-600'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                      />
                    </svg>
                  </button>
                  <button className='text-gray-400 hover:text-gray-600'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                      />
                    </svg>
                  </button>
                  <a
                    href={`/webinar/${webinar.slug}`}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
