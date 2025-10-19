export default function CompetitiveComparison() {
  const bloomwellFeatures = [
    '73,000+ federal grants database',
    'Unlimited AI chat assistance',
    'Live expert webinars',
    'Project organization tools',
    'Email support & training',
    '24/7 platform access',
    'Downloadable resources',
    'No hourly rates or limits',
  ];

  const consultantFeatures = [
    'Limited grant research',
    'Hourly consultation rates',
    'Scheduled meetings only',
    'Manual project tracking',
    'Limited availability',
    'Business hours only',
    'Additional fees for materials',
    '$150-300+ per hour',
  ];

  return (
    <div className='text-center'>
      <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
        Bloomwell AI vs Traditional Consultants
      </h2>
      <p className='text-xl text-gray-600 mb-12 max-w-2xl mx-auto'>
        See how our AI-powered platform compares to traditional consulting
        services
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
        {/* Bloomwell AI */}
        <div className='bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6'>
            <h3 className='text-2xl font-bold text-white mb-2'>Bloomwell AI</h3>
            <div className='text-3xl font-bold text-white'>$251.88</div>
            <div className='text-green-100'>per year</div>
          </div>

          <div className='p-8'>
            <ul className='space-y-4'>
              {bloomwellFeatures.map((feature, index) => (
                <li key={index} className='flex items-start'>
                  <svg
                    className='w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className='text-gray-700'>{feature}</span>
                </li>
              ))}
            </ul>

            <div className='mt-8 p-4 bg-green-50 rounded-lg'>
              <p className='text-sm text-green-800 font-medium'>
                ✓ Unlimited access • ✓ No additional fees • ✓ AI-powered
                efficiency
              </p>
            </div>
          </div>
        </div>

        {/* Traditional Consultants */}
        <div className='bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6'>
            <h3 className='text-2xl font-bold text-white mb-2'>
              Traditional Consultants
            </h3>
            <div className='text-3xl font-bold text-white'>$15,000+</div>
            <div className='text-gray-300'>per year</div>
          </div>

          <div className='p-8'>
            <ul className='space-y-4'>
              {consultantFeatures.map((feature, index) => (
                <li key={index} className='flex items-start'>
                  <svg
                    className='w-6 h-6 text-gray-400 mr-3 flex-shrink-0 mt-0.5'
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
                  <span className='text-gray-700'>{feature}</span>
                </li>
              ))}
            </ul>

            <div className='mt-8 p-4 bg-red-50 rounded-lg'>
              <p className='text-sm text-red-800 font-medium'>
                ⚠ Limited hours • ⚠ Additional costs • ⚠ Scheduling
                constraints
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8'>
        <h3 className='text-2xl font-bold text-gray-900 mb-4'>
          The Bottom Line
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
          <div>
            <div className='text-3xl font-bold text-green-600 mb-2'>60x</div>
            <div className='text-gray-700'>Less expensive than consultants</div>
          </div>
          <div>
            <div className='text-3xl font-bold text-green-600 mb-2'>24/7</div>
            <div className='text-gray-700'>
              Always available, no scheduling needed
            </div>
          </div>
          <div>
            <div className='text-3xl font-bold text-green-600 mb-2'>
              Unlimited
            </div>
            <div className='text-gray-700'>
              Projects and consultations included
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
