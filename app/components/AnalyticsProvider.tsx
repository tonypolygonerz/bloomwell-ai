'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import {
  initPerformanceMonitoring,
  initScrollDepthTracking,
  initTimeOnPageTracking,
  trackPageView,
} from '../lib/analytics'

/**
 * Analytics Provider component that initializes all tracking
 * Should be placed at the root of the application
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(url)
    }
  }, [pathname, searchParams])

  // Initialize tracking on mount
  useEffect(() => {
    // Initialize scroll depth tracking
    const cleanupScroll = initScrollDepthTracking()

    // Initialize time on page tracking
    const cleanupTime = initTimeOnPageTracking()

    // Initialize performance monitoring
    initPerformanceMonitoring()

    // Cleanup on unmount
    return () => {
      cleanupScroll?.()
      cleanupTime?.()
    }
  }, [])

  return <>{children}</>
}

/**
 * Google Analytics Script component
 * Add this to your layout to enable Google Analytics
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  if (!gaId) return null

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  )
}

