import { RegisterForm } from '@/components/register-form';

export const metadata = {
  title: 'Start Your Free Trial | Bloomwell AI',
  description:
    'Join hundreds of nonprofits accessing 900+ grants and AI-powered guidance. Start your 14-day free trial today - no credit card required.',
  keywords:
    'nonprofit registration, grant access, AI nonprofit tools, free trial, nonprofit software',
};

export default function RegisterPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Two-column layout: Marketing content + Registration form */}
      <div className='flex min-h-screen'>
        {/* Left Column - Marketing Content */}
        <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden'>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className='relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white'>
            {/* Hero Section */}
            <div className='mb-8'>
              <h1 className='text-4xl xl:text-5xl font-bold mb-4 leading-tight'>
                Start Your
                <span className='block'>14-Day Free Trial</span>
              </h1>
              <p className='text-xl text-green-100 mb-2'>
                No credit card required
              </p>
              <p className='text-lg text-green-200'>
                Join hundreds of nonprofits securing funding with AI-powered
                guidance
              </p>
            </div>

            {/* Key Benefits */}
            <div className='space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold mb-1'>
                    900+ Current Grant Opportunities
                  </h3>
                  <p className='text-green-100'>
                    Access federal grants updated weekly, filtered specifically
                    for nonprofits under $3M budget
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold mb-1'>
                    AI-Powered Nonprofit Guidance
                  </h3>
                  <p className='text-green-100'>
                    Get instant answers to grant questions, program planning,
                    and fundraising strategies
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold mb-1'>
                    Expert-Led Webinars & Training
                  </h3>
                  <p className='text-green-100'>
                    Learn from successful nonprofit leaders on grant writing and
                    organizational growth
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold mb-1'>
                    Save Time, Win More Grants
                  </h3>
                  <p className='text-green-100'>
                    Replace expensive grant consultants with affordable AI tools
                    designed for small nonprofits
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className='mt-12 pt-8 border-t border-white/20'>
              <p className='text-sm text-green-200 mb-3'>
                After your trial, continue for just:
              </p>
              <div className='flex items-baseline space-x-2'>
                <span className='text-4xl font-bold'>$29.99</span>
                <span className='text-xl text-green-100'>/month</span>
              </div>
              <p className='text-sm text-green-200 mt-2'>
                or $209/year (save 42%) • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className='flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12'>
          <div className='w-full max-w-md'>
            {/* Mobile Marketing Header */}
            <div className='lg:hidden mb-8 text-center'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Start Your Free Trial
              </h1>
              <p className='text-gray-600'>
                14 days free • No credit card required
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
