import Link from 'next/link';
import PricingToggle from '@/components/PricingToggle';
import PricingCard from '@/components/PricingCard';
import FeaturesGrid from '@/components/FeaturesGrid';
import ROICalculator from '@/components/ROICalculator';
import CompetitiveComparison from '@/components/CompetitiveComparison';
import FAQSection from '@/components/FAQSection';
import HomeFooter from '@/components/HomeFooter';
import { PricingProvider } from '@/contexts/PricingContext';

export const metadata = {
  title: 'Transparent Pricing Built for Nonprofits | Bloomwell AI',
  description:
    'Professional grant discovery tools for nonprofits under $3M budget. Start your 14-day free trial with no credit card required.',
  keywords:
    'nonprofit pricing, grant writing tools, AI assistant, webinar access, transparent pricing',
};

export default function PricingPage() {
  return (
    <PricingProvider>
      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <section className='relative pt-12 pb-6 bg-gradient-to-br from-gray-50 to-white overflow-hidden'>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
              Transparent Pricing
              <span className='block text-green-600'>Built for Nonprofits</span>
            </h1>

            <p className='text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed'>
              Access professional grant tools without consultant fees.
              <span className='block font-semibold text-green-600'>
                One plan, unlimited possibilities.
              </span>
            </p>

            {/* Monthly/Annual Toggle */}
            <PricingToggle />
          </div>
        </section>

        {/* Main Pricing Card */}
        <section className='pt-6 pb-8 bg-white'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <PricingCard />
          </div>
        </section>

        {/* Features Grid */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <FeaturesGrid />
          </div>
        </section>

        {/* ROI Calculator */}
        <section className='py-20 bg-gradient-to-r from-green-50 to-emerald-50'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <ROICalculator />
          </div>
        </section>

        {/* Competitive Comparison */}
        <section className='py-20 bg-white'>
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
            <CompetitiveComparison />
          </div>
        </section>

        {/* FAQ Section */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <FAQSection />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className='py-20 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden'>
          <div className='absolute inset-0 bg-green-700 opacity-20'></div>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              Ready to find your next grant?
            </h2>
            <p className='text-xl text-green-100 mb-8 max-w-2xl mx-auto'>
              Join hundreds of nonprofits already securing funding with
              Bloomwell AI
            </p>
            <Link
              href='/auth/register'
              className='inline-flex items-center bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
            >
              Start Your Free Trial Today
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
            <p className='text-green-100 text-sm mt-4'>
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <HomeFooter />
      </div>
    </PricingProvider>
  );
}
