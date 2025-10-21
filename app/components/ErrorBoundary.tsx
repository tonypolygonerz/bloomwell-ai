'use client'

import Link from 'next/link'
import React, { Component, ErrorInfo, ReactNode } from 'react'

import { trackConversion } from '../lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Enterprise-grade Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to analytics
    trackConversion('error_boundary_triggered', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
      label: `Error: ${error.message}`,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Send to error tracking service
    this.reportError(error, errorInfo)
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send to your error tracking service (e.g., Sentry, LogRocket)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })
    } catch (e) {
      // Silently fail - don't break the app further
      console.error('Failed to report error:', e)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. The error has been reported to our team.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded text-left">
                <p className="text-sm font-mono text-red-600 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Reload Page
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Need help?{' '}
              <a href="/contact" className="text-green-600 hover:text-green-700 font-semibold">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional wrapper for easier use
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

