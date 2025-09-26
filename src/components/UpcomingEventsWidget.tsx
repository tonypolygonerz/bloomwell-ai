'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isAfter, isBefore, subMinutes } from 'date-fns';

interface WebinarRSVP {
  id: string;
  rsvpDate: string;
  webinar: {
    id: string;
    title: string;
    description: string;
    scheduledDate: string;
    duration: number;
    slug: string;
    jitsiRoomUrl?: string;
    thumbnailUrl?: string;
  };
}

interface UpcomingEventsWidgetProps {
  userId: string;
}

export default function UpcomingEventsWidget({
  userId,
}: UpcomingEventsWidgetProps) {
  const [userRSVPs, setUserRSVPs] = useState<WebinarRSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserEvents();
  }, [userId]);

  const fetchUserEvents = async () => {
    try {
      const response = await fetch('/api/user/events');
      if (response.ok) {
        const data = await response.json();
        setUserRSVPs(data.rsvps || []);
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilEvent = (scheduledDate: string) => {
    const now = new Date();
    const eventDate = new Date(scheduledDate);
    const diffMs = eventDate.getTime() - now.getTime();

    if (diffMs < 0) return { status: 'past', text: 'Past event' };

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        status: 'upcoming',
        text: `In ${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`,
      };
    }
    if (diffHours > 0) {
      return {
        status: 'upcoming',
        text: `In ${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`,
      };
    }
    if (diffMinutes > 0) {
      return {
        status: 'soon',
        text: `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`,
      };
    }
    return { status: 'now', text: 'Starting now!' };
  };

  const canJoinEvent = (scheduledDate: string) => {
    const now = new Date();
    const eventDate = new Date(scheduledDate);
    const fifteenMinutesBefore = subMinutes(eventDate, 15);

    return isAfter(now, fifteenMinutesBefore);
  };

  const getJoinButtonText = (scheduledDate: string) => {
    const now = new Date();
    const eventDate = new Date(scheduledDate);

    if (isBefore(now, eventDate)) {
      return 'Join Live (15 min before)';
    }
    return 'Join Live';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'past':
        return 'text-gray-500';
      case 'upcoming':
        return 'text-blue-600';
      case 'soon':
        return 'text-orange-600';
      case 'now':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-semibold mb-4'>My Upcoming Events</h3>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-2/3'></div>
        </div>
      </div>
    );
  }

  const upcomingEvents = userRSVPs
    .filter(rsvp => isAfter(new Date(rsvp.webinar.scheduledDate), new Date()))
    .sort(
      (a, b) =>
        new Date(a.webinar.scheduledDate).getTime() -
        new Date(b.webinar.scheduledDate).getTime()
    );

  if (upcomingEvents.length === 0) {
    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-semibold mb-4'>My Upcoming Events</h3>
        <div className='text-center py-8'>
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
          <h4 className='mt-2 text-sm font-medium text-gray-900'>
            No upcoming events
          </h4>
          <p className='mt-1 text-sm text-gray-500'>
            RSVP to webinars to see them here.
          </p>
          <div className='mt-4'>
            <Link
              href='/webinars'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200'
            >
              Browse Webinars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold'>My Upcoming Events</h3>
        <Link
          href='/webinars'
          className='text-sm text-indigo-600 hover:text-indigo-500'
        >
          View All
        </Link>
      </div>

      <div className='space-y-4'>
        {upcomingEvents.slice(0, 3).map(rsvp => {
          const timeInfo = getTimeUntilEvent(rsvp.webinar.scheduledDate);
          const canJoin = canJoinEvent(rsvp.webinar.scheduledDate);

          return (
            <div
              key={rsvp.id}
              className='border-b border-gray-200 last:border-b-0 pb-4 last:pb-0'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <Link
                    href={`/webinar/${rsvp.webinar.slug}`}
                    className='block'
                  >
                    <h4 className='font-medium text-gray-900 hover:text-indigo-600 transition-colors'>
                      {rsvp.webinar.title}
                    </h4>
                  </Link>
                  <p className='text-sm text-gray-600 mt-1'>
                    {format(
                      new Date(rsvp.webinar.scheduledDate),
                      'MMM d, yyyy • h:mm a'
                    )}
                  </p>
                  <div className='flex items-center mt-2'>
                    <span
                      className={`text-sm font-medium ${getStatusColor(timeInfo.status)}`}
                    >
                      {timeInfo.text}
                    </span>
                  </div>
                </div>

                <div className='ml-4 flex flex-col items-end space-y-2'>
                  {canJoin && rsvp.webinar.jitsiRoomUrl && (
                    <a
                      href={rsvp.webinar.jitsiRoomUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700'
                    >
                      {getJoinButtonText(rsvp.webinar.scheduledDate)}
                    </a>
                  )}

                  <div className='flex space-x-1'>
                    <button
                      onClick={() => {
                        const startDate = new Date(rsvp.webinar.scheduledDate);
                        const endDate = new Date(
                          startDate.getTime() +
                            rsvp.webinar.duration * 60 * 1000
                        );

                        const icsContent = [
                          'BEGIN:VCALENDAR',
                          'VERSION:2.0',
                          'PRODID:-//Bloomwell AI//Webinar//EN',
                          'BEGIN:VEVENT',
                          `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                          `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                          `SUMMARY:${rsvp.webinar.title}`,
                          `DESCRIPTION:${rsvp.webinar.description}`,
                          `LOCATION:${rsvp.webinar.jitsiRoomUrl || 'Online Event'}`,
                          `URL:${window.location.origin}/webinar/${rsvp.webinar.slug}`,
                          'END:VEVENT',
                          'END:VCALENDAR',
                        ].join('\r\n');

                        const blob = new Blob([icsContent], {
                          type: 'text/calendar',
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${rsvp.webinar.slug}.ics`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className='text-gray-400 hover:text-gray-600'
                      title='Add to calendar'
                    >
                      <svg
                        className='w-4 h-4'
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
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {upcomingEvents.length > 3 && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <Link
            href='/webinars'
            className='text-sm text-indigo-600 hover:text-indigo-500'
          >
            View {upcomingEvents.length - 3} more events →
          </Link>
        </div>
      )}
    </div>
  );
}
