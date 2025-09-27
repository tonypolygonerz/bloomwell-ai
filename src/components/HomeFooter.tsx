import Link from 'next/link';

export default function HomeFooter() {
  return (
    <>
      {/* Social Proof Section */}
      <section className='py-20 bg-gradient-to-br from-gray-50 to-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Trusted by nonprofits nationwide
          </h2>
          <p className='text-xl text-gray-600 mb-16 max-w-2xl mx-auto'>
            Join hundreds of organizations already using Bloomwell AI to secure
            more funding
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='text-4xl mb-4'>⭐</div>
              <p className='text-gray-600 mb-6 italic'>
                &ldquo;Bloomwell AI helped us identify 15 new grant opportunities we
                never would have found. The AI assistant provided invaluable
                guidance for our proposal writing.&rdquo;
              </p>
              <div className='font-semibold text-gray-900'>Sarah Johnson</div>
              <div className='text-sm text-gray-500'>
                Executive Director, Community Health Alliance
              </div>
            </div>

            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='text-4xl mb-4'>⭐</div>
              <p className='text-gray-600 mb-6 italic'>
                &ldquo;The webinar series on board governance transformed our
                organization. We implemented the strategies immediately and saw
                results within months.&rdquo;
              </p>
              <div className='font-semibold text-gray-900'>Michael Chen</div>
              <div className='text-sm text-gray-500'>
                Board President, Youth Development Center
              </div>
            </div>

            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='text-4xl mb-4'>⭐</div>
              <p className='text-gray-600 mb-6 italic'>
                &ldquo;At $29.99/month, Bloomwell AI pays for itself with just one
                successful grant application. The ROI has been incredible for
                our small nonprofit.&rdquo;
              </p>
              <div className='font-semibold text-gray-900'>Lisa Rodriguez</div>
              <div className='text-sm text-gray-500'>
                Development Director, Arts for All
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className='py-20 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden'>
        <div className='absolute inset-0 bg-green-700 opacity-20'></div>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            Ready to secure more funding for your mission?
          </h2>
          <p className='text-xl text-green-100 mb-8'>
            Join hundreds of nonprofits already using Bloomwell AI to discover
            grants, get expert guidance, and grow their impact.
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
      <footer className='bg-gray-900 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {/* Product */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Product</h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='#features'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href='#pricing'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href='/webinars'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link
                    href='/chat'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Grant Database
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Company</h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='#about'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href='#contact'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Contact Form
                  </Link>
                </li>
                <li>
                  <Link
                    href='#privacy'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href='#terms'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Support</h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='#help'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href='#docs'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href='#status'
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    System Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Stay Updated</h3>
              <p className='text-gray-300 mb-4'>
                Get the latest nonprofit insights and updates
              </p>
              <form className='space-y-3'>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500'
                />
                <button
                  type='submit'
                  className='w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  Subscribe
                </button>
              </form>
              <p className='text-xs text-gray-400 mt-2'>
                Future Beehiiv integration
              </p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className='border-t border-gray-800 mt-12 pt-8'>
            <div className='flex flex-col md:flex-row justify-between items-center'>
              <div className='text-gray-400 text-sm mb-4 md:mb-0'>
                © 2025 Polygonerz LLC
              </div>

              <div className='flex items-center space-x-6 text-sm text-gray-400 mb-4 md:mb-0'>
                <span>Built for Nonprofits</span>
                <span>•</span>
                <span>GDPR Compliant</span>
                <span>•</span>
                <span>SOC 2 Secure</span>
              </div>

              <div className='flex items-center space-x-4'>
                <Link
                  href='#linkedin'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                  </svg>
                </Link>
                <Link
                  href='#twitter'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
