'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import ProgressiveRegistrationForm from '@/components/auth/ProgressiveRegistrationForm';
import {
  CheckCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

function RegistrationContent() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50'>
      <div className='flex min-h-screen'>
        {/* Left Side: Value Proposition */}
        <div className='hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex-col justify-between'>
          <div>
            {/* Logo */}
            <Link href='/' className='flex items-center space-x-2'>
              <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center'>
                <SparklesIcon className='h-6 w-6 text-emerald-600' />
              </div>
              <span className='text-2xl font-bold text-white'>
                Bloomwell AI
              </span>
            </Link>

            {/* Headline */}
            <div className='mt-16'>
              <h1 className='text-4xl font-bold text-white leading-tight mb-4'>
                Start your 14-day
                <br />
                free trial
              </h1>
              <p className='text-emerald-100 text-lg leading-relaxed'>
                Join thousands of nonprofits discovering funding opportunities
                with AI-powered grant matching.
              </p>
            </div>

            {/* Benefits */}
            <div className='mt-12 space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center'>
                    <CurrencyDollarIcon className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-lg mb-1'>
                    1,200+ Grant Opportunities
                  </h3>
                  <p className='text-emerald-100 text-sm leading-relaxed'>
                    Access federal and state grants worth billions in funding
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center'>
                    <SparklesIcon className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-lg mb-1'>
                    AI-Powered Matching
                  </h3>
                  <p className='text-emerald-100 text-sm leading-relaxed'>
                    Get personalized grant recommendations based on your mission
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center'>
                    <ClockIcon className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-lg mb-1'>
                    Save Hours Every Week
                  </h3>
                  <p className='text-emerald-100 text-sm leading-relaxed'>
                    Let AI handle research while you focus on writing proposals
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center'>
                    <UserGroupIcon className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-lg mb-1'>
                    Built for Nonprofits
                  </h3>
                  <p className='text-emerald-100 text-sm leading-relaxed'>
                    Designed specifically for organizations under $3M budget
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className='mt-12'>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20'>
              <div className='flex items-center mb-3'>
                <div className='flex -space-x-2'>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className='w-8 h-8 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full border-2 border-white'
                    />
                  ))}
                </div>
                <span className='ml-3 text-white font-medium'>
                  2,000+ nonprofits
                </span>
              </div>
              <p className='text-emerald-100 text-sm italic'>
                &ldquo;Bloomwell AI helped us discover $500K in grants we
                didn&rsquo;t know existed. The AI assistant feels like having a
                dedicated grant researcher.&rdquo;
              </p>
              <p className='text-emerald-200 text-xs mt-2 font-medium'>
                — Sarah M., Executive Director
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className='mt-8 pt-8 border-t border-white/20'>
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-2'>
                <CheckCircleIcon className='h-5 w-5 text-emerald-300' />
                <span className='text-emerald-100 text-sm'>
                  No credit card required
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <CheckCircleIcon className='h-5 w-5 text-emerald-300' />
                <span className='text-emerald-100 text-sm'>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className='flex-1 flex items-center justify-center p-8 lg:p-12'>
          <div className='w-full max-w-md'>
            {/* Mobile Logo */}
            <div className='lg:hidden mb-8'>
              <Link href='/' className='flex items-center space-x-2'>
                <div className='w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center'>
                  <SparklesIcon className='h-6 w-6 text-white' />
                </div>
                <span className='text-2xl font-bold text-gray-900'>
                  Bloomwell AI
                </span>
              </Link>
            </div>

            {/* Form Header */}
            <div className='mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                Create your account
              </h2>
              <p className='text-gray-600'>
                Start discovering grants in under 2 minutes
              </p>
            </div>

            {/* Progressive Form */}
            <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
              <ProgressiveRegistrationForm />
            </div>

            {/* Sign In Link */}
            <p className='mt-6 text-center text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                href='/auth/signin'
                className='font-semibold text-emerald-600 hover:text-emerald-700'
              >
                Sign in
              </Link>
            </p>

            {/* Mobile Benefits (shown on smaller screens) */}
            <div className='lg:hidden mt-8 space-y-4'>
              <div className='flex items-center space-x-3'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-600 flex-shrink-0' />
                <span className='text-sm text-gray-700'>
                  1,200+ federal & state grants
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-600 flex-shrink-0' />
                <span className='text-sm text-gray-700'>
                  AI-powered grant matching
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-600 flex-shrink-0' />
                <span className='text-sm text-gray-700'>
                  14-day free trial, no credit card
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full'></div>
        </div>
      }
    >
      <RegistrationContent />
    </Suspense>
  );
}
