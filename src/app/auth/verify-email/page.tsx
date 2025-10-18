'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage if available
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend email functionality
      console.log('Resending email to:', email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/signin');
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center'>
            <EnvelopeIcon className='w-8 h-8 text-emerald-600' />
          </div>
        </div>
        <h2 className='mt-6 text-center text-3xl font-bold text-gray-900'>
          Check your email
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          We&apos;ve sent a verification link to{' '}
          {email && (
            <span className='font-medium text-emerald-600'>{email}</span>
          )}
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <div className='text-center'>
            <CheckCircleIcon className='mx-auto h-12 w-12 text-emerald-500 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Almost there!
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Click the verification link in your email to activate your account
              and start your 14-day free trial.
            </p>

            <div className='space-y-4'>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>

              <button
                onClick={handleBackToLogin}
                className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
              >
                Back to sign in
              </button>
            </div>
          </div>

          <div className='mt-8 border-t border-gray-200 pt-6'>
            <div className='text-center'>
              <p className='text-xs text-gray-500'>
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={handleResendEmail}
                  className='text-emerald-600 hover:text-emerald-500 font-medium'
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
