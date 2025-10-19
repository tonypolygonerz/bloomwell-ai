'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900'>
              Check your email
            </h2>
            <p className='mt-4 text-sm text-gray-600'>
              If an account exists with <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </p>
            <p className='mt-2 text-sm text-gray-600'>
              The link will be valid for 1 hour.
            </p>
          </div>

          <div className='mt-8 space-y-4'>
            <div className='text-center'>
              <Link
                href='/auth/login'
                className='text-sm text-blue-600 hover:text-blue-500 hover:underline'
              >
                Back to sign in
              </Link>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
              <p className='text-sm text-blue-800'>
                <strong>Didn&apos;t receive the email?</strong>
                <br />
                Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className='underline hover:text-blue-600'
                >
                  try again
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900'>
            Forgot your password?
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='sr-only'>
              Email address
            </label>
            <input
              id='email'
              type='email'
              required
              className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
              placeholder='name@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className='rounded-md bg-red-50 p-3'>
              <p className='text-sm text-red-800 text-center'>{error}</p>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <div className='flex items-center'>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                  Sending...
                </div>
              ) : (
                'Send reset link'
              )}
            </button>
          </div>

          <div className='text-center'>
            <Link
              href='/auth/login'
              className='text-sm text-blue-600 hover:text-blue-500 hover:underline'
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
