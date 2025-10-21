'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export function RegisterForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOAuth, setShowOAuth] = useState(true)
  const router = useRouter()

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setter(value)
    
    // Hide OAuth section when user starts typing in any field
    if (value.length > 0 && showOAuth) {
      setShowOAuth(false)
    }
    
    // Show OAuth section again if all fields are empty
    if (value.length === 0 && !firstName && !lastName && !email && !password) {
      setShowOAuth(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password }),
      })

      if (response.ok) {
        router.push('/auth/login?message=Registration successful')
      } else {
        const data = await response.json()
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true)
    setError('')
    
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('An error occurred with OAuth sign-in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">Join thousands of nonprofits already using Bloomwell AI</p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm">
        {/* OAuth Buttons - Hidden when user starts typing */}
        {showOAuth && (
          <>
            <div className="space-y-3">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuthSignIn('azure-ad')}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="#00A4EF">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4z"/>
                  <path fill="#FFB900" d="M24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={firstName}
                onChange={handleInputChange(setFirstName)}
                placeholder="First name"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={handleInputChange(setLastName)}
                placeholder="Last name"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={handleInputChange(setPassword)}
              placeholder="Create a password"
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
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
