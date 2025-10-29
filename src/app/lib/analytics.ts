/**
 * Analytics tracking utilities for Bloomwell AI
 * Tracks conversions, CTA clicks, and user engagement
 */

// Track generic conversion events
export function trackConversion(eventName: string, data?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, data)
  }
  // Fallback logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Conversion:', eventName, data)
  }
}

// Track CTA button clicks
export function trackCTAClick(buttonName: string, location: string): void {
  trackConversion('cta_click', {
    button_name: buttonName,
    location,
  })
}

// Track trial signup conversions
export function trackTrialSignup(source: string): void {
  trackConversion('trial_signup', {
    source,
  })
}

// Track feature interactions
export function trackFeatureInteraction(featureName: string, action: string): void {
  trackConversion('feature_interaction', {
    feature_name: featureName,
    action,
  })
}

// Track page views
export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    })
  }
}

// Initialize scroll depth tracking
export function initScrollDepthTracking(): () => void {
  const depths = [25, 50, 75, 100]
  const tracked = new Set<number>()

  const handleScroll = (): void => {
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollPercent = ((scrollTop + windowHeight) / docHeight) * 100

    depths.forEach((depth) => {
      if (scrollPercent >= depth && !tracked.has(depth)) {
        tracked.add(depth)
        trackConversion('scroll_depth', { depth })
      }
    })
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }

  return () => {}
}

// Initialize time on page tracking
export function initTimeOnPageTracking(): () => void {
  const startTime = Date.now()
  const milestones = [30000, 60000, 120000, 300000] // 30s, 1m, 2m, 5m
  const tracked = new Set<number>()

  const interval = setInterval(() => {
    const timeOnPage = Date.now() - startTime

    milestones.forEach((milestone) => {
      if (timeOnPage >= milestone && !tracked.has(milestone)) {
        tracked.add(milestone)
        trackConversion('time_on_page', { seconds: milestone / 1000 })
      }
    })
  }, 5000)

  return () => clearInterval(interval)
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): () => void {
  if (typeof window === 'undefined') return () => {}

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        trackConversion('web_vital_lcp', { value: entry.startTime })
      } else if (entry.entryType === 'first-input') {
        trackConversion('web_vital_fid', { value: (entry as PerformanceEventTiming).processingStart - entry.startTime })
      } else if (entry.entryType === 'layout-shift' && !(entry as LayoutShift).hadRecentInput) {
        trackConversion('web_vital_cls', { value: (entry as LayoutShift).value })
      }
    }
  })

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
  } catch {
    // Browser doesn't support some entry types
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Performance monitoring not fully supported')
    }
  }

  return () => observer.disconnect()
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }

  interface LayoutShift extends PerformanceEntry {
    value: number
    hadRecentInput: boolean
  }
}
