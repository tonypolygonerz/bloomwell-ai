'use client'

import Link from 'next/link'
import { useState } from 'react'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-xl border border-white/20 bg-white px-8 py-8 shadow-lg backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        </div>

        {!success ? (
          <>
            <p className="mb-6 text-center text-sm text-gray-600">
              Enter your user account's verified email address and we will send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@famlisoul.org"
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-center text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send password reset email'}
                {!loading && (
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-4 text-center">
              <Link href="/auth/login" className="block text-sm font-medium text-gray-700 hover:text-gray-900">
                Back to login
              </Link>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Trouble resetting your password?
                </p>
                <Link href="/chat" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
                  Talk with our chatbot assistant
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Check your email</h3>
            <p className="mb-6 text-sm text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              href="/auth/login"
              className="inline-block rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

