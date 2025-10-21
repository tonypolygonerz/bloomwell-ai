/**
 * Analytics and tracking utilities for performance monitoring and user behavior
 */

interface PerformanceEntryLCP extends PerformanceEntry {
  renderTime?: number
  loadTime?: number
}

interface PerformanceEntryFID extends PerformanceEntry {
  processingStart: number
  startTime: number
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

// Track conversion events
export const trackConversion = (eventName: string, data?: Record<string, string | number>) => {
  if (typeof window === 'undefined') return

  // Google Analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, {
      ...data,
      event_category: 'conversion',
      event_label: data?.label || eventName,
    })
  }

  // Custom analytics endpoint
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    }).catch(() => {
      // Silently fail - don't break user experience
    })
  } catch {
    // Silently fail
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return

  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    })
  }
}

// Track scroll depth
export const initScrollDepthTracking = () => {
  if (typeof window === 'undefined') return

  const scrollDepths = [25, 50, 75, 100]
  const triggered: Record<number, boolean> = {}

  const handleScroll = () => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY || window.pageYOffset
    const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100

    scrollDepths.forEach((depth) => {
      if (scrollPercentage >= depth && !triggered[depth]) {
        triggered[depth] = true
        trackConversion('scroll_depth', {
          depth: `${depth}%`,
          label: `Scrolled ${depth}%`,
        })
      }
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

// Track time on page
export const initTimeOnPageTracking = () => {
  if (typeof window === 'undefined') return

  const startTime = Date.now()

  const trackTimeOnPage = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000) // in seconds
    trackConversion('time_on_page', {
      duration: timeSpent,
      label: `${timeSpent}s`,
    })
  }

  // Track when user leaves
  window.addEventListener('beforeunload', trackTimeOnPage)

  // Also track at intervals for engaged users
  const intervals = [30, 60, 120, 300] // 30s, 1m, 2m, 5m
  const timers = intervals.map((seconds) =>
    setTimeout(() => {
      trackConversion('engaged_user', {
        duration: seconds,
        label: `${seconds}s`,
      })
    }, seconds * 1000)
  )

  return () => {
    window.removeEventListener('beforeunload', trackTimeOnPage)
    timers.forEach((timer) => clearTimeout(timer))
  }
}

// Track CTA clicks
export const trackCTAClick = (ctaName: string, location: string) => {
  trackConversion('cta_click', {
    cta_name: ctaName,
    location,
    label: `${ctaName} - ${location}`,
  })
}

// Track trial signups
export const trackTrialSignup = (source: string) => {
  trackConversion('trial_signup', {
    source,
    label: `Trial signup from ${source}`,
    value: 1,
  })
}

// Track feature interactions
export const trackFeatureInteraction = (feature: string, action: string) => {
  trackConversion('feature_interaction', {
    feature,
    action,
    label: `${feature} - ${action}`,
  })
}

// Performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined' || !window.performance) return

  // Wait for page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      const connectTime = perfData.responseEnd - perfData.requestStart
      const renderTime = perfData.domComplete - perfData.domLoading

      // Track Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries() as PerformanceEntryLCP[]
            const lastEntry = entries[entries.length - 1]
            const lcp = lastEntry.renderTime || lastEntry.loadTime

            trackConversion('web_vital_lcp', {
              value: Math.round(lcp),
              label: `LCP: ${Math.round(lcp)}ms`,
            })
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch {
          // Silently fail
        }

        // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries() as PerformanceEntryFID[]
            entries.forEach((entry) => {
              const fid = entry.processingStart - entry.startTime

              trackConversion('web_vital_fid', {
                value: Math.round(fid),
                label: `FID: ${Math.round(fid)}ms`,
              })
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })
        } catch {
          // Silently fail
        }

        // Cumulative Layout Shift
        try {
          let clsValue = 0
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as LayoutShiftEntry[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            }
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })

          // Report after 5 seconds
          setTimeout(() => {
            trackConversion('web_vital_cls', {
              value: Math.round(clsValue * 1000),
              label: `CLS: ${clsValue.toFixed(3)}`,
            })
          }, 5000)
        } catch {
          // Silently fail
        }
      }

      // Track basic performance metrics
      trackConversion('performance_metrics', {
        page_load_time: pageLoadTime,
        connect_time: connectTime,
        render_time: renderTime,
        label: `Page Load: ${pageLoadTime}ms`,
      })
    }, 0)
  })
}

// Global type declarations for analytics
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

