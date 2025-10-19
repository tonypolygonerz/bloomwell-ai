'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import UpgradeButton from './UpgradeButton';
import { usePricing } from '@/shared/contexts/PricingContext';

const PricingCard = React.memo(function PricingCard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
  const { isAnnual } = usePricing();

  const monthlyPrice = 24.99;
  const annualPrice = 20.99;
  const annualTotal = 251.88;

  // Get Stripe price IDs from environment variables (memoized)
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL;

  // Memoize the selected price ID to prevent unnecessary re-renders
  const selectedPriceId = useMemo(
    () => (isAnnual ? annualPriceId : monthlyPriceId),
    [isAnnual, annualPriceId, monthlyPriceId]
  );

  const selectedPlanType = useMemo(
    () => (isAnnual ? 'annual' : 'monthly') as 'annual' | 'monthly',
    [isAnnual]
  );

  return (
    <div className='flex justify-center'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
        {/* Plan Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6'>
          <h2 className='text-2xl font-bold text-white text-center'>
            Bloomwell AI Professional
          </h2>
          <p className='text-green-100 text-center mt-2'>
            Everything your nonprofit needs to secure funding
          </p>
        </div>

        {/* Price Display */}
        <div className='px-8 py-8 text-center'>
          <div className='mb-4'>
            <span className='text-5xl font-bold text-gray-900'>
              ${isAnnual ? annualPrice.toFixed(2) : monthlyPrice.toFixed(2)}
            </span>
            <span className='text-lg text-gray-500 ml-1'>/month</span>
          </div>

          {isAnnual && (
            <p className='text-sm text-gray-500 mb-6'>
              billed annually at ${annualTotal.toFixed(2)}
            </p>
          )}

          {/* CTA Button */}
          {session?.user ? (
            // Show upgrade button for logged-in users
            <UpgradeButton
              priceId={selectedPriceId}
              planType={selectedPlanType}
              label={`Upgrade to ${isAnnual ? 'Annual' : 'Monthly'} Plan`}
              className='w-full py-4 px-6 rounded-xl font-semibold'
            />
          ) : (
            // Show trial signup for new users
            <Link
              href='/auth/register'
              className='block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg'
            >
              Start 14-Day Free Trial
            </Link>
          )}

          <p className='text-sm text-gray-500 mt-3'>
            {session?.user
              ? 'Secure checkout with Stripe'
              : 'No credit card required'}
          </p>
        </div>

        {/* Features Preview */}
        <div className='px-8 pb-8'>
          <ul className='space-y-3'>
            <li className='flex items-center text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500 mr-3 flex-shrink-0'
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
              73,000+ Federal Grants Database
            </li>
            <li className='flex items-center text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500 mr-3 flex-shrink-0'
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
              Unlimited AI Chat & Projects
            </li>
            <li className='flex items-center text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500 mr-3 flex-shrink-0'
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
              All Webinars & Resources
            </li>
            <li className='flex items-center text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500 mr-3 flex-shrink-0'
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
              Email Support & Training
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default PricingCard;
