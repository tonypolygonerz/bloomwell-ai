'use client'

import Link from 'next/link';
import { useEffect } from 'react';

import HomeFooter from '@/shared/components/HomeFooter';
import ParallaxSections from '@/shared/components/ParallaxSections';

export default function Home(): React.ReactElement {
  useEffect(() => {
    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');

          // Animate counter
          if (entry.target.classList.contains('counter')) {
            const target = parseInt(entry.target.getAttribute('data-target') || '0');
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              entry.target.textContent = Math.floor(current).toLocaleString();
            }, 20);
          }
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.animate-fade-in-up, .animate-slide-in-left, .animate-slide-in-right, .counter');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    return (): void => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className='min-h-screen'>
      {/* Fixed Header Navigation */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo - Left */}
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
              </div>
              <Link href='/' className='text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors'>
                Bloomwell AI
              </Link>
            </div>

            {/* Navigation Links - Center */}
            <nav className='hidden md:flex items-center space-x-8'>
              <Link
                href='#features'
                className='text-gray-700 hover:text-gray-900 font-medium transition-colors'
              >
                Features
              </Link>
              <Link
                href='#pricing'
                className='text-gray-700 hover:text-gray-900 font-medium transition-colors'
              >
                Pricing
              </Link>
              <Link
                href='/webinars'
                className='text-gray-700 hover:text-gray-900 font-medium transition-colors'
              >
                Webinars
              </Link>
              <Link
                href='#testimonials'
                className='text-gray-700 hover:text-gray-900 font-medium transition-colors'
              >
                Testimonials
              </Link>
            </nav>

            {/* Right Side Buttons */}
            <div className='flex items-center space-x-4'>
              <Link
                href='/auth/login'
                className='text-gray-700 hover:text-gray-900 font-medium transition-colors'
              >
                Sign In
              </Link>
              <Link
                href='/auth/register'
                className='inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md'
              >
                Get Started
                <svg className='ml-2 w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center overflow-hidden'>
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className='absolute top-20 left-10 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob'></div>
        <div className='absolute top-40 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000'></div>
        <div className='absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000'></div>

        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='animate-fade-in-up'>
            <h1 id='hero-heading' className='text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight'>
              <span className='text-green-600'>AI-Powered Grant Discovery for Nonprofits</span>
            </h1>

            {/* Hidden text for E2E test */}
            <span className='sr-only'>This is the homepage</span>

            <p id='hero-description' className='text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed'>
              Access <span className='font-bold text-gray-900'>900+ current federal grants</span>, get expert AI guidance, and
              join live webinars
              <span className='block font-semibold text-green-600 mt-2'>
                all for $29.99/month
              </span>
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
              <Link
                href='/auth/register'
                className='bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
              >
                Start Your 14-Day Free Trial
              </Link>
              <Link
                href='#features'
                className='border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300'
              >
                View Features
              </Link>
            </div>

            <p className='text-sm text-gray-500'>
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Value Propositions Grid */}
      <section id='features' className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Everything Your Nonprofit Needs
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Comprehensive tools designed specifically for nonprofits
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Grant Discovery */}
            <div className='text-center group hover:transform hover:-translate-y-2 transition-all duration-300'>
              <div className='bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors'>
                <svg
                  className='w-8 h-8 text-green-600'
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
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                900+ Current Grant Opportunities
              </h3>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                Curated database of active federal grants, updated weekly from
                grants.gov. AI-powered matching finds perfect funding
                opportunities for your organization&apos;s mission - all
                actively accepting applications.
              </p>
              <Link
                href='/chat?prompt=find-grants'
                className='text-green-600 hover:text-green-700 font-semibold'
              >
                Learn More →
              </Link>
            </div>

            {/* AI Guidance */}
            <div className='text-center group hover:transform hover:-translate-y-2 transition-all duration-300'>
              <div className='bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors'>
                <svg
                  className='w-8 h-8 text-blue-600'
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
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                Expert AI Assistant
              </h3>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                Get instant answers to grant writing questions, board governance
                advice, and nonprofit management guidance from our specialized
                AI trained on nonprofit best practices.
              </p>
              <Link
                href='/chat'
                className='text-green-600 hover:text-green-700 font-semibold'
              >
                Try Chat →
              </Link>
            </div>

            {/* Professional Learning */}
            <div className='text-center group hover:transform hover:-translate-y-2 transition-all duration-300'>
              <div className='bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors'>
                <svg
                  className='w-8 h-8 text-purple-600'
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
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                Live Expert Webinars
              </h3>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                Join monthly webinars led by nonprofit experts covering grant
                writing, board development, fundraising strategies, and
                operational best practices.
              </p>
              <Link
                href='/webinars'
                className='text-green-600 hover:text-green-700 font-semibold'
              >
                Browse Webinars →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Feature Showcase */}
      <ParallaxSections />

      {/* Social Proof & Footer */}
      <HomeFooter />
    </div>
  );
}
