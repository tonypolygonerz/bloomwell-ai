import Link from 'next/link';

export default function ParallaxSections(): React.ReactElement {
  return (
    <>
      {/* Grant Database Feature */}
      <section className='min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex items-center relative overflow-hidden'>
        <div className='absolute inset-0 bg-green-100 opacity-20 transform scale-110'></div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
          <div className='order-2 lg:order-1 animate-slide-in-left'>
            <div className='bg-white p-8 rounded-3xl shadow-2xl'>
              <div className='text-6xl font-bold text-green-600 mb-4'>
                <span className='counter' data-target='907'>
                  0
                </span>
              </div>
              <p className='text-2xl text-gray-700 mb-6'>
                active grants accepting applications
              </p>
              <h3 className='text-3xl font-bold text-gray-900 mb-6'>
                Comprehensive Grant Database
              </h3>
              <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                Our AI-powered system continuously updates our database with the
                latest federal grant opportunities. Advanced filtering and
                matching algorithms help you find grants that align perfectly
                with your organization&apos;s mission, programs, and funding
                needs.
              </p>
              <Link
                href='/chat?prompt=find-grants'
                className='inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors'
              >
                Search Grants Now
                <svg
                  className='ml-2 w-5 h-5'
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
              </Link>
            </div>
          </div>
          <div className='order-1 lg:order-2 animate-slide-in-right'>
            <div className='relative'>
              <div className='bg-white p-6 rounded-2xl shadow-xl'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  </div>
                  <div className='bg-gray-100 p-4 rounded-lg'>
                    <div className='space-y-3'>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                      <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                      <div className='h-4 bg-green-200 rounded w-2/3'></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Feature */}
      <section className='min-h-screen bg-gradient-to-l from-blue-50 to-sky-50 flex items-center relative overflow-hidden'>
        <div className='absolute inset-0 bg-blue-100 opacity-20 transform scale-110'></div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
          <div className='order-1 animate-slide-in-left'>
            <div className='relative'>
              <div className='bg-white p-6 rounded-2xl shadow-xl'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  </div>
                  <div className='space-y-3'>
                    <div className='bg-green-100 p-3 rounded-lg ml-8'>
                      <p className='text-sm text-gray-700'>
                        How do I write a compelling grant proposal?
                      </p>
                    </div>
                    <div className='bg-white border p-3 rounded-lg'>
                      <p className='text-sm text-gray-700'>
                        Here are the key elements of a successful grant
                        proposal...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='order-2 animate-slide-in-right'>
            <div className='bg-white p-8 rounded-3xl shadow-2xl'>
              <h3 className='text-3xl font-bold text-gray-900 mb-4'>
                Get answers in seconds, not hours
              </h3>
              <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                Our specialized AI assistant is trained on nonprofit best
                practices, grant writing guidelines, and board governance
                principles. Get instant, accurate answers to your questions
                about fundraising, compliance, program development, and more.
              </p>
              <Link
                href='/chat'
                className='inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors'
              >
                Try AI Assistant
                <svg
                  className='ml-2 w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Platform Feature */}
      <section className='min-h-screen bg-gradient-to-r from-purple-50 to-violet-50 flex items-center relative overflow-hidden'>
        <div className='absolute inset-0 bg-purple-100 opacity-20 transform scale-110'></div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
          <div className='order-2 lg:order-1 animate-slide-in-left'>
            <div className='bg-white p-8 rounded-3xl shadow-2xl'>
              <h3 className='text-3xl font-bold text-gray-900 mb-4'>
                Learn from experts, implement immediately
              </h3>
              <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                Join our monthly webinars featuring nonprofit leaders, grant
                writing experts, and industry professionals. Each session
                includes actionable insights, templates, and resources you can
                use immediately to strengthen your organization.
              </p>
              <Link
                href='/webinars'
                className='inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors'
              >
                Browse Webinars
                <svg
                  className='ml-2 w-5 h-5'
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
              </Link>
            </div>
          </div>
          <div className='order-1 lg:order-2 animate-slide-in-right'>
            <div className='relative'>
              <div className='bg-white p-6 rounded-2xl shadow-xl'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  </div>
                  <div className='bg-gray-100 p-4 rounded-lg'>
                    <div className='space-y-3'>
                      <div className='h-4 bg-purple-200 rounded w-full'></div>
                      <div className='h-4 bg-purple-200 rounded w-3/4'></div>
                      <div className='h-4 bg-purple-200 rounded w-5/6'></div>
                      <div className='h-4 bg-purple-200 rounded w-2/3'></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
