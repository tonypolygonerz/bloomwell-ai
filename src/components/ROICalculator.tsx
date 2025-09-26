'use client';

import { useState, useEffect } from 'react';

export default function ROICalculator() {
  const [grantAmount, setGrantAmount] = useState(25000);
  const [annualCost] = useState(251.88);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    const calculatedROI = Math.round((grantAmount / annualCost) * 100) / 100;
    setRoi(calculatedROI);
  }, [grantAmount, annualCost]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className='text-center'>
      <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
        See Your Return on Investment
      </h2>
      <p className='text-xl text-gray-600 mb-12 max-w-2xl mx-auto'>
        Calculate how one successful grant can fund years of Bloomwell AI access
      </p>

      <div className='bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto'>
        <div className='mb-8'>
          <label
            htmlFor='grant-amount'
            className='block text-lg font-medium text-gray-700 mb-4'
          >
            Average grant amount:
          </label>
          <div className='relative'>
            <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg'>
              $
            </span>
            <input
              id='grant-amount'
              type='number'
              value={grantAmount}
              onChange={e => setGrantAmount(Number(e.target.value))}
              className='w-full pl-8 pr-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center'
              placeholder='25000'
              min='1000'
              max='1000000'
              step='1000'
            />
          </div>
        </div>

        <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 mb-6'>
          <div className='text-4xl md:text-5xl font-bold text-green-600 mb-2'>
            {formatNumber(roi)}x
          </div>
          <div className='text-lg text-gray-700 mb-4'>
            return on annual investment
          </div>
          <div className='text-sm text-gray-600'>
            One grant typically covers {Math.round(grantAmount / annualCost)}{' '}
            months of Bloomwell AI
          </div>
        </div>

        <div className='text-sm text-gray-500 space-y-2'>
          <div className='flex justify-between'>
            <span>Annual Bloomwell AI cost:</span>
            <span className='font-medium'>${formatNumber(annualCost)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Typical grant amount:</span>
            <span className='font-medium'>${formatNumber(grantAmount)}</span>
          </div>
          <div className='border-t pt-2 flex justify-between font-semibold text-gray-900'>
            <span>ROI Multiple:</span>
            <span>{formatNumber(roi)}x</span>
          </div>
        </div>

        <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
          <p className='text-sm text-blue-800'>
            <strong>Real example:</strong> A $25,000 grant provides a 99x return
            on your annual Bloomwell AI investment. Most nonprofits secure
            multiple grants per year, making the ROI even more significant.
          </p>
        </div>
      </div>
    </div>
  );
}
