'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UpgradeButton from './UpgradeButton';

interface TrialData {
  isActive: boolean;
  daysRemaining: number;
  trialStart: string;
  trialEnd: string;
  subscriptionStatus: string;
  subscriptionType: string | null;
}

interface TrialStatusResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  trial: TrialData;
  hasActiveSubscription: boolean;
  lastActiveDate: string;
}

export default function TrialBanner() {
  const { data: session, status } = useSession();
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    fetchTrialStatus();
  }, [status]);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/user/trial-status');
      if (response.ok) {
        const data: TrialStatusResponse = await response.json();
        setTrialData(data.trial);
      } else {
        setError('Failed to fetch trial status');
      }
    } catch (err) {
      setError('Error fetching trial status');
      console.error('Trial status error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't show banner for unauthenticated users
  if (status === 'unauthenticated' || status === 'loading') {
    return null;
  }

  // Don't show banner if loading or error
  if (loading || error || !trialData) {
    return null;
  }

  // Don't show banner if user has active subscription
  if (!trialData.isActive && trialData.subscriptionStatus === 'ACTIVE') {
    return null;
  }

  // Don't show banner if trial is expired
  if (!trialData.isActive && trialData.daysRemaining === 0) {
    return null;
  }

  // Determine banner color and message based on trial status
  const getBannerStyle = () => {
    if (trialData.daysRemaining <= 3) {
      return {
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        buttonColor: 'bg-white text-red-600 hover:bg-red-50',
      };
    } else if (trialData.daysRemaining <= 7) {
      return {
        bgColor: 'bg-yellow-600',
        textColor: 'text-white',
        buttonColor: 'bg-white text-yellow-600 hover:bg-yellow-50',
      };
    } else {
      return {
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        buttonColor: 'bg-white text-green-600 hover:bg-green-50',
      };
    }
  };

  const bannerStyle = getBannerStyle();

  // Debug logging to verify environment variable
  console.log(
    'TrialBanner - Monthly Price ID:',
    process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
  );

  return (
    <div
      className={`${bannerStyle.bgColor} ${bannerStyle.textColor} py-3 px-4`}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span className='font-semibold'>
              {trialData.daysRemaining > 0
                ? `${trialData.daysRemaining} day${trialData.daysRemaining === 1 ? '' : 's'} remaining in your free trial`
                : 'Your free trial has ended'}
            </span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {trialData.daysRemaining > 0 && (
            <span className='text-sm opacity-90'>
              Upgrade to continue accessing all features
            </span>
          )}
          <UpgradeButton
            priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!}
            planType='monthly'
            label={
              trialData.daysRemaining > 0 ? 'Upgrade Now' : 'Subscribe Now'
            }
            className={`${bannerStyle.buttonColor} px-4 py-2 rounded-lg font-medium transition-colors duration-200`}
          />
        </div>
      </div>
    </div>
  );
}
