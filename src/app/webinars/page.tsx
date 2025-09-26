import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'Upcoming Webinars for Nonprofit Leaders | Bloomwell AI',
  description:
    'Expert-led webinar sessions to help your nonprofit organization thrive. Learn from industry leaders and connect with peers in grant writing, board governance, fundraising, and more.',
  keywords:
    'webinar, nonprofit, training, education, grant writing, board governance, fundraising, operations, strategic planning',
  authors: [{ name: 'Bloomwell AI' }],
  creator: 'Bloomwell AI',
  publisher: 'Bloomwell AI',
  openGraph: {
    title: 'Upcoming Webinars for Nonprofit Leaders',
    description:
      'Expert-led sessions to help your organization thrive. Learn from industry leaders and connect with peers.',
    url: `${process.env.NEXTAUTH_URL}/webinars`,
    siteName: 'Bloomwell AI',
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/images/webinar-listing.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bloomwell AI Webinars',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upcoming Webinars for Nonprofit Leaders',
    description:
      'Expert-led sessions to help your organization thrive. Learn from industry leaders and connect with peers.',
    images: [`${process.env.NEXTAUTH_URL}/images/webinar-listing.jpg`],
    creator: '@bloomwellai',
    site: '@bloomwellai',
  },
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL}/webinars`,
  },
};

async function getWebinars() {
  try {
    const webinars = await prisma.webinar.findMany({
      where: {
        status: 'published',
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return webinars.map(webinar => ({
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      scheduledDate: webinar.scheduledDate.toISOString(),
      timezone: webinar.timezone,
      duration: webinar.duration,
      thumbnailUrl: webinar.thumbnailUrl,
      slug: webinar.slug || webinar.uniqueSlug,
      status: webinar.status,
      rsvpCount: webinar._count.rsvps,
      maxAttendees: webinar.maxAttendees,
      categories: webinar.categories ? JSON.parse(webinar.categories) : [],
      guestSpeakers: webinar.guestSpeakers
        ? JSON.parse(webinar.guestSpeakers)
        : [],
      materials: webinar.materials ? JSON.parse(webinar.materials) : [],
      jitsiRoomUrl: webinar.jitsiRoomUrl,
      metaDescription: webinar.metaDescription,
      socialImageUrl: webinar.socialImageUrl,
    }));
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return [];
  }
}

export default async function WebinarsPage() {
  const webinars = await getWebinars();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              Upcoming Webinars for Nonprofit Leaders
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Expert-led sessions to help your organization thrive. Learn from
              industry leaders and connect with peers.
            </p>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Calendar Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm border p-6 sticky top-6'>
              {/* Calendar */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    September 2025
                  </h3>
                  <div className='flex space-x-1'>
                    <button className='p-1 hover:bg-gray-100 rounded'>
                      <svg
                        className='w-4 h-4 text-gray-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 19l-7-7 7-7'
                        />
                      </svg>
                    </button>
                    <button className='p-1 hover:bg-gray-100 rounded'>
                      <svg
                        className='w-4 h-4 text-gray-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className='grid grid-cols-7 gap-1 mb-2'>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div
                      key={day}
                      className='text-center text-sm font-medium text-gray-500 py-2'
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className='grid grid-cols-7 gap-1'>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      className={`text-center py-2 text-sm rounded hover:bg-gray-100 ${
                        day === 20 ? 'bg-green-500 text-white' : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Your Next Events */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Your next events
                  </h3>
                  <a
                    href='#'
                    className='text-sm text-green-600 hover:text-green-700'
                  >
                    View all
                  </a>
                </div>

                {webinars.length > 0 ? (
                  <div className='space-y-3'>
                    {webinars.slice(0, 3).map(webinar => (
                      <div
                        key={webinar.id}
                        className='flex items-start space-x-3'
                      >
                        <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs text-gray-500 uppercase tracking-wide'>
                            {new Date(webinar.scheduledDate).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}{' '}
                            -{' '}
                            {new Date(webinar.scheduledDate).toLocaleTimeString(
                              'en-US',
                              {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              }
                            )}
                          </p>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {webinar.title}
                          </p>
                          <p className='text-xs text-gray-500'>Bloomwell AI</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-gray-500'>No upcoming events</p>
                )}
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className='lg:col-span-3'>
            {webinars.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border p-12 text-center'>
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
                  <WebinarEventCard key={webinar.id} webinar={webinar} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WebinarEventCard({ webinar }: { webinar: any }) {
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
    <div className='bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200'>
      <div className='flex'>
        {/* Image */}
        <div className='w-48 h-32 flex-shrink-0'>
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
