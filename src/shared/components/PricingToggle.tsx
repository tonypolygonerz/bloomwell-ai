'use client';

import React, { useCallback } from 'react';
import { usePricing } from '@/shared/contexts/PricingContext';

const PricingToggle = React.memo(function PricingToggle() {
  const { isAnnual, setIsAnnual } = usePricing();

  const handleToggle = useCallback(() => {
    setIsAnnual(!isAnnual);
  }, [isAnnual, setIsAnnual]);

  return (
    <div className='flex items-center justify-center space-x-4'>
      <span
        className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-green-600' : 'text-gray-500'}`}
      >
        Monthly
      </span>

      <button
        onClick={handleToggle}
        className='relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
        role='switch'
        aria-checked={isAnnual}
        aria-label='Toggle between monthly and annual pricing'
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            isAnnual ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>

      <div className='flex items-center space-x-2'>
        <span
          className={`text-lg font-medium transition-colors ${isAnnual ? 'text-green-600' : 'text-gray-500'}`}
        >
          Annual
        </span>
        {isAnnual && (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-fade-in'>
            Save 16%
          </span>
        )}
      </div>
    </div>
  );
});

export default PricingToggle;
