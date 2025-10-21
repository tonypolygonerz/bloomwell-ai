import { HeroSkeleton } from './components/Skeleton'

/**
 * Global loading component for Next.js Suspense
 * Shown while page content is loading
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <HeroSkeleton />

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

